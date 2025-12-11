-- CreateEnum
CREATE TYPE "ai_bootcamp_request_status" AS ENUM ('requested', 'manager_approved', 'owner_approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "ai_bootcamp_grant_status" AS ENUM ('requested', 'approved', 'active', 'to_remove', 'removed');

-- CreateTable
CREATE TABLE "ai_bootcamp_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "manager_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_bootcamp_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_bootcamp_system" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_bootcamp_system_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_bootcamp_instance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_bootcamp_instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_bootcamp_access_tier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_bootcamp_access_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_bootcamp_system_owner" (
    "system_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_bootcamp_system_owner_pkey" PRIMARY KEY ("system_id","user_id")
);

-- CreateTable
CREATE TABLE "ai_bootcamp_access_grant" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "instance_id" TEXT,
    "tier_id" TEXT NOT NULL,
    "status" "ai_bootcamp_grant_status" NOT NULL DEFAULT 'active',
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMPTZ(6),
    "approved_by" TEXT,
    "approved_at" TIMESTAMPTZ(6),
    "requested_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_bootcamp_access_grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_bootcamp_access_request" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "instance_id" TEXT,
    "tier_id" TEXT NOT NULL,
    "status" "ai_bootcamp_request_status" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_bootcamp_access_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_bootcamp_user_email_key" ON "ai_bootcamp_user"("email");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_user_email" ON "ai_bootcamp_user"("email");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_user_manager_id" ON "ai_bootcamp_user"("manager_id");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_system_name" ON "ai_bootcamp_system"("name");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_instance_system_id" ON "ai_bootcamp_instance"("system_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_bootcamp_instance_system_id_name_key" ON "ai_bootcamp_instance"("system_id", "name");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_tier_system_id" ON "ai_bootcamp_access_tier"("system_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_bootcamp_access_tier_system_id_name_key" ON "ai_bootcamp_access_tier"("system_id", "name");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_grant_user_id" ON "ai_bootcamp_access_grant"("user_id");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_grant_system_id" ON "ai_bootcamp_access_grant"("system_id");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_grant_instance_id" ON "ai_bootcamp_access_grant"("instance_id");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_grant_tier_id" ON "ai_bootcamp_access_grant"("tier_id");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_grant_status" ON "ai_bootcamp_access_grant"("status");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_grant_granted_at" ON "ai_bootcamp_access_grant"("granted_at");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_grant_user_system_status" ON "ai_bootcamp_access_grant"("user_id", "system_id", "status");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_request_user_id" ON "ai_bootcamp_access_request"("user_id");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_request_requested_by" ON "ai_bootcamp_access_request"("requested_by");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_request_system_id" ON "ai_bootcamp_access_request"("system_id");

-- CreateIndex
CREATE INDEX "idx_ai_bootcamp_access_request_status" ON "ai_bootcamp_access_request"("status");

-- AddForeignKey
ALTER TABLE "ai_bootcamp_user" ADD CONSTRAINT "ai_bootcamp_user_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "ai_bootcamp_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_instance" ADD CONSTRAINT "ai_bootcamp_instance_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "ai_bootcamp_system"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_tier" ADD CONSTRAINT "ai_bootcamp_access_tier_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "ai_bootcamp_system"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_system_owner" ADD CONSTRAINT "ai_bootcamp_system_owner_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "ai_bootcamp_system"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_system_owner" ADD CONSTRAINT "ai_bootcamp_system_owner_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ai_bootcamp_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_grant" ADD CONSTRAINT "ai_bootcamp_access_grant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ai_bootcamp_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_grant" ADD CONSTRAINT "ai_bootcamp_access_grant_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "ai_bootcamp_system"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_grant" ADD CONSTRAINT "ai_bootcamp_access_grant_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "ai_bootcamp_instance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_grant" ADD CONSTRAINT "ai_bootcamp_access_grant_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "ai_bootcamp_access_tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_request" ADD CONSTRAINT "ai_bootcamp_access_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ai_bootcamp_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_request" ADD CONSTRAINT "ai_bootcamp_access_request_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "ai_bootcamp_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_request" ADD CONSTRAINT "ai_bootcamp_access_request_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "ai_bootcamp_system"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_request" ADD CONSTRAINT "ai_bootcamp_access_request_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "ai_bootcamp_instance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_bootcamp_access_request" ADD CONSTRAINT "ai_bootcamp_access_request_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "ai_bootcamp_access_tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
