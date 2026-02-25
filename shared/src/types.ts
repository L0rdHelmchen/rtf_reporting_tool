// RTF Reporting Tool - Shared Types
// Deutsche Bundesbank RTF (Risk-Bearing Capacity) Reporting

import { z } from 'zod';

// ===== ENUMS =====

export const InstitutionType = z.enum([
  'bank',
  'savings_bank',
  'cooperative_bank',
  'building_society',
  'investment_firm',
  'other'
]);
export type InstitutionType = z.infer<typeof InstitutionType>;

export const ExemptionCategory = z.enum([
  'section_53b',
  'section_53c',
  'securities_trading_bank',
  'risk_management_exemption',
  'none'
]);
export type ExemptionCategory = z.infer<typeof ExemptionCategory>;

export const FormCategory = z.enum([
  'GRP', 'RSK', 'RDP', 'ILAAP', 'KPL', 'STA', 'STKK', 'RTFK', 'STG', 'DBL', 'OTHER'
]);
export type FormCategory = z.infer<typeof FormCategory>;

export const FormStatus = z.enum([
  'draft',
  'in_review',
  'submitted',
  'accepted',
  'rejected'
]);
export type FormStatus = z.infer<typeof FormStatus>;

export const ConceptDataType = z.enum([
  'si6', 'mi1', 'pi2', 'ii3', 'li1', 'di5',
  'bi7', 'ci1', 'ti1', 'url', 'mem', 'bool', 'date'
]);
export type ConceptDataType = z.infer<typeof ConceptDataType>;

export const UserRole = z.enum([
  'admin',
  'compliance_officer',
  'risk_manager',
  'data_entry',
  'reviewer',
  'viewer'
]);
export type UserRole = z.infer<typeof UserRole>;

// ===== CORE ENTITIES =====

