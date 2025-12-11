'use client';

import { useState, useCallback, useEffect } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import {
  AutocompleteUserField,
  AutocompleteSystemField,
  TierSelectField,
  InstanceSelectField,
  NotesField,
  SubmitButton,
  type SelectedUser,
  type SelectedSystem,
  type Tier,
  type Instance,
} from './form';
import { useCreateAccessGrant } from '@/hooks/useCreateAccessGrant';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface FormState {
  user: SelectedUser | null;
  system: SelectedSystem | null;
  tier: Tier | null;
  instance: Instance | null;
  notes: string;
}

interface FormErrors {
  user?: string;
  system?: string;
  tier?: string;
  general?: string;
}

const initialFormState: FormState = {
  user: null,
  system: null,
  tier: null,
  instance: null,
  notes: '',
};

export function AccessGrantForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { createGrant, isSubmitting } = useCreateAccessGrant();
  const { addToast } = useToast();

  // Reset tier and instance when system changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      tier: null,
      instance: null,
    }));
    setErrors((prev) => ({ ...prev, tier: undefined }));
  }, [form.system?.id]);

  const handleUserChange = useCallback((user: SelectedUser | null) => {
    setForm((prev) => ({ ...prev, user }));
    setErrors((prev) => ({ ...prev, user: undefined, general: undefined }));
  }, []);

  const handleSystemChange = useCallback((system: SelectedSystem | null) => {
    setForm((prev) => ({ ...prev, system, tier: null, instance: null }));
    setErrors((prev) => ({
      ...prev,
      system: undefined,
      tier: undefined,
      general: undefined,
    }));
  }, []);

  const handleTierChange = useCallback((tier: Tier | null) => {
    setForm((prev) => ({ ...prev, tier }));
    setErrors((prev) => ({ ...prev, tier: undefined, general: undefined }));
  }, []);

  const handleInstanceChange = useCallback((instance: Instance | null) => {
    setForm((prev) => ({ ...prev, instance }));
  }, []);

  const handleNotesChange = useCallback((notes: string) => {
    setForm((prev) => ({ ...prev, notes }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.user) {
      newErrors.user = 'Please select a user';
    }
    if (!form.system) {
      newErrors.system = 'Please select a system';
    }
    if (!form.tier) {
      newErrors.tier = 'Please select an access tier';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await createGrant({
      userId: form.user!.id,
      systemId: form.system!.id,
      tierId: form.tier!.id,
      instanceId: form.instance?.id || null,
      notes: form.notes || undefined,
    });

    if (result.success) {
      // Show success state
      setShowSuccess(true);

      // Show toast
      addToast({
        type: 'success',
        title: 'Access Grant Created!',
        message: `${form.user!.name} now has ${form.tier!.name} access to ${form.system!.name}`,
        duration: 6000,
      });

      // Reset form after animation
      setTimeout(() => {
        setForm(initialFormState);
        setShowSuccess(false);
      }, 1500);
    } else {
      // Handle specific errors
      if (result.code === 'DUPLICATE_ACTIVE_GRANT') {
        setErrors({
          general:
            'This user already has active access for this system and tier.',
        });
        addToast({
          type: 'error',
          title: 'Duplicate Access Grant',
          message: 'This user already has active access for this system.',
        });
      } else {
        setErrors({
          general: result.error || 'Failed to create access grant',
        });
        addToast({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to create access grant',
        });
      }
    }
  };

  // Get available tiers and instances from selected system
  const availableTiers = form.system?.tiers ?? [];
  const availableInstances = form.system?.instances ?? [];

  const canSubmit = form.user && form.system && form.tier && !isSubmitting;

  // Success state animation
  if (showSuccess) {
    return (
      <div className="duration-500 animate-in fade-in zoom-in-95">
        <div
          className={cn(
            'relative overflow-hidden',
            'bg-gradient-to-br from-green-100 to-emerald-50',
            'border-2 border-green-200',
            'rounded-[2rem] p-12',
            'shadow-xl'
          )}
        >
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-green-800">
              Access Granted!
            </h2>
            <p className="mt-2 text-green-700">
              {form.user?.name} now has <strong>{form.tier?.name}</strong>{' '}
              access to <strong>{form.system?.name}</strong>
            </p>
            <p className="mt-4 text-sm text-green-600">
              Preparing form for next grant...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-corolla-primary-container',
          'border-2 border-corolla-quick-grant-border',
          'rounded-[2rem] p-8',
          'shadow-xl shadow-corolla-primary/10',
          'duration-300 animate-in fade-in slide-in-from-top-4'
        )}
      >
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />

        {/* Header */}
        <div className="relative mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-corolla-primary text-white shadow-lg shadow-corolla-primary/30">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-corolla-on-surface">
            Log Access Grant
          </h1>
          <p className="mt-2 text-corolla-on-surface-variant">
            Grant a user access to a system with a specific tier
          </p>
        </div>

        {/* Form Fields */}
        <div className="relative space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm font-medium text-red-700">
                {errors.general}
              </p>
            </div>
          )}

          {/* User Field */}
          <AutocompleteUserField
            value={form.user}
            onChange={handleUserChange}
            error={errors.user}
            disabled={isSubmitting}
          />

          {/* System Field */}
          <AutocompleteSystemField
            value={form.system}
            onChange={handleSystemChange}
            error={errors.system}
            disabled={isSubmitting}
          />

          {/* Tier Field */}
          <TierSelectField
            value={form.tier}
            onChange={handleTierChange}
            tiers={availableTiers}
            error={errors.tier}
            disabled={isSubmitting || !form.system}
          />

          {/* Instance Field (only if system has instances) */}
          <InstanceSelectField
            value={form.instance}
            onChange={handleInstanceChange}
            instances={availableInstances}
            disabled={isSubmitting || !form.system}
          />

          {/* Notes Field */}
          <NotesField
            value={form.notes}
            onChange={handleNotesChange}
            disabled={isSubmitting}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <SubmitButton isLoading={isSubmitting} disabled={!canSubmit} />
          </div>
        </div>
      </div>
    </form>
  );
}

