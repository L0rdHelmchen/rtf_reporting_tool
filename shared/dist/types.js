"use strict";
// RTF Reporting Tool - Shared Types
// Deutsche Bundesbank RTF (Risk-Bearing Capacity) Reporting
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.InstitutionDashboard = exports.FormCompletionStatus = exports.APIError = exports.FormStructure = exports.FormSection = exports.OpenRowSection = exports.GenerateXBRLResponse = exports.GenerateXBRLRequest = exports.ValidateFormResponse = exports.ValidateFormRequest = exports.UpdateFormInstanceRequest = exports.CreateFormInstanceRequest = exports.LoginResponse = exports.LoginRequest = exports.FormField = exports.FieldValue = exports.ReferenceData = exports.FormInstance = exports.ValidationError = exports.XBRLFact = exports.XBRLContext = exports.FormDefinition = exports.Concept = exports.DimensionMember = exports.Dimension = exports.User = exports.Institution = exports.UserRole = exports.ConceptDataType = exports.FormStatus = exports.FormCategory = exports.ExemptionCategory = exports.InstitutionType = void 0;
const zod_1 = require("zod");
// ===== ENUMS =====
exports.InstitutionType = zod_1.z.enum([
    'bank',
    'savings_bank',
    'cooperative_bank',
    'building_society',
    'investment_firm',
    'other'
]);
exports.ExemptionCategory = zod_1.z.enum([
    'section_53b',
    'section_53c',
    'securities_trading_bank',
    'risk_management_exemption',
    'none'
]);
exports.FormCategory = zod_1.z.enum([
    'GRP', 'RSK', 'RDP', 'ILAAP', 'KPL', 'STA', 'STKK', 'RTFK', 'STG', 'DBL', 'OTHER'
]);
exports.FormStatus = zod_1.z.enum([
    'draft',
    'in_review',
    'submitted',
    'accepted',
    'rejected'
]);
exports.ConceptDataType = zod_1.z.enum([
    'si6', 'mi1', 'pi2', 'ii3', 'li1', 'di5',
    'bi7', 'ci1', 'ti1', 'url', 'mem', 'bool', 'date'
]);
exports.UserRole = zod_1.z.enum([
    'admin',
    'compliance_officer',
    'risk_manager',
    'data_entry',
    'reviewer',
    'viewer'
]);
// ===== CORE ENTITIES =====
exports.Institution = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(255),
    bik: zod_1.z.string().length(8), // Bankleitzahl
    instituteType: exports.InstitutionType,
    exemptionCategory: exports.ExemptionCategory.optional(),
    parentInstitutionId: zod_1.z.string().uuid().optional(),
    isConsolidatedReporting: zod_1.z.boolean().default(false),
    addressStreet: zod_1.z.string().max(255).optional(),
    addressCity: zod_1.z.string().max(100).optional(),
    addressPostalCode: zod_1.z.string().max(20).optional(),
    addressCountry: zod_1.z.string().length(2).default('DE'),
    contactPerson: zod_1.z.string().max(255).optional(),
    contactEmail: zod_1.z.string().email().optional(),
    contactPhone: zod_1.z.string().max(50).optional(),
    active: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.User = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    institutionId: zod_1.z.string().uuid(),
    username: zod_1.z.string().min(3).max(100),
    email: zod_1.z.string().email().max(255),
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    role: exports.UserRole,
    isActive: zod_1.z.boolean().default(true),
    lastLogin: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// ===== XBRL STRUCTURES =====
exports.Dimension = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().max(100),
    nameDe: zod_1.z.string().max(255),
    nameEn: zod_1.z.string().max(255).optional(),
    type: zod_1.z.enum(['explicit', 'typed']).default('explicit'),
    domainCode: zod_1.z.string().max(100).optional(),
    validFrom: zod_1.z.date(),
    validTo: zod_1.z.date().optional(),
    createdAt: zod_1.z.date()
});
exports.DimensionMember = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    dimensionId: zod_1.z.string().uuid(),
    code: zod_1.z.string().max(100),
    labelDe: zod_1.z.string().max(500),
    labelEn: zod_1.z.string().max(500).optional(),
    parentId: zod_1.z.string().uuid().optional(),
    orderIndex: zod_1.z.number().int().default(0),
    isAbstract: zod_1.z.boolean().default(false),
    validFrom: zod_1.z.date(),
    validTo: zod_1.z.date().optional(),
    createdAt: zod_1.z.date()
});
exports.Concept = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().max(100),
    nameDe: zod_1.z.string().max(255),
    nameEn: zod_1.z.string().max(255).optional(),
    dataType: exports.ConceptDataType,
    periodType: zod_1.z.enum(['instant', 'duration']).default('instant'),
    balanceType: zod_1.z.enum(['credit', 'debit']).optional(),
    validationPattern: zod_1.z.string().max(500).optional(),
    unitType: zod_1.z.string().max(20).default('pure'),
    isAbstract: zod_1.z.boolean().default(false),
    substitutionGroup: zod_1.z.string().max(100).optional(),
    createdAt: zod_1.z.date()
});
// ===== FORM DEFINITIONS =====
exports.FormDefinition = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().max(20), // e.g., 'GRP31', 'RSK12'
    nameDe: zod_1.z.string().max(255),
    nameEn: zod_1.z.string().max(255).optional(),
    category: exports.FormCategory,
    version: zod_1.z.string().max(20).default('2023-12'),
    effectiveDate: zod_1.z.date(),
    validUntil: zod_1.z.date().optional(),
    schemaStructure: zod_1.z.record(zod_1.z.any()), // JSONB - XBRL schema metadata
    validationRules: zod_1.z.record(zod_1.z.any()), // JSONB - Business rules
    presentationStructure: zod_1.z.record(zod_1.z.any()).optional(), // JSONB - UI layout
    mandatory: zod_1.z.boolean().default(true),
    appliesToIndividual: zod_1.z.boolean().default(true),
    appliesToConsolidated: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// ===== FORM INSTANCES (USER DATA) =====
exports.XBRLContext = zod_1.z.object({
    id: zod_1.z.string(),
    dimensions: zod_1.z.record(zod_1.z.string()), // dimension code -> member code
    period: zod_1.z.object({
        instant: zod_1.z.date().optional(),
        startDate: zod_1.z.date().optional(),
        endDate: zod_1.z.date().optional()
    })
});
exports.XBRLFact = zod_1.z.object({
    contextRef: zod_1.z.string(),
    concept: zod_1.z.string(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]),
    decimals: zod_1.z.number().int().optional(),
    unitRef: zod_1.z.string().optional()
});
exports.ValidationError = zod_1.z.object({
    fieldPath: zod_1.z.string(),
    errorCode: zod_1.z.string(),
    messageDe: zod_1.z.string(),
    messageEn: zod_1.z.string().optional(),
    severity: zod_1.z.enum(['error', 'warning', 'info']).default('error')
});
exports.FormInstance = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    institutionId: zod_1.z.string().uuid(),
    formDefinitionId: zod_1.z.string().uuid(),
    reportingPeriod: zod_1.z.date(), // Stichtag
    status: exports.FormStatus,
    formData: zod_1.z.record(zod_1.z.any()).default({}), // Field values
    dimensionalData: zod_1.z.object({
        contexts: zod_1.z.array(exports.XBRLContext).default([]),
        facts: zod_1.z.array(exports.XBRLFact).default([])
    }).default({ contexts: [], facts: [] }),
    validationErrors: zod_1.z.array(exports.ValidationError).default([]),
    submissionData: zod_1.z.record(zod_1.z.any()).optional(), // Generated XBRL
    submittedAt: zod_1.z.date().optional(),
    reviewedAt: zod_1.z.date().optional(),
    approvedAt: zod_1.z.date().optional(),
    createdBy: zod_1.z.string().uuid(),
    updatedBy: zod_1.z.string().uuid().optional(),
    reviewedBy: zod_1.z.string().uuid().optional(),
    versionNumber: zod_1.z.number().int().default(1),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// ===== REFERENCE DATA =====