export const Institution = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  bik: z.string().length(8), // Bankleitzahl
  instituteType: InstitutionType,
  exemptionCategory: ExemptionCategory.optional(),
  parentInstitutionId: z.string().uuid().optional(),
  isConsolidatedReporting: z.boolean().default(false),
  addressStreet: z.string().max(255).optional(),
  addressCity: z.string().max(100).optional(),
  addressPostalCode: z.string().max(20).optional(),
  addressCountry: z.string().length(2).default('DE'),
  contactPerson: z.string().max(255).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(50).optional(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type Institution = z.infer<typeof Institution>;

export const User = z.object({
  id: z.string().uuid(),
  institutionId: z.string().uuid(),
  username: z.string().min(3).max(100),
  email: z.string().email().max(255),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: UserRole,
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type User = z.infer<typeof User>;

// ===== XBRL STRUCTURES =====

export const Dimension = z.object({
  id: z.string().uuid(),
  code: z.string().max(100),
  nameDe: z.string().max(255),
  nameEn: z.string().max(255).optional(),
  type: z.enum(['explicit', 'typed']).default('explicit'),
  domainCode: z.string().max(100).optional(),
  validFrom: z.date(),
  validTo: z.date().optional(),
  createdAt: z.date()
});
export type Dimension = z.infer<typeof Dimension>;

export const DimensionMember = z.object({
  id: z.string().uuid(),
  dimensionId: z.string().uuid(),
  code: z.string().max(100),
  labelDe: z.string().max(500),
  labelEn: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
  orderIndex: z.number().int().default(0),
  isAbstract: z.boolean().default(false),
  validFrom: z.date(),
  validTo: z.date().optional(),
  createdAt: z.date()
});
export type DimensionMember = z.infer<typeof DimensionMember>;

export const Concept = z.object({
  id: z.string().uuid(),
  code: z.string().max(100),
  nameDe: z.string().max(255),
  nameEn: z.string().max(255).optional(),
  dataType: ConceptDataType,
  periodType: z.enum(['instant', 'duration']).default('instant'),
  balanceType: z.enum(['credit', 'debit']).optional(),
  validationPattern: z.string().max(500).optional(),
  unitType: z.string().max(20).default('pure'),
  isAbstract: z.boolean().default(false),
  substitutionGroup: z.string().max(100).optional(),
  createdAt: z.date()
});
export type Concept = z.infer<typeof Concept>;

// ===== FORM DEFINITIONS =====

export const FormDefinition = z.object({
  id: z.string().uuid(),
  code: z.string().max(20), // e.g., 'GRP31', 'RSK12'
  nameDe: z.string().max(255),
  nameEn: z.string().max(255).optional(),
  category: FormCategory,
  version: z.string().max(20).default('2023-12'),
  effectiveDate: z.date(),
  validUntil: z.date().optional(),
  schemaStructure: z.record(z.any()), // JSONB - XBRL schema metadata
  validationRules: z.record(z.any()), // JSONB - Business rules
  presentationStructure: z.record(z.any()).optional(), // JSONB - UI layout
  mandatory: z.boolean().default(true),
  appliesToIndividual: z.boolean().default(true),
  appliesToConsolidated: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type FormDefinition = z.infer<typeof FormDefinition>;

// ===== FORM INSTANCES (USER DATA) =====

export const XBRLContext = z.object({
  id: z.string(),
  dimensions: z.record(z.string()), // dimension code -> member code
  period: z.object({
    instant: z.date().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional()
  })
});
export type XBRLContext = z.infer<typeof XBRLContext>;

export const XBRLFact = z.object({
  contextRef: z.string(),
  concept: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  decimals: z.number().int().optional(),
  unitRef: z.string().optional()
});
export type XBRLFact = z.infer<typeof XBRLFact>;

export const ValidationError = z.object({
  fieldPath: z.string(),
  errorCode: z.string(),
  messageDe: z.string(),
  messageEn: z.string().optional(),
  severity: z.enum(['error', 'warning', 'info']).default('error')
});
export type ValidationError = z.infer<typeof ValidationError>;

export const FormInstance = z.object({
  id: z.string().uuid(),
  institutionId: z.string().uuid(),
  formDefinitionId: z.string().uuid(),
  reportingPeriod: z.date(), // Stichtag
  status: FormStatus,
  formData: z.record(z.any()).default({}), // Field values
  dimensionalData: z.object({
    contexts: z.array(XBRLContext).default([]),
    facts: z.array(XBRLFact).default([])
  }).default({ contexts: [], facts: [] }),
  validationErrors: z.array(ValidationError).default([]),
  submissionData: z.record(z.any()).optional(), // Generated XBRL
  submittedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  approvedAt: z.date().optional(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().optional(),
  reviewedBy: z.string().uuid().optional(),
  versionNumber: z.number().int().default(1),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type FormInstance = z.infer<typeof FormInstance>;

// ===== REFERENCE DATA =====

export const ReferenceData = z.object({
  id: z.string().uuid(),
  domainCode: z.string().max(100), // e.g., 'AW', 'AX', 'BU'
  memberCode: z.string().max(100), // e.g., 'x01', 'x02'
  labelDe: z.string().max(500),
  labelEn: z.string().max(500).optional(),
  descriptionDe: z.string().optional(),
  descriptionEn: z.string().optional(),
  parentMemberCode: z.string().max(100).optional(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
  validFrom: z.date(),
  validTo: z.date().optional(),
  createdAt: z.date()
});
export type ReferenceData = z.infer<typeof ReferenceData>;

// ===== FIELD TYPES & VALUES =====

export const FieldValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.date(),
  z.array(z.string()), // Multi-select
  z.null()
]);
export type FieldValue = z.infer<typeof FieldValue>;

export const FormField = z.object({
  code: z.string(),
  conceptCode: z.string(),
  nameDe: z.string(),
  nameEn: z.string().optional(),
  dataType: ConceptDataType,
  mandatory: z.boolean().default(false),
  value: FieldValue.optional(),
  validationRules: z.array(z.string()).default([]),
  helpTextDe: z.string().optional(),
  helpTextEn: z.string().optional(),
  domainCode: z.string().optional(), // For enumerations
  dependencies: z.array(z.string()).default([]), // Other field codes this depends on
  conditionallyVisible: z.boolean().default(false)
});
export type FormField = z.infer<typeof FormField>;

// ===== DTOs FOR API =====

// Authentication
export const LoginRequest = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export const LoginResponse = z.object({
  user: User,
  institution: Institution,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number()
});
export type LoginResponse = z.infer<typeof LoginResponse>;

// Form operations
export const CreateFormInstanceRequest = z.object({
  formDefinitionId: z.string().uuid(),
  reportingPeriod: z.date()
});
export type CreateFormInstanceRequest = z.infer<typeof CreateFormInstanceRequest>;

export const UpdateFormInstanceRequest = z.object({
  formData: z.record(FieldValue),
  dimensionalData: z.object({
    contexts: z.array(XBRLContext),
    facts: z.array(XBRLFact)
  }).optional()
});
export type UpdateFormInstanceRequest = z.infer<typeof UpdateFormInstanceRequest>;

export const ValidateFormRequest = z.object({
  formData: z.record(FieldValue),
  dimensionalData: z.object({
    contexts: z.array(XBRLContext),
    facts: z.array(XBRLFact)
  }).optional()
});
export type ValidateFormRequest = z.infer<typeof ValidateFormRequest>;

export const ValidateFormResponse = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationError),
  warnings: z.array(ValidationError).default([])
});
export type ValidateFormResponse = z.infer<typeof ValidateFormResponse>;

// XBRL generation
export const GenerateXBRLRequest = z.object({
  formInstanceIds: z.array(z.string().uuid()),
  reportingPeriod: z.date(),
  includeValidation: z.boolean().default(true)
});
export type GenerateXBRLRequest = z.infer<typeof GenerateXBRLRequest>;

export const GenerateXBRLResponse = z.object({
  xbrlDocument: z.string(), // XML content
  fileName: z.string(),
  validationResults: ValidateFormResponse.optional(),
  generatedAt: z.date()
});
export type GenerateXBRLResponse = z.infer<typeof GenerateXBRLResponse>;

// ===== FORM STRUCTURE DEFINITIONS =====

export const OpenRowSection = z.object({
  code: z.string(),
  nameDe: z.string(),
  nameEn: z.string().optional(),
  fields: z.array(FormField),
  allowMultiple: z.boolean().default(true),
  minRows: z.number().int().default(0),
  maxRows: z.number().int().optional()
});
export type OpenRowSection = z.infer<typeof OpenRowSection>;

export const FormSection = z.object({
  code: z.string(),
  nameDe: z.string(),
  nameEn: z.string().optional(),
  orderIndex: z.number().int(),
  fields: z.array(FormField).default([]),
  openRowSections: z.array(OpenRowSection).default([]),
  conditionallyVisible: z.boolean().default(false),
  visibilityConditions: z.record(FieldValue).default({})
});
export type FormSection = z.infer<typeof FormSection>;

export const FormStructure = z.object({
  formDefinition: FormDefinition,
  sections: z.array(FormSection),
  totalFields: z.number().int(),
  mandatoryFields: z.number().int(),
  estimatedCompletionTime: z.number().int().optional() // minutes
});
export type FormStructure = z.infer<typeof FormStructure>;

// ===== ERROR TYPES =====

export const APIError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.date()
});
export type APIError = z.infer<typeof APIError>;

// ===== REPORTING & ANALYTICS =====

export const FormCompletionStatus = z.object({
  formDefinitionId: z.string().uuid(),
  formCode: z.string(),
  formNameDe: z.string(),
  status: FormStatus,
  completionPercentage: z.number().min(0).max(100),
  mandatoryFieldsCompleted: z.number().int(),
  totalMandatoryFields: z.number().int(),
  lastUpdated: z.date().optional(),
  daysUntilDeadline: z.number().int().optional()
});
export type FormCompletionStatus = z.infer<typeof FormCompletionStatus>;

export const InstitutionDashboard = z.object({
  institution: Institution,
  reportingPeriod: z.date(),
  formsStatus: z.array(FormCompletionStatus),
  overallCompletionPercentage: z.number().min(0).max(100),
  formsWithErrors: z.number().int(),
  submissionDeadline: z.date().optional(),
  lastActivity: z.date().optional()
});
export type InstitutionDashboard = z.infer<typeof InstitutionDashboard>;

// Export all schemas for validation
export const schemas = {
  Institution,
  User,
  Dimension,
  DimensionMember,
  Concept,
  FormDefinition,
  FormInstance,
  ReferenceData,
  FormField,
  FormSection,
  FormStructure,
  LoginRequest,
  LoginResponse,
  CreateFormInstanceRequest,
  UpdateFormInstanceRequest,
  ValidateFormRequest,
  ValidateFormResponse,
  GenerateXBRLRequest,
  GenerateXBRLResponse,
  InstitutionDashboard
};