import { usersRepo } from '@/server/repositories/usersRepo';
import { systemsRepo } from '@/server/repositories/systemsRepo';
import { accessGrantsRepo } from '@/server/repositories/accessGrantsRepo';
import { parseCsv, type ParsedCsvRow } from '@/lib/csv/parseCsv';
import type {
  BulkUploadRow,
  BulkUploadResponse,
  ValidRow,
  RowError,
  ValidationResult,
  CreatedGrant,
} from '@/lib/validation/bulkUpload';
import { BulkUploadRowSchema } from '@/lib/validation/bulkUpload';

/**
 * Bulk Upload Service
 * Handles CSV parsing, validation, and batch insertion of access grants.
 */
export const bulkUploadService = {
  /**
   * Process a CSV file content for bulk upload
   */
  async processCsvUpload(
    csvContent: string,
    grantedBy: string
  ): Promise<BulkUploadResponse> {
    // Step 1: Parse CSV
    const parseResult = parseCsv(csvContent);

    if (parseResult.rows.length === 0) {
      return {
        success: false,
        message: 'No valid rows found in CSV',
        summary: {
          totalRows: 0,
          validRows: 0,
          errorRows: 0,
          insertedCount: 0,
        },
        validRows: [],
        errorRows: [],
        parseErrors: parseResult.errors,
      };
    }

    // Step 2: Validate rows
    const validationResult = await this.validateRows(parseResult.rows);

    // Step 3: If any errors, return without inserting
    if (validationResult.errorRows.length > 0) {
      return {
        success: false,
        message: `Validation failed: ${validationResult.errorRows.length} row(s) have errors. No records were inserted.`,
        summary: {
          totalRows: parseResult.rows.length,
          validRows: validationResult.validRows.length,
          errorRows: validationResult.errorRows.length,
          insertedCount: 0,
        },
        validRows: validationResult.validRows,
        errorRows: validationResult.errorRows,
        parseErrors:
          parseResult.errors.length > 0 ? parseResult.errors : undefined,
      };
    }

    // Step 4: Insert all valid rows
    const createdGrants = await this.insertGrants(
      validationResult.validRows,
      grantedBy
    );

    return {
      success: true,
      message: `Successfully created ${createdGrants.length} access grant(s)`,
      summary: {
        totalRows: parseResult.rows.length,
        validRows: validationResult.validRows.length,
        errorRows: 0,
        insertedCount: createdGrants.length,
      },
      validRows: validationResult.validRows,
      errorRows: [],
      createdGrants,
    };
  },

  /**
   * Process JSON rows for bulk upload (alternative to CSV)
   */
  async processJsonUpload(
    rows: BulkUploadRow[],
    grantedBy: string
  ): Promise<BulkUploadResponse> {
    // Validate rows
    const validationResult = await this.validateRows(rows);

    // If any errors, return without inserting
    if (validationResult.errorRows.length > 0) {
      return {
        success: false,
        message: `Validation failed: ${validationResult.errorRows.length} row(s) have errors. No records were inserted.`,
        summary: {
          totalRows: rows.length,
          validRows: validationResult.validRows.length,
          errorRows: validationResult.errorRows.length,
          insertedCount: 0,
        },
        validRows: validationResult.validRows,
        errorRows: validationResult.errorRows,
      };
    }

    // Insert all valid rows
    const createdGrants = await this.insertGrants(
      validationResult.validRows,
      grantedBy
    );

    return {
      success: true,
      message: `Successfully created ${createdGrants.length} access grant(s)`,
      summary: {
        totalRows: rows.length,
        validRows: validationResult.validRows.length,
        errorRows: 0,
        insertedCount: createdGrants.length,
      },
      validRows: validationResult.validRows,
      errorRows: [],
      createdGrants,
    };
  },

  /**
   * Validate all rows and resolve entity references
   */
  async validateRows(
    rows: ParsedCsvRow[] | BulkUploadRow[]
  ): Promise<ValidationResult> {
    const validRows: ValidRow[] = [];
    const errorRows: RowError[] = [];

    // Pre-fetch all entities for better performance
    const entityCache = await this.buildEntityCache(rows);

    // Track combinations we've seen in this batch (for duplicate detection within file)
    const seenCombinations = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const rowNumber = i + 2; // +2 because row 1 is header, and we're 1-indexed
      const errors: string[] = [];

      // Step 1: Basic Zod validation
      const zodResult = BulkUploadRowSchema.safeParse(row);
      if (!zodResult.success) {
        const zodErrors = zodResult.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );
        errorRows.push({
          rowNumber,
          rowData: row as BulkUploadRow,
          errors: zodErrors,
        });
        continue;
      }

      const validRow = zodResult.data;

      // Step 2: Resolve user by email
      const user = entityCache.usersByEmail.get(
        validRow.user_email.toLowerCase()
      );
      if (!user) {
        errors.push(`Unknown user_email: ${validRow.user_email}`);
      }

      // Step 3: Resolve system by name
      const system = entityCache.systemsByName.get(
        validRow.system_name.toLowerCase()
      );
      if (!system) {
        errors.push(`Unknown system_name: ${validRow.system_name}`);
      }

      // Step 4: Resolve tier by name + system
      let tier: { id: string; name: string } | undefined;
      if (system) {
        const tierKey = `${system.id}:${validRow.access_tier_name.toLowerCase()}`;
        tier = entityCache.tiersBySystemAndName.get(tierKey);
        if (!tier) {
          errors.push(
            `Unknown access_tier_name "${validRow.access_tier_name}" for system "${validRow.system_name}"`
          );
        }
      }

      // Step 5: Resolve instance by name + system (optional)
      let instance: { id: string; name: string } | null = null;
      if (validRow.instance_name && system) {
        const instanceKey = `${system.id}:${validRow.instance_name.toLowerCase()}`;
        const resolvedInstance =
          entityCache.instancesBySystemAndName.get(instanceKey);
        if (!resolvedInstance) {
          errors.push(
            `Instance "${validRow.instance_name}" does not belong to system "${validRow.system_name}"`
          );
        } else {
          instance = resolvedInstance;
        }
      }

      // Step 6: Check for duplicates within this file
      if (user && system && tier) {
        const combinationKey = `${user.id}:${system.id}:${tier.id}:${instance?.id ?? 'null'}`;
        if (seenCombinations.has(combinationKey)) {
          errors.push(
            `Duplicate row: User already has a grant for this system/tier/instance in this file`
          );
        } else {
          seenCombinations.add(combinationKey);
        }
      }

      // Step 7: Check for existing active grant in database
      if (user && system && tier && errors.length === 0) {
        const existingKey = `${user.id}:${system.id}:${tier.id}:${instance?.id ?? 'null'}`;
        if (entityCache.existingActiveGrants.has(existingKey)) {
          errors.push(
            `User already has an active grant for this system/tier${instance ? '/instance' : ''}`
          );
        }
      }

      // Record result
      if (errors.length > 0) {
        errorRows.push({
          rowNumber,
          rowData: validRow,
          errors,
        });
      } else if (user && system && tier) {
        validRows.push({
          rowNumber,
          rowData: validRow,
          resolvedData: {
            userId: user.id,
            systemId: system.id,
            instanceId: instance?.id ?? null,
            tierId: tier.id,
            notes: validRow.notes ?? null,
          },
        });
      }
    }

    return { validRows, errorRows };
  },

  /**
   * Build a cache of all entities referenced in the rows
   */
  async buildEntityCache(rows: ParsedCsvRow[] | BulkUploadRow[]) {
    // Collect unique values
    const emails = new Set<string>();
    const systemNames = new Set<string>();
    const tierNames = new Map<string, Set<string>>(); // systemName -> Set<tierName>
    const instanceNames = new Map<string, Set<string>>(); // systemName -> Set<instanceName>

    for (const row of rows) {
      if (row.user_email) emails.add(row.user_email.toLowerCase());
      if (row.system_name) {
        const sysName = row.system_name.toLowerCase();
        systemNames.add(sysName);

        if (row.access_tier_name) {
          if (!tierNames.has(sysName)) tierNames.set(sysName, new Set());
          tierNames.get(sysName)!.add(row.access_tier_name.toLowerCase());
        }

        if (row.instance_name) {
          if (!instanceNames.has(sysName))
            instanceNames.set(sysName, new Set());
          instanceNames.get(sysName)!.add(row.instance_name.toLowerCase());
        }
      }
    }

    // Fetch users by email
    const usersByEmail = new Map<
      string,
      { id: string; name: string; email: string }
    >();
    for (const email of emails) {
      const user = await usersRepo.findByEmail(email);
      if (user) {
        usersByEmail.set(email, user);
      }
    }

    // Fetch systems by name
    const systemsByName = new Map<string, { id: string; name: string }>();
    for (const name of systemNames) {
      const system = await systemsRepo.findByName(name);
      if (system) {
        systemsByName.set(name, system);
      }
    }

    // Fetch tiers by system + name
    const tiersBySystemAndName = new Map<
      string,
      { id: string; name: string }
    >();
    for (const [sysName, tierNameSet] of tierNames.entries()) {
      const system = systemsByName.get(sysName);
      if (system) {
        for (const tierName of tierNameSet) {
          const tier = await systemsRepo.findTierByName(system.id, tierName);
          if (tier) {
            tiersBySystemAndName.set(`${system.id}:${tierName}`, tier);
          }
        }
      }
    }

    // Fetch instances by system + name
    const instancesBySystemAndName = new Map<
      string,
      { id: string; name: string }
    >();
    for (const [sysName, instanceNameSet] of instanceNames.entries()) {
      const system = systemsByName.get(sysName);
      if (system) {
        for (const instName of instanceNameSet) {
          const instance = await systemsRepo.findInstanceByName(
            system.id,
            instName
          );
          if (instance) {
            instancesBySystemAndName.set(`${system.id}:${instName}`, instance);
          }
        }
      }
    }

    // Check existing active grants
    const combinations: Array<{
      userId: string;
      systemId: string;
      tierId: string;
      instanceId: string | null;
    }> = [];

    for (const row of rows) {
      const user = usersByEmail.get(row.user_email?.toLowerCase() ?? '');
      const system = systemsByName.get(row.system_name?.toLowerCase() ?? '');
      const tier = system
        ? tiersBySystemAndName.get(
            `${system.id}:${row.access_tier_name?.toLowerCase() ?? ''}`
          )
        : undefined;
      const instance =
        system && row.instance_name
          ? instancesBySystemAndName.get(
              `${system.id}:${row.instance_name.toLowerCase()}`
            )
          : null;

      if (user && system && tier) {
        combinations.push({
          userId: user.id,
          systemId: system.id,
          tierId: tier.id,
          instanceId: instance?.id ?? null,
        });
      }
    }

    const existingGrants =
      combinations.length > 0
        ? await accessGrantsRepo.checkExistingActiveGrantsBatch(combinations)
        : [];

    const existingActiveGrants = new Set<string>();
    for (const grant of existingGrants) {
      const key = `${grant.userId}:${grant.systemId}:${grant.tierId}:${grant.instanceId ?? 'null'}`;
      existingActiveGrants.add(key);
    }

    return {
      usersByEmail,
      systemsByName,
      tiersBySystemAndName,
      instancesBySystemAndName,
      existingActiveGrants,
    };
  },

  /**
   * Insert all valid grants into the database
   */
  async insertGrants(
    validRows: ValidRow[],
    grantedBy: string
  ): Promise<CreatedGrant[]> {
    if (validRows.length === 0) return [];

    const grantsToInsert = validRows.map((row) => ({
      userId: row.resolvedData.userId,
      systemId: row.resolvedData.systemId,
      instanceId: row.resolvedData.instanceId,
      tierId: row.resolvedData.tierId,
      status: 'active' as const,
      grantedBy,
      notes: row.resolvedData.notes,
    }));

    const createdGrants = await accessGrantsRepo.createMany(grantsToInsert);

    return createdGrants.map((grant) => ({
      id: grant.id,
      userId: grant.userId,
      systemId: grant.systemId,
      instanceId: grant.instanceId,
      tierId: grant.tierId,
      status: grant.status,
      grantedBy: grant.grantedBy,
      grantedAt: grant.grantedAt,
      notes: grant.notes,
      user: grant.user,
      system: grant.system,
      tier: grant.tier,
    }));
  },
};

export type BulkUploadService = typeof bulkUploadService;