exports.ReferenceData = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    domainCode: zod_1.z.string().max(100), // e.g., 'AW', 'AX', 'BU'
    memberCode: zod_1.z.string().max(100), // e.g., 'x01', 'x02'
    labelDe: zod_1.z.string().max(500),
    labelEn: zod_1.z.string().max(500).optional(),
    descriptionDe: zod_1.z.string().optional(),
    descriptionEn: zod_1.z.string().optional(),
    parentMemberCode: zod_1.z.string().max(100).optional(),
    orderIndex: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
    validFrom: zod_1.z.date(),
    validTo: zod_1.z.date().optional(),
    createdAt: zod_1.z.date()
});
// ===== FIELD TYPES & VALUES =====
exports.FieldValue = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.date(),
    zod_1.z.array(zod_1.z.string()), // Multi-select
    zod_1.z.null()
]);
exports.FormField = zod_1.z.object({
    code: zod_1.z.string(),
    conceptCode: zod_1.z.string(),
    nameDe: zod_1.z.string(),
    nameEn: zod_1.z.string().optional(),
    dataType: exports.ConceptDataType,
    mandatory: zod_1.z.boolean().default(false),
    value: exports.FieldValue.optional(),
    validationRules: zod_1.z.array(zod_1.z.string()).default([]),
    helpTextDe: zod_1.z.string().optional(),
    helpTextEn: zod_1.z.string().optional(),
    domainCode: zod_1.z.string().optional(), // For enumerations
    dependencies: zod_1.z.array(zod_1.z.string()).default([]), // Other field codes this depends on
    conditionallyVisible: zod_1.z.boolean().default(false)
});
// ===== DTOs FOR API =====
// Authentication
exports.LoginRequest = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6)
});
exports.LoginResponse = zod_1.z.object({
    user: exports.User,
    institution: exports.Institution,
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    expiresIn: zod_1.z.number()
});
// Form operations
exports.CreateFormInstanceRequest = zod_1.z.object({
    formDefinitionId: zod_1.z.string().uuid(),
    reportingPeriod: zod_1.z.date()
});
exports.UpdateFormInstanceRequest = zod_1.z.object({
    formData: zod_1.z.record(exports.FieldValue),
    dimensionalData: zod_1.z.object({
        contexts: zod_1.z.array(exports.XBRLContext),
        facts: zod_1.z.array(exports.XBRLFact)
    }).optional()
});
exports.ValidateFormRequest = zod_1.z.object({
    formData: zod_1.z.record(exports.FieldValue),
    dimensionalData: zod_1.z.object({
        contexts: zod_1.z.array(exports.XBRLContext),
        facts: zod_1.z.array(exports.XBRLFact)
    }).optional()
});
exports.ValidateFormResponse = zod_1.z.object({
    isValid: zod_1.z.boolean(),
    errors: zod_1.z.array(exports.ValidationError),
    warnings: zod_1.z.array(exports.ValidationError).default([])
});
// XBRL generation
exports.GenerateXBRLRequest = zod_1.z.object({
    formInstanceIds: zod_1.z.array(zod_1.z.string().uuid()),
    reportingPeriod: zod_1.z.date(),
    includeValidation: zod_1.z.boolean().default(true)
});
exports.GenerateXBRLResponse = zod_1.z.object({
    xbrlDocument: zod_1.z.string(), // XML content
    fileName: zod_1.z.string(),
    validationResults: exports.ValidateFormResponse.optional(),
    generatedAt: zod_1.z.date()
});
// ===== FORM STRUCTURE DEFINITIONS =====
exports.OpenRowSection = zod_1.z.object({
    code: zod_1.z.string(),
    nameDe: zod_1.z.string(),
    nameEn: zod_1.z.string().optional(),
    fields: zod_1.z.array(exports.FormField),
    allowMultiple: zod_1.z.boolean().default(true),
    minRows: zod_1.z.number().int().default(0),
    maxRows: zod_1.z.number().int().optional()
});
exports.FormSection = zod_1.z.object({
    code: zod_1.z.string(),
    nameDe: zod_1.z.string(),
    nameEn: zod_1.z.string().optional(),
    orderIndex: zod_1.z.number().int(),
    fields: zod_1.z.array(exports.FormField).default([]),
    openRowSections: zod_1.z.array(exports.OpenRowSection).default([]),
    conditionallyVisible: zod_1.z.boolean().default(false),
    visibilityConditions: zod_1.z.record(exports.FieldValue).default({})
});
exports.FormStructure = zod_1.z.object({
    formDefinition: exports.FormDefinition,
    sections: zod_1.z.array(exports.FormSection),
    totalFields: zod_1.z.number().int(),
    mandatoryFields: zod_1.z.number().int(),
    estimatedCompletionTime: zod_1.z.number().int().optional() // minutes
});
// ===== ERROR TYPES =====
exports.APIError = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.record(zod_1.z.any()).optional(),
    timestamp: zod_1.z.date()
});
// ===== REPORTING & ANALYTICS =====
exports.FormCompletionStatus = zod_1.z.object({
    formDefinitionId: zod_1.z.string().uuid(),
    formCode: zod_1.z.string(),
    formNameDe: zod_1.z.string(),
    status: exports.FormStatus,
    completionPercentage: zod_1.z.number().min(0).max(100),
    mandatoryFieldsCompleted: zod_1.z.number().int(),
    totalMandatoryFields: zod_1.z.number().int(),
    lastUpdated: zod_1.z.date().optional(),
    daysUntilDeadline: zod_1.z.number().int().optional()
});
exports.InstitutionDashboard = zod_1.z.object({
    institution: exports.Institution,
    reportingPeriod: zod_1.z.date(),
    formsStatus: zod_1.z.array(exports.FormCompletionStatus),
    overallCompletionPercentage: zod_1.z.number().min(0).max(100),
    formsWithErrors: zod_1.z.number().int(),
    submissionDeadline: zod_1.z.date().optional(),
    lastActivity: zod_1.z.date().optional()
});
// Export all schemas for validation
exports.schemas = {
    Institution: exports.Institution,
    User: exports.User,
    Dimension: exports.Dimension,
    DimensionMember: exports.DimensionMember,
    Concept: exports.Concept,
    FormDefinition: exports.FormDefinition,
    FormInstance: exports.FormInstance,
    ReferenceData: exports.ReferenceData,
    FormField: exports.FormField,
    FormSection: exports.FormSection,
    FormStructure: exports.FormStructure,
    LoginRequest: exports.LoginRequest,
    LoginResponse: exports.LoginResponse,
    CreateFormInstanceRequest: exports.CreateFormInstanceRequest,
    UpdateFormInstanceRequest: exports.UpdateFormInstanceRequest,
    ValidateFormRequest: exports.ValidateFormRequest,
    ValidateFormResponse: exports.ValidateFormResponse,
    GenerateXBRLRequest: exports.GenerateXBRLRequest,
    GenerateXBRLResponse: exports.GenerateXBRLResponse,
    InstitutionDashboard: exports.InstitutionDashboard
};
//# sourceMappingURL=types.js.map