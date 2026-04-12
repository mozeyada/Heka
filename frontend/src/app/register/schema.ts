// Re-export from the canonical location to maintain backward compatibility
// (e.g. for test imports referencing this path)
export { registerSchema, passwordRequirementChecks } from '@/lib/registerSchema';
export type { RegisterFormData } from '@/lib/registerSchema';
