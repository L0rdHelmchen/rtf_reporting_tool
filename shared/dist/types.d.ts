import { z } from 'zod';
export declare const InstitutionType: z.ZodEnum<["bank", "savings_bank", "cooperative_bank", "building_society", "investment_firm", "other"]>;
export type InstitutionType = z.infer<typeof InstitutionType>;
export declare const ExemptionCategory: z.ZodEnum<["section_53b", "section_53c", "securities_trading_bank", "risk_management_exemption", "none"]>;
export type ExemptionCategory = z.infer<typeof ExemptionCategory>;
export declare const FormCategory: z.ZodEnum<["GRP", "RSK", "RDP", "ILAAP", "KPL", "STA", "STKK", "RTFK", "STG", "DBL", "OTHER"]>;
export type FormCategory = z.infer<typeof FormCategory>;
export declare const FormStatus: z.ZodEnum<["draft", "in_review", "submitted", "accepted", "rejected"]>;
export type FormStatus = z.infer<typeof FormStatus>;
export declare const ConceptDataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
export type ConceptDataType = z.infer<typeof ConceptDataType>;
export declare const UserRole: z.ZodEnum<["admin", "compliance_officer", "risk_manager", "data_entry", "reviewer", "viewer"]>;
export type UserRole = z.infer<typeof UserRole>;
export declare const Institution: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    bik: z.ZodString;
    instituteType: z.ZodEnum<["bank", "savings_bank", "cooperative_bank", "building_society", "investment_firm", "other"]>;
    exemptionCategory: z.ZodOptional<z.ZodEnum<["section_53b", "section_53c", "securities_trading_bank", "risk_management_exemption", "none"]>>;
    parentInstitutionId: z.ZodOptional<z.ZodString>;
    isConsolidatedReporting: z.ZodDefault<z.ZodBoolean>;
    addressStreet: z.ZodOptional<z.ZodString>;
    addressCity: z.ZodOptional<z.ZodString>;
    addressPostalCode: z.ZodOptional<z.ZodString>;
    addressCountry: z.ZodDefault<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    active: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    bik: string;
    instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
    isConsolidatedReporting: boolean;
    addressCountry: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
    parentInstitutionId?: string | undefined;
    addressStreet?: string | undefined;
    addressCity?: string | undefined;
    addressPostalCode?: string | undefined;
    contactPerson?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
}, {
    id: string;
    name: string;
    bik: string;
    instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
    createdAt: Date;
    updatedAt: Date;
    exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
    parentInstitutionId?: string | undefined;
    isConsolidatedReporting?: boolean | undefined;
    addressStreet?: string | undefined;
    addressCity?: string | undefined;
    addressPostalCode?: string | undefined;
    addressCountry?: string | undefined;
    contactPerson?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    active?: boolean | undefined;
}>;
export type Institution = z.infer<typeof Institution>;
export declare const User: z.ZodObject<{
    id: z.ZodString;
    institutionId: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["admin", "compliance_officer", "risk_manager", "data_entry", "reviewer", "viewer"]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    lastLogin: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    institutionId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
    isActive: boolean;
    lastLogin?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    institutionId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
    isActive?: boolean | undefined;
    lastLogin?: Date | undefined;
}>;
export type User = z.infer<typeof User>;
export declare const Dimension: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    nameDe: z.ZodString;
    nameEn: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["explicit", "typed"]>>;
    domainCode: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodDate;
    validTo: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "explicit" | "typed";
    id: string;
    createdAt: Date;
    nameDe: string;
    validFrom: Date;
    nameEn?: string | undefined;
    domainCode?: string | undefined;
    validTo?: Date | undefined;
}, {
    code: string;
    id: string;
    createdAt: Date;
    nameDe: string;
    validFrom: Date;
    type?: "explicit" | "typed" | undefined;
    nameEn?: string | undefined;
    domainCode?: string | undefined;
    validTo?: Date | undefined;
}>;
export type Dimension = z.infer<typeof Dimension>;
export declare const DimensionMember: z.ZodObject<{
    id: z.ZodString;
    dimensionId: z.ZodString;
    code: z.ZodString;
    labelDe: z.ZodString;
    labelEn: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    orderIndex: z.ZodDefault<z.ZodNumber>;
    isAbstract: z.ZodDefault<z.ZodBoolean>;
    validFrom: z.ZodDate;
    validTo: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: string;
    createdAt: Date;
    validFrom: Date;
    dimensionId: string;
    labelDe: string;
    orderIndex: number;
    isAbstract: boolean;
    validTo?: Date | undefined;
    labelEn?: string | undefined;
    parentId?: string | undefined;
}, {
    code: string;
    id: string;
    createdAt: Date;
    validFrom: Date;
    dimensionId: string;
    labelDe: string;
    validTo?: Date | undefined;
    labelEn?: string | undefined;
    parentId?: string | undefined;
    orderIndex?: number | undefined;
    isAbstract?: boolean | undefined;
}>;
export type DimensionMember = z.infer<typeof DimensionMember>;
export declare const Concept: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    nameDe: z.ZodString;
    nameEn: z.ZodOptional<z.ZodString>;
    dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
    periodType: z.ZodDefault<z.ZodEnum<["instant", "duration"]>>;
    balanceType: z.ZodOptional<z.ZodEnum<["credit", "debit"]>>;
    validationPattern: z.ZodOptional<z.ZodString>;
    unitType: z.ZodDefault<z.ZodString>;
    isAbstract: z.ZodDefault<z.ZodBoolean>;
    substitutionGroup: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: string;
    createdAt: Date;
    nameDe: string;
    isAbstract: boolean;
    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
    periodType: "instant" | "duration";
    unitType: string;
    nameEn?: string | undefined;
    balanceType?: "credit" | "debit" | undefined;
    validationPattern?: string | undefined;
    substitutionGroup?: string | undefined;
}, {
    code: string;
    id: string;
    createdAt: Date;
    nameDe: string;
    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
    nameEn?: string | undefined;
    isAbstract?: boolean | undefined;
    periodType?: "instant" | "duration" | undefined;
    balanceType?: "credit" | "debit" | undefined;
    validationPattern?: string | undefined;
    unitType?: string | undefined;
    substitutionGroup?: string | undefined;
}>;
export type Concept = z.infer<typeof Concept>;
export declare const FormDefinition: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    nameDe: z.ZodString;
    nameEn: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["GRP", "RSK", "RDP", "ILAAP", "KPL", "STA", "STKK", "RTFK", "STG", "DBL", "OTHER"]>;
    version: z.ZodDefault<z.ZodString>;
    effectiveDate: z.ZodDate;
    validUntil: z.ZodOptional<z.ZodDate>;
    schemaStructure: z.ZodRecord<z.ZodString, z.ZodAny>;
    validationRules: z.ZodRecord<z.ZodString, z.ZodAny>;
    presentationStructure: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    mandatory: z.ZodDefault<z.ZodBoolean>;
    appliesToIndividual: z.ZodDefault<z.ZodBoolean>;
    appliesToConsolidated: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    nameDe: string;
    category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
    version: string;
    effectiveDate: Date;
    schemaStructure: Record<string, any>;
    validationRules: Record<string, any>;
    mandatory: boolean;
    appliesToIndividual: boolean;
    appliesToConsolidated: boolean;
    nameEn?: string | undefined;
    validUntil?: Date | undefined;
    presentationStructure?: Record<string, any> | undefined;
}, {
    code: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    nameDe: string;
    category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
    effectiveDate: Date;
    schemaStructure: Record<string, any>;
    validationRules: Record<string, any>;
    nameEn?: string | undefined;
    version?: string | undefined;
    validUntil?: Date | undefined;
    presentationStructure?: Record<string, any> | undefined;
    mandatory?: boolean | undefined;
    appliesToIndividual?: boolean | undefined;
    appliesToConsolidated?: boolean | undefined;
}>;
export type FormDefinition = z.infer<typeof FormDefinition>;
export declare const XBRLContext: z.ZodObject<{
    id: z.ZodString;
    dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
    period: z.ZodObject<{
        instant: z.ZodOptional<z.ZodDate>;
        startDate: z.ZodOptional<z.ZodDate>;
        endDate: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        instant?: Date | undefined;
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    }, {
        instant?: Date | undefined;
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    dimensions: Record<string, string>;
    period: {
        instant?: Date | undefined;
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    };
}, {
    id: string;
    dimensions: Record<string, string>;
    period: {
        instant?: Date | undefined;
        startDate?: Date | undefined;
        endDate?: Date | undefined;
    };
}>;
export type XBRLContext = z.infer<typeof XBRLContext>;
export declare const XBRLFact: z.ZodObject<{
    contextRef: z.ZodString;
    concept: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
    decimals: z.ZodOptional<z.ZodNumber>;
    unitRef: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string | number | boolean;
    contextRef: string;
    concept: string;
    decimals?: number | undefined;
    unitRef?: string | undefined;
}, {
    value: string | number | boolean;
    contextRef: string;
    concept: string;
    decimals?: number | undefined;
    unitRef?: string | undefined;
}>;
export type XBRLFact = z.infer<typeof XBRLFact>;
export declare const ValidationError: z.ZodObject<{
    fieldPath: z.ZodString;
    errorCode: z.ZodString;
    messageDe: z.ZodString;
    messageEn: z.ZodOptional<z.ZodString>;
    severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
}, "strip", z.ZodTypeAny, {
    fieldPath: string;
    errorCode: string;
    messageDe: string;
    severity: "error" | "warning" | "info";
    messageEn?: string | undefined;
}, {
    fieldPath: string;
    errorCode: string;
    messageDe: string;
    messageEn?: string | undefined;
    severity?: "error" | "warning" | "info" | undefined;
}>;
export type ValidationError = z.infer<typeof ValidationError>;
export declare const FormInstance: z.ZodObject<{
    id: z.ZodString;
    institutionId: z.ZodString;
    formDefinitionId: z.ZodString;
    reportingPeriod: z.ZodDate;
    status: z.ZodEnum<["draft", "in_review", "submitted", "accepted", "rejected"]>;
    formData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    dimensionalData: z.ZodDefault<z.ZodObject<{
        contexts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
            period: z.ZodObject<{
                instant: z.ZodOptional<z.ZodDate>;
                startDate: z.ZodOptional<z.ZodDate>;
                endDate: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }, {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }, {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }>, "many">>;
        facts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            contextRef: z.ZodString;
            concept: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
            decimals: z.ZodOptional<z.ZodNumber>;
            unitRef: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }, {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    }, {
        contexts?: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[] | undefined;
        facts?: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[] | undefined;
    }>>;
    validationErrors: z.ZodDefault<z.ZodArray<z.ZodObject<{
        fieldPath: z.ZodString;
        errorCode: z.ZodString;
        messageDe: z.ZodString;
        messageEn: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
    }, "strip", z.ZodTypeAny, {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        severity: "error" | "warning" | "info";
        messageEn?: string | undefined;
    }, {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        messageEn?: string | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }>, "many">>;
    submissionData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    submittedAt: z.ZodOptional<z.ZodDate>;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    approvedAt: z.ZodOptional<z.ZodDate>;
    createdBy: z.ZodString;
    updatedBy: z.ZodOptional<z.ZodString>;
    reviewedBy: z.ZodOptional<z.ZodString>;
    versionNumber: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    institutionId: string;
    formDefinitionId: string;
    reportingPeriod: Date;
    formData: Record<string, any>;
    dimensionalData: {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    };
    validationErrors: {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        severity: "error" | "warning" | "info";
        messageEn?: string | undefined;
    }[];
    createdBy: string;
    versionNumber: number;
    submissionData?: Record<string, any> | undefined;
    submittedAt?: Date | undefined;
    reviewedAt?: Date | undefined;
    approvedAt?: Date | undefined;
    updatedBy?: string | undefined;
    reviewedBy?: string | undefined;
}, {
    status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    institutionId: string;
    formDefinitionId: string;
    reportingPeriod: Date;
    createdBy: string;
    formData?: Record<string, any> | undefined;
    dimensionalData?: {
        contexts?: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[] | undefined;
        facts?: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[] | undefined;
    } | undefined;
    validationErrors?: {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        messageEn?: string | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }[] | undefined;
    submissionData?: Record<string, any> | undefined;
    submittedAt?: Date | undefined;
    reviewedAt?: Date | undefined;
    approvedAt?: Date | undefined;
    updatedBy?: string | undefined;
    reviewedBy?: string | undefined;
    versionNumber?: number | undefined;
}>;
export type FormInstance = z.infer<typeof FormInstance>;
export declare const ReferenceData: z.ZodObject<{
    id: z.ZodString;
    domainCode: z.ZodString;
    memberCode: z.ZodString;
    labelDe: z.ZodString;
    labelEn: z.ZodOptional<z.ZodString>;
    descriptionDe: z.ZodOptional<z.ZodString>;
    descriptionEn: z.ZodOptional<z.ZodString>;
    parentMemberCode: z.ZodOptional<z.ZodString>;
    orderIndex: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    validFrom: z.ZodDate;
    validTo: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    isActive: boolean;
    domainCode: string;
    validFrom: Date;
    labelDe: string;
    orderIndex: number;
    memberCode: string;
    validTo?: Date | undefined;
    labelEn?: string | undefined;
    descriptionDe?: string | undefined;
    descriptionEn?: string | undefined;
    parentMemberCode?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    domainCode: string;
    validFrom: Date;
    labelDe: string;
    memberCode: string;
    isActive?: boolean | undefined;
    validTo?: Date | undefined;
    labelEn?: string | undefined;
    orderIndex?: number | undefined;
    descriptionDe?: string | undefined;
    descriptionEn?: string | undefined;
    parentMemberCode?: string | undefined;
}>;
export type ReferenceData = z.infer<typeof ReferenceData>;
export declare const FieldValue: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>;
export type FieldValue = z.infer<typeof FieldValue>;
export declare const FormField: z.ZodObject<{
    code: z.ZodString;
    conceptCode: z.ZodString;
    nameDe: z.ZodString;
    nameEn: z.ZodOptional<z.ZodString>;
    dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
    mandatory: z.ZodDefault<z.ZodBoolean>;
    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
    validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    helpTextDe: z.ZodOptional<z.ZodString>;
    helpTextEn: z.ZodOptional<z.ZodString>;
    domainCode: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    code: string;
    nameDe: string;
    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
    validationRules: string[];
    mandatory: boolean;
    conceptCode: string;
    dependencies: string[];
    conditionallyVisible: boolean;
    value?: string | number | boolean | Date | string[] | null | undefined;
    nameEn?: string | undefined;
    domainCode?: string | undefined;
    helpTextDe?: string | undefined;
    helpTextEn?: string | undefined;
}, {
    code: string;
    nameDe: string;
    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
    conceptCode: string;
    value?: string | number | boolean | Date | string[] | null | undefined;
    nameEn?: string | undefined;
    domainCode?: string | undefined;
    validationRules?: string[] | undefined;
    mandatory?: boolean | undefined;
    helpTextDe?: string | undefined;
    helpTextEn?: string | undefined;
    dependencies?: string[] | undefined;
    conditionallyVisible?: boolean | undefined;
}>;
export type FormField = z.infer<typeof FormField>;
export declare const LoginRequest: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof LoginRequest>;
export declare const LoginResponse: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        institutionId: z.ZodString;
        username: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodEnum<["admin", "compliance_officer", "risk_manager", "data_entry", "reviewer", "viewer"]>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        lastLogin: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
        isActive: boolean;
        lastLogin?: Date | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
        isActive?: boolean | undefined;
        lastLogin?: Date | undefined;
    }>;
    institution: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        bik: z.ZodString;
        instituteType: z.ZodEnum<["bank", "savings_bank", "cooperative_bank", "building_society", "investment_firm", "other"]>;
        exemptionCategory: z.ZodOptional<z.ZodEnum<["section_53b", "section_53c", "securities_trading_bank", "risk_management_exemption", "none"]>>;
        parentInstitutionId: z.ZodOptional<z.ZodString>;
        isConsolidatedReporting: z.ZodDefault<z.ZodBoolean>;
        addressStreet: z.ZodOptional<z.ZodString>;
        addressCity: z.ZodOptional<z.ZodString>;
        addressPostalCode: z.ZodOptional<z.ZodString>;
        addressCountry: z.ZodDefault<z.ZodString>;
        contactPerson: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodOptional<z.ZodString>;
        contactPhone: z.ZodOptional<z.ZodString>;
        active: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        isConsolidatedReporting: boolean;
        addressCountry: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
    }, {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        isConsolidatedReporting?: boolean | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        addressCountry?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
        active?: boolean | undefined;
    }>;
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
        isActive: boolean;
        lastLogin?: Date | undefined;
    };
    institution: {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        isConsolidatedReporting: boolean;
        addressCountry: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}, {
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
        isActive?: boolean | undefined;
        lastLogin?: Date | undefined;
    };
    institution: {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        isConsolidatedReporting?: boolean | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        addressCountry?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
        active?: boolean | undefined;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}>;
export type LoginResponse = z.infer<typeof LoginResponse>;
export declare const CreateFormInstanceRequest: z.ZodObject<{
    formDefinitionId: z.ZodString;
    reportingPeriod: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    formDefinitionId: string;
    reportingPeriod: Date;
}, {
    formDefinitionId: string;
    reportingPeriod: Date;
}>;
export type CreateFormInstanceRequest = z.infer<typeof CreateFormInstanceRequest>;
export declare const UpdateFormInstanceRequest: z.ZodObject<{
    formData: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
    dimensionalData: z.ZodOptional<z.ZodObject<{
        contexts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
            period: z.ZodObject<{
                instant: z.ZodOptional<z.ZodDate>;
                startDate: z.ZodOptional<z.ZodDate>;
                endDate: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }, {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }, {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }>, "many">;
        facts: z.ZodArray<z.ZodObject<{
            contextRef: z.ZodString;
            concept: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
            decimals: z.ZodOptional<z.ZodNumber>;
            unitRef: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }, {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    }, {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    formData: Record<string, string | number | boolean | Date | string[] | null>;
    dimensionalData?: {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    } | undefined;
}, {
    formData: Record<string, string | number | boolean | Date | string[] | null>;
    dimensionalData?: {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    } | undefined;
}>;
export type UpdateFormInstanceRequest = z.infer<typeof UpdateFormInstanceRequest>;
export declare const ValidateFormRequest: z.ZodObject<{
    formData: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
    dimensionalData: z.ZodOptional<z.ZodObject<{
        contexts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
            period: z.ZodObject<{
                instant: z.ZodOptional<z.ZodDate>;
                startDate: z.ZodOptional<z.ZodDate>;
                endDate: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }, {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }, {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }>, "many">;
        facts: z.ZodArray<z.ZodObject<{
            contextRef: z.ZodString;
            concept: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
            decimals: z.ZodOptional<z.ZodNumber>;
            unitRef: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }, {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    }, {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    formData: Record<string, string | number | boolean | Date | string[] | null>;
    dimensionalData?: {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    } | undefined;
}, {
    formData: Record<string, string | number | boolean | Date | string[] | null>;
    dimensionalData?: {
        contexts: {
            id: string;
            dimensions: Record<string, string>;
            period: {
                instant?: Date | undefined;
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            };
        }[];
        facts: {
            value: string | number | boolean;
            contextRef: string;
            concept: string;
            decimals?: number | undefined;
            unitRef?: string | undefined;
        }[];
    } | undefined;
}>;
export type ValidateFormRequest = z.infer<typeof ValidateFormRequest>;
export declare const ValidateFormResponse: z.ZodObject<{
    isValid: z.ZodBoolean;
    errors: z.ZodArray<z.ZodObject<{
        fieldPath: z.ZodString;
        errorCode: z.ZodString;
        messageDe: z.ZodString;
        messageEn: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
    }, "strip", z.ZodTypeAny, {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        severity: "error" | "warning" | "info";
        messageEn?: string | undefined;
    }, {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        messageEn?: string | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }>, "many">;
    warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        fieldPath: z.ZodString;
        errorCode: z.ZodString;
        messageDe: z.ZodString;
        messageEn: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
    }, "strip", z.ZodTypeAny, {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        severity: "error" | "warning" | "info";
        messageEn?: string | undefined;
    }, {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        messageEn?: string | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    isValid: boolean;
    errors: {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        severity: "error" | "warning" | "info";
        messageEn?: string | undefined;
    }[];
    warnings: {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        severity: "error" | "warning" | "info";
        messageEn?: string | undefined;
    }[];
}, {
    isValid: boolean;
    errors: {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        messageEn?: string | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }[];
    warnings?: {
        fieldPath: string;
        errorCode: string;
        messageDe: string;
        messageEn?: string | undefined;
        severity?: "error" | "warning" | "info" | undefined;
    }[] | undefined;
}>;
export type ValidateFormResponse = z.infer<typeof ValidateFormResponse>;
export declare const GenerateXBRLRequest: z.ZodObject<{
    formInstanceIds: z.ZodArray<z.ZodString, "many">;
    reportingPeriod: z.ZodDate;
    includeValidation: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reportingPeriod: Date;
    formInstanceIds: string[];
    includeValidation: boolean;
}, {
    reportingPeriod: Date;
    formInstanceIds: string[];
    includeValidation?: boolean | undefined;
}>;
export type GenerateXBRLRequest = z.infer<typeof GenerateXBRLRequest>;
export declare const GenerateXBRLResponse: z.ZodObject<{
    xbrlDocument: z.ZodString;
    fileName: z.ZodString;
    validationResults: z.ZodOptional<z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodObject<{
            fieldPath: z.ZodString;
            errorCode: z.ZodString;
            messageDe: z.ZodString;
            messageEn: z.ZodOptional<z.ZodString>;
            severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
        }, "strip", z.ZodTypeAny, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }>, "many">;
        warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
            fieldPath: z.ZodString;
            errorCode: z.ZodString;
            messageDe: z.ZodString;
            messageEn: z.ZodOptional<z.ZodString>;
            severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
        }, "strip", z.ZodTypeAny, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }[];
        warnings: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }[];
    }, {
        isValid: boolean;
        errors: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }[];
        warnings?: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }[] | undefined;
    }>>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    xbrlDocument: string;
    fileName: string;
    generatedAt: Date;
    validationResults?: {
        isValid: boolean;
        errors: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }[];
        warnings: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }[];
    } | undefined;
}, {
    xbrlDocument: string;
    fileName: string;
    generatedAt: Date;
    validationResults?: {
        isValid: boolean;
        errors: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }[];
        warnings?: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }[] | undefined;
    } | undefined;
}>;
export type GenerateXBRLResponse = z.infer<typeof GenerateXBRLResponse>;
export declare const OpenRowSection: z.ZodObject<{
    code: z.ZodString;
    nameDe: z.ZodString;
    nameEn: z.ZodOptional<z.ZodString>;
    fields: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        conceptCode: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
        mandatory: z.ZodDefault<z.ZodBoolean>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
        validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        helpTextDe: z.ZodOptional<z.ZodString>;
        helpTextEn: z.ZodOptional<z.ZodString>;
        domainCode: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        validationRules: string[];
        mandatory: boolean;
        conceptCode: string;
        dependencies: string[];
        conditionallyVisible: boolean;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
    }, {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        conceptCode: string;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        validationRules?: string[] | undefined;
        mandatory?: boolean | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
        dependencies?: string[] | undefined;
        conditionallyVisible?: boolean | undefined;
    }>, "many">;
    allowMultiple: z.ZodDefault<z.ZodBoolean>;
    minRows: z.ZodDefault<z.ZodNumber>;
    maxRows: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    code: string;
    nameDe: string;
    fields: {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        validationRules: string[];
        mandatory: boolean;
        conceptCode: string;
        dependencies: string[];
        conditionallyVisible: boolean;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
    }[];
    allowMultiple: boolean;
    minRows: number;
    nameEn?: string | undefined;
    maxRows?: number | undefined;
}, {
    code: string;
    nameDe: string;
    fields: {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        conceptCode: string;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        validationRules?: string[] | undefined;
        mandatory?: boolean | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
        dependencies?: string[] | undefined;
        conditionallyVisible?: boolean | undefined;
    }[];
    nameEn?: string | undefined;
    allowMultiple?: boolean | undefined;
    minRows?: number | undefined;
    maxRows?: number | undefined;
}>;
export type OpenRowSection = z.infer<typeof OpenRowSection>;
export declare const FormSection: z.ZodObject<{
    code: z.ZodString;
    nameDe: z.ZodString;
    nameEn: z.ZodOptional<z.ZodString>;
    orderIndex: z.ZodNumber;
    fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        conceptCode: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
        mandatory: z.ZodDefault<z.ZodBoolean>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
        validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        helpTextDe: z.ZodOptional<z.ZodString>;
        helpTextEn: z.ZodOptional<z.ZodString>;
        domainCode: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        validationRules: string[];
        mandatory: boolean;
        conceptCode: string;
        dependencies: string[];
        conditionallyVisible: boolean;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
    }, {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        conceptCode: string;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        validationRules?: string[] | undefined;
        mandatory?: boolean | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
        dependencies?: string[] | undefined;
        conditionallyVisible?: boolean | undefined;
    }>, "many">>;
    openRowSections: z.ZodDefault<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        fields: z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            conceptCode: z.ZodString;
            nameDe: z.ZodString;
            nameEn: z.ZodOptional<z.ZodString>;
            dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
            mandatory: z.ZodDefault<z.ZodBoolean>;
            value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
            validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            helpTextDe: z.ZodOptional<z.ZodString>;
            helpTextEn: z.ZodOptional<z.ZodString>;
            domainCode: z.ZodOptional<z.ZodString>;
            dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }, {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }>, "many">;
        allowMultiple: z.ZodDefault<z.ZodBoolean>;
        minRows: z.ZodDefault<z.ZodNumber>;
        maxRows: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nameDe: string;
        fields: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }[];
        allowMultiple: boolean;
        minRows: number;
        nameEn?: string | undefined;
        maxRows?: number | undefined;
    }, {
        code: string;
        nameDe: string;
        fields: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }[];
        nameEn?: string | undefined;
        allowMultiple?: boolean | undefined;
        minRows?: number | undefined;
        maxRows?: number | undefined;
    }>, "many">>;
    conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
    visibilityConditions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    nameDe: string;
    orderIndex: number;
    conditionallyVisible: boolean;
    fields: {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        validationRules: string[];
        mandatory: boolean;
        conceptCode: string;
        dependencies: string[];
        conditionallyVisible: boolean;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
    }[];
    openRowSections: {
        code: string;
        nameDe: string;
        fields: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }[];
        allowMultiple: boolean;
        minRows: number;
        nameEn?: string | undefined;
        maxRows?: number | undefined;
    }[];
    visibilityConditions: Record<string, string | number | boolean | Date | string[] | null>;
    nameEn?: string | undefined;
}, {
    code: string;
    nameDe: string;
    orderIndex: number;
    nameEn?: string | undefined;
    conditionallyVisible?: boolean | undefined;
    fields?: {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        conceptCode: string;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        validationRules?: string[] | undefined;
        mandatory?: boolean | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
        dependencies?: string[] | undefined;
        conditionallyVisible?: boolean | undefined;
    }[] | undefined;
    openRowSections?: {
        code: string;
        nameDe: string;
        fields: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }[];
        nameEn?: string | undefined;
        allowMultiple?: boolean | undefined;
        minRows?: number | undefined;
        maxRows?: number | undefined;
    }[] | undefined;
    visibilityConditions?: Record<string, string | number | boolean | Date | string[] | null> | undefined;
}>;
export type FormSection = z.infer<typeof FormSection>;
export declare const FormStructure: z.ZodObject<{
    formDefinition: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["GRP", "RSK", "RDP", "ILAAP", "KPL", "STA", "STKK", "RTFK", "STG", "DBL", "OTHER"]>;
        version: z.ZodDefault<z.ZodString>;
        effectiveDate: z.ZodDate;
        validUntil: z.ZodOptional<z.ZodDate>;
        schemaStructure: z.ZodRecord<z.ZodString, z.ZodAny>;
        validationRules: z.ZodRecord<z.ZodString, z.ZodAny>;
        presentationStructure: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        mandatory: z.ZodDefault<z.ZodBoolean>;
        appliesToIndividual: z.ZodDefault<z.ZodBoolean>;
        appliesToConsolidated: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nameDe: string;
        category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
        version: string;
        effectiveDate: Date;
        schemaStructure: Record<string, any>;
        validationRules: Record<string, any>;
        mandatory: boolean;
        appliesToIndividual: boolean;
        appliesToConsolidated: boolean;
        nameEn?: string | undefined;
        validUntil?: Date | undefined;
        presentationStructure?: Record<string, any> | undefined;
    }, {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nameDe: string;
        category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
        effectiveDate: Date;
        schemaStructure: Record<string, any>;
        validationRules: Record<string, any>;
        nameEn?: string | undefined;
        version?: string | undefined;
        validUntil?: Date | undefined;
        presentationStructure?: Record<string, any> | undefined;
        mandatory?: boolean | undefined;
        appliesToIndividual?: boolean | undefined;
        appliesToConsolidated?: boolean | undefined;
    }>;
    sections: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        orderIndex: z.ZodNumber;
        fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            conceptCode: z.ZodString;
            nameDe: z.ZodString;
            nameEn: z.ZodOptional<z.ZodString>;
            dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
            mandatory: z.ZodDefault<z.ZodBoolean>;
            value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
            validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            helpTextDe: z.ZodOptional<z.ZodString>;
            helpTextEn: z.ZodOptional<z.ZodString>;
            domainCode: z.ZodOptional<z.ZodString>;
            dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }, {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }>, "many">>;
        openRowSections: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            nameDe: z.ZodString;
            nameEn: z.ZodOptional<z.ZodString>;
            fields: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                conceptCode: z.ZodString;
                nameDe: z.ZodString;
                nameEn: z.ZodOptional<z.ZodString>;
                dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
                mandatory: z.ZodDefault<z.ZodBoolean>;
                value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
                validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                helpTextDe: z.ZodOptional<z.ZodString>;
                helpTextEn: z.ZodOptional<z.ZodString>;
                domainCode: z.ZodOptional<z.ZodString>;
                dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }, {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }>, "many">;
            allowMultiple: z.ZodDefault<z.ZodBoolean>;
            minRows: z.ZodDefault<z.ZodNumber>;
            maxRows: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }[];
            allowMultiple: boolean;
            minRows: number;
            nameEn?: string | undefined;
            maxRows?: number | undefined;
        }, {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }[];
            nameEn?: string | undefined;
            allowMultiple?: boolean | undefined;
            minRows?: number | undefined;
            maxRows?: number | undefined;
        }>, "many">>;
        conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
        visibilityConditions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nameDe: string;
        orderIndex: number;
        conditionallyVisible: boolean;
        fields: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }[];
        openRowSections: {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }[];
            allowMultiple: boolean;
            minRows: number;
            nameEn?: string | undefined;
            maxRows?: number | undefined;
        }[];
        visibilityConditions: Record<string, string | number | boolean | Date | string[] | null>;
        nameEn?: string | undefined;
    }, {
        code: string;
        nameDe: string;
        orderIndex: number;
        nameEn?: string | undefined;
        conditionallyVisible?: boolean | undefined;
        fields?: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }[] | undefined;
        openRowSections?: {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }[];
            nameEn?: string | undefined;
            allowMultiple?: boolean | undefined;
            minRows?: number | undefined;
            maxRows?: number | undefined;
        }[] | undefined;
        visibilityConditions?: Record<string, string | number | boolean | Date | string[] | null> | undefined;
    }>, "many">;
    totalFields: z.ZodNumber;
    mandatoryFields: z.ZodNumber;
    estimatedCompletionTime: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    formDefinition: {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nameDe: string;
        category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
        version: string;
        effectiveDate: Date;
        schemaStructure: Record<string, any>;
        validationRules: Record<string, any>;
        mandatory: boolean;
        appliesToIndividual: boolean;
        appliesToConsolidated: boolean;
        nameEn?: string | undefined;
        validUntil?: Date | undefined;
        presentationStructure?: Record<string, any> | undefined;
    };
    sections: {
        code: string;
        nameDe: string;
        orderIndex: number;
        conditionallyVisible: boolean;
        fields: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }[];
        openRowSections: {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }[];
            allowMultiple: boolean;
            minRows: number;
            nameEn?: string | undefined;
            maxRows?: number | undefined;
        }[];
        visibilityConditions: Record<string, string | number | boolean | Date | string[] | null>;
        nameEn?: string | undefined;
    }[];
    totalFields: number;
    mandatoryFields: number;
    estimatedCompletionTime?: number | undefined;
}, {
    formDefinition: {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nameDe: string;
        category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
        effectiveDate: Date;
        schemaStructure: Record<string, any>;
        validationRules: Record<string, any>;
        nameEn?: string | undefined;
        version?: string | undefined;
        validUntil?: Date | undefined;
        presentationStructure?: Record<string, any> | undefined;
        mandatory?: boolean | undefined;
        appliesToIndividual?: boolean | undefined;
        appliesToConsolidated?: boolean | undefined;
    };
    sections: {
        code: string;
        nameDe: string;
        orderIndex: number;
        nameEn?: string | undefined;
        conditionallyVisible?: boolean | undefined;
        fields?: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }[] | undefined;
        openRowSections?: {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }[];
            nameEn?: string | undefined;
            allowMultiple?: boolean | undefined;
            minRows?: number | undefined;
            maxRows?: number | undefined;
        }[] | undefined;
        visibilityConditions?: Record<string, string | number | boolean | Date | string[] | null> | undefined;
    }[];
    totalFields: number;
    mandatoryFields: number;
    estimatedCompletionTime?: number | undefined;
}>;
export type FormStructure = z.infer<typeof FormStructure>;
export declare const APIError: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    timestamp: Date;
    details?: Record<string, any> | undefined;
}, {
    code: string;
    message: string;
    timestamp: Date;
    details?: Record<string, any> | undefined;
}>;
export type APIError = z.infer<typeof APIError>;
export declare const FormCompletionStatus: z.ZodObject<{
    formDefinitionId: z.ZodString;
    formCode: z.ZodString;
    formNameDe: z.ZodString;
    status: z.ZodEnum<["draft", "in_review", "submitted", "accepted", "rejected"]>;
    completionPercentage: z.ZodNumber;
    mandatoryFieldsCompleted: z.ZodNumber;
    totalMandatoryFields: z.ZodNumber;
    lastUpdated: z.ZodOptional<z.ZodDate>;
    daysUntilDeadline: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
    formDefinitionId: string;
    formCode: string;
    formNameDe: string;
    completionPercentage: number;
    mandatoryFieldsCompleted: number;
    totalMandatoryFields: number;
    lastUpdated?: Date | undefined;
    daysUntilDeadline?: number | undefined;
}, {
    status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
    formDefinitionId: string;
    formCode: string;
    formNameDe: string;
    completionPercentage: number;
    mandatoryFieldsCompleted: number;
    totalMandatoryFields: number;
    lastUpdated?: Date | undefined;
    daysUntilDeadline?: number | undefined;
}>;
export type FormCompletionStatus = z.infer<typeof FormCompletionStatus>;
export declare const InstitutionDashboard: z.ZodObject<{
    institution: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        bik: z.ZodString;
        instituteType: z.ZodEnum<["bank", "savings_bank", "cooperative_bank", "building_society", "investment_firm", "other"]>;
        exemptionCategory: z.ZodOptional<z.ZodEnum<["section_53b", "section_53c", "securities_trading_bank", "risk_management_exemption", "none"]>>;
        parentInstitutionId: z.ZodOptional<z.ZodString>;
        isConsolidatedReporting: z.ZodDefault<z.ZodBoolean>;
        addressStreet: z.ZodOptional<z.ZodString>;
        addressCity: z.ZodOptional<z.ZodString>;
        addressPostalCode: z.ZodOptional<z.ZodString>;
        addressCountry: z.ZodDefault<z.ZodString>;
        contactPerson: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodOptional<z.ZodString>;
        contactPhone: z.ZodOptional<z.ZodString>;
        active: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        isConsolidatedReporting: boolean;
        addressCountry: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
    }, {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        isConsolidatedReporting?: boolean | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        addressCountry?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
        active?: boolean | undefined;
    }>;
    reportingPeriod: z.ZodDate;
    formsStatus: z.ZodArray<z.ZodObject<{
        formDefinitionId: z.ZodString;
        formCode: z.ZodString;
        formNameDe: z.ZodString;
        status: z.ZodEnum<["draft", "in_review", "submitted", "accepted", "rejected"]>;
        completionPercentage: z.ZodNumber;
        mandatoryFieldsCompleted: z.ZodNumber;
        totalMandatoryFields: z.ZodNumber;
        lastUpdated: z.ZodOptional<z.ZodDate>;
        daysUntilDeadline: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
        formDefinitionId: string;
        formCode: string;
        formNameDe: string;
        completionPercentage: number;
        mandatoryFieldsCompleted: number;
        totalMandatoryFields: number;
        lastUpdated?: Date | undefined;
        daysUntilDeadline?: number | undefined;
    }, {
        status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
        formDefinitionId: string;
        formCode: string;
        formNameDe: string;
        completionPercentage: number;
        mandatoryFieldsCompleted: number;
        totalMandatoryFields: number;
        lastUpdated?: Date | undefined;
        daysUntilDeadline?: number | undefined;
    }>, "many">;
    overallCompletionPercentage: z.ZodNumber;
    formsWithErrors: z.ZodNumber;
    submissionDeadline: z.ZodOptional<z.ZodDate>;
    lastActivity: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    reportingPeriod: Date;
    institution: {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        isConsolidatedReporting: boolean;
        addressCountry: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
    };
    formsStatus: {
        status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
        formDefinitionId: string;
        formCode: string;
        formNameDe: string;
        completionPercentage: number;
        mandatoryFieldsCompleted: number;
        totalMandatoryFields: number;
        lastUpdated?: Date | undefined;
        daysUntilDeadline?: number | undefined;
    }[];
    overallCompletionPercentage: number;
    formsWithErrors: number;
    submissionDeadline?: Date | undefined;
    lastActivity?: Date | undefined;
}, {
    reportingPeriod: Date;
    institution: {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        isConsolidatedReporting?: boolean | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        addressCountry?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
        active?: boolean | undefined;
    };
    formsStatus: {
        status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
        formDefinitionId: string;
        formCode: string;
        formNameDe: string;
        completionPercentage: number;
        mandatoryFieldsCompleted: number;
        totalMandatoryFields: number;
        lastUpdated?: Date | undefined;
        daysUntilDeadline?: number | undefined;
    }[];
    overallCompletionPercentage: number;
    formsWithErrors: number;
    submissionDeadline?: Date | undefined;
    lastActivity?: Date | undefined;
}>;
export type InstitutionDashboard = z.infer<typeof InstitutionDashboard>;
export declare const schemas: {
    Institution: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        bik: z.ZodString;
        instituteType: z.ZodEnum<["bank", "savings_bank", "cooperative_bank", "building_society", "investment_firm", "other"]>;
        exemptionCategory: z.ZodOptional<z.ZodEnum<["section_53b", "section_53c", "securities_trading_bank", "risk_management_exemption", "none"]>>;
        parentInstitutionId: z.ZodOptional<z.ZodString>;
        isConsolidatedReporting: z.ZodDefault<z.ZodBoolean>;
        addressStreet: z.ZodOptional<z.ZodString>;
        addressCity: z.ZodOptional<z.ZodString>;
        addressPostalCode: z.ZodOptional<z.ZodString>;
        addressCountry: z.ZodDefault<z.ZodString>;
        contactPerson: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodOptional<z.ZodString>;
        contactPhone: z.ZodOptional<z.ZodString>;
        active: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        isConsolidatedReporting: boolean;
        addressCountry: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
    }, {
        id: string;
        name: string;
        bik: string;
        instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
        createdAt: Date;
        updatedAt: Date;
        exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
        parentInstitutionId?: string | undefined;
        isConsolidatedReporting?: boolean | undefined;
        addressStreet?: string | undefined;
        addressCity?: string | undefined;
        addressPostalCode?: string | undefined;
        addressCountry?: string | undefined;
        contactPerson?: string | undefined;
        contactEmail?: string | undefined;
        contactPhone?: string | undefined;
        active?: boolean | undefined;
    }>;
    User: z.ZodObject<{
        id: z.ZodString;
        institutionId: z.ZodString;
        username: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodEnum<["admin", "compliance_officer", "risk_manager", "data_entry", "reviewer", "viewer"]>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        lastLogin: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
        isActive: boolean;
        lastLogin?: Date | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
        isActive?: boolean | undefined;
        lastLogin?: Date | undefined;
    }>;
    Dimension: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<["explicit", "typed"]>>;
        domainCode: z.ZodOptional<z.ZodString>;
        validFrom: z.ZodDate;
        validTo: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        code: string;
        type: "explicit" | "typed";
        id: string;
        createdAt: Date;
        nameDe: string;
        validFrom: Date;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        validTo?: Date | undefined;
    }, {
        code: string;
        id: string;
        createdAt: Date;
        nameDe: string;
        validFrom: Date;
        type?: "explicit" | "typed" | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        validTo?: Date | undefined;
    }>;
    DimensionMember: z.ZodObject<{
        id: z.ZodString;
        dimensionId: z.ZodString;
        code: z.ZodString;
        labelDe: z.ZodString;
        labelEn: z.ZodOptional<z.ZodString>;
        parentId: z.ZodOptional<z.ZodString>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
        isAbstract: z.ZodDefault<z.ZodBoolean>;
        validFrom: z.ZodDate;
        validTo: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        createdAt: Date;
        validFrom: Date;
        dimensionId: string;
        labelDe: string;
        orderIndex: number;
        isAbstract: boolean;
        validTo?: Date | undefined;
        labelEn?: string | undefined;
        parentId?: string | undefined;
    }, {
        code: string;
        id: string;
        createdAt: Date;
        validFrom: Date;
        dimensionId: string;
        labelDe: string;
        validTo?: Date | undefined;
        labelEn?: string | undefined;
        parentId?: string | undefined;
        orderIndex?: number | undefined;
        isAbstract?: boolean | undefined;
    }>;
    Concept: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
        periodType: z.ZodDefault<z.ZodEnum<["instant", "duration"]>>;
        balanceType: z.ZodOptional<z.ZodEnum<["credit", "debit"]>>;
        validationPattern: z.ZodOptional<z.ZodString>;
        unitType: z.ZodDefault<z.ZodString>;
        isAbstract: z.ZodDefault<z.ZodBoolean>;
        substitutionGroup: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        createdAt: Date;
        nameDe: string;
        isAbstract: boolean;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        periodType: "instant" | "duration";
        unitType: string;
        nameEn?: string | undefined;
        balanceType?: "credit" | "debit" | undefined;
        validationPattern?: string | undefined;
        substitutionGroup?: string | undefined;
    }, {
        code: string;
        id: string;
        createdAt: Date;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        nameEn?: string | undefined;
        isAbstract?: boolean | undefined;
        periodType?: "instant" | "duration" | undefined;
        balanceType?: "credit" | "debit" | undefined;
        validationPattern?: string | undefined;
        unitType?: string | undefined;
        substitutionGroup?: string | undefined;
    }>;
    FormDefinition: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["GRP", "RSK", "RDP", "ILAAP", "KPL", "STA", "STKK", "RTFK", "STG", "DBL", "OTHER"]>;
        version: z.ZodDefault<z.ZodString>;
        effectiveDate: z.ZodDate;
        validUntil: z.ZodOptional<z.ZodDate>;
        schemaStructure: z.ZodRecord<z.ZodString, z.ZodAny>;
        validationRules: z.ZodRecord<z.ZodString, z.ZodAny>;
        presentationStructure: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        mandatory: z.ZodDefault<z.ZodBoolean>;
        appliesToIndividual: z.ZodDefault<z.ZodBoolean>;
        appliesToConsolidated: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nameDe: string;
        category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
        version: string;
        effectiveDate: Date;
        schemaStructure: Record<string, any>;
        validationRules: Record<string, any>;
        mandatory: boolean;
        appliesToIndividual: boolean;
        appliesToConsolidated: boolean;
        nameEn?: string | undefined;
        validUntil?: Date | undefined;
        presentationStructure?: Record<string, any> | undefined;
    }, {
        code: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        nameDe: string;
        category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
        effectiveDate: Date;
        schemaStructure: Record<string, any>;
        validationRules: Record<string, any>;
        nameEn?: string | undefined;
        version?: string | undefined;
        validUntil?: Date | undefined;
        presentationStructure?: Record<string, any> | undefined;
        mandatory?: boolean | undefined;
        appliesToIndividual?: boolean | undefined;
        appliesToConsolidated?: boolean | undefined;
    }>;
    FormInstance: z.ZodObject<{
        id: z.ZodString;
        institutionId: z.ZodString;
        formDefinitionId: z.ZodString;
        reportingPeriod: z.ZodDate;
        status: z.ZodEnum<["draft", "in_review", "submitted", "accepted", "rejected"]>;
        formData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        dimensionalData: z.ZodDefault<z.ZodObject<{
            contexts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
                period: z.ZodObject<{
                    instant: z.ZodOptional<z.ZodDate>;
                    startDate: z.ZodOptional<z.ZodDate>;
                    endDate: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                }, {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }, {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }>, "many">>;
            facts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                contextRef: z.ZodString;
                concept: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
                decimals: z.ZodOptional<z.ZodNumber>;
                unitRef: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }, {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        }, {
            contexts?: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[] | undefined;
            facts?: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[] | undefined;
        }>>;
        validationErrors: z.ZodDefault<z.ZodArray<z.ZodObject<{
            fieldPath: z.ZodString;
            errorCode: z.ZodString;
            messageDe: z.ZodString;
            messageEn: z.ZodOptional<z.ZodString>;
            severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
        }, "strip", z.ZodTypeAny, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }>, "many">>;
        submissionData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        submittedAt: z.ZodOptional<z.ZodDate>;
        reviewedAt: z.ZodOptional<z.ZodDate>;
        approvedAt: z.ZodOptional<z.ZodDate>;
        createdBy: z.ZodString;
        updatedBy: z.ZodOptional<z.ZodString>;
        reviewedBy: z.ZodOptional<z.ZodString>;
        versionNumber: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        formDefinitionId: string;
        reportingPeriod: Date;
        formData: Record<string, any>;
        dimensionalData: {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        };
        validationErrors: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }[];
        createdBy: string;
        versionNumber: number;
        submissionData?: Record<string, any> | undefined;
        submittedAt?: Date | undefined;
        reviewedAt?: Date | undefined;
        approvedAt?: Date | undefined;
        updatedBy?: string | undefined;
        reviewedBy?: string | undefined;
    }, {
        status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
        id: string;
        createdAt: Date;
        updatedAt: Date;
        institutionId: string;
        formDefinitionId: string;
        reportingPeriod: Date;
        createdBy: string;
        formData?: Record<string, any> | undefined;
        dimensionalData?: {
            contexts?: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[] | undefined;
            facts?: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[] | undefined;
        } | undefined;
        validationErrors?: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }[] | undefined;
        submissionData?: Record<string, any> | undefined;
        submittedAt?: Date | undefined;
        reviewedAt?: Date | undefined;
        approvedAt?: Date | undefined;
        updatedBy?: string | undefined;
        reviewedBy?: string | undefined;
        versionNumber?: number | undefined;
    }>;
    ReferenceData: z.ZodObject<{
        id: z.ZodString;
        domainCode: z.ZodString;
        memberCode: z.ZodString;
        labelDe: z.ZodString;
        labelEn: z.ZodOptional<z.ZodString>;
        descriptionDe: z.ZodOptional<z.ZodString>;
        descriptionEn: z.ZodOptional<z.ZodString>;
        parentMemberCode: z.ZodOptional<z.ZodString>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        validFrom: z.ZodDate;
        validTo: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        isActive: boolean;
        domainCode: string;
        validFrom: Date;
        labelDe: string;
        orderIndex: number;
        memberCode: string;
        validTo?: Date | undefined;
        labelEn?: string | undefined;
        descriptionDe?: string | undefined;
        descriptionEn?: string | undefined;
        parentMemberCode?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        domainCode: string;
        validFrom: Date;
        labelDe: string;
        memberCode: string;
        isActive?: boolean | undefined;
        validTo?: Date | undefined;
        labelEn?: string | undefined;
        orderIndex?: number | undefined;
        descriptionDe?: string | undefined;
        descriptionEn?: string | undefined;
        parentMemberCode?: string | undefined;
    }>;
    FormField: z.ZodObject<{
        code: z.ZodString;
        conceptCode: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
        mandatory: z.ZodDefault<z.ZodBoolean>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
        validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        helpTextDe: z.ZodOptional<z.ZodString>;
        helpTextEn: z.ZodOptional<z.ZodString>;
        domainCode: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        validationRules: string[];
        mandatory: boolean;
        conceptCode: string;
        dependencies: string[];
        conditionallyVisible: boolean;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
    }, {
        code: string;
        nameDe: string;
        dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
        conceptCode: string;
        value?: string | number | boolean | Date | string[] | null | undefined;
        nameEn?: string | undefined;
        domainCode?: string | undefined;
        validationRules?: string[] | undefined;
        mandatory?: boolean | undefined;
        helpTextDe?: string | undefined;
        helpTextEn?: string | undefined;
        dependencies?: string[] | undefined;
        conditionallyVisible?: boolean | undefined;
    }>;
    FormSection: z.ZodObject<{
        code: z.ZodString;
        nameDe: z.ZodString;
        nameEn: z.ZodOptional<z.ZodString>;
        orderIndex: z.ZodNumber;
        fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            conceptCode: z.ZodString;
            nameDe: z.ZodString;
            nameEn: z.ZodOptional<z.ZodString>;
            dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
            mandatory: z.ZodDefault<z.ZodBoolean>;
            value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
            validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            helpTextDe: z.ZodOptional<z.ZodString>;
            helpTextEn: z.ZodOptional<z.ZodString>;
            domainCode: z.ZodOptional<z.ZodString>;
            dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }, {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }>, "many">>;
        openRowSections: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            nameDe: z.ZodString;
            nameEn: z.ZodOptional<z.ZodString>;
            fields: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                conceptCode: z.ZodString;
                nameDe: z.ZodString;
                nameEn: z.ZodOptional<z.ZodString>;
                dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
                mandatory: z.ZodDefault<z.ZodBoolean>;
                value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
                validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                helpTextDe: z.ZodOptional<z.ZodString>;
                helpTextEn: z.ZodOptional<z.ZodString>;
                domainCode: z.ZodOptional<z.ZodString>;
                dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }, {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }>, "many">;
            allowMultiple: z.ZodDefault<z.ZodBoolean>;
            minRows: z.ZodDefault<z.ZodNumber>;
            maxRows: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }[];
            allowMultiple: boolean;
            minRows: number;
            nameEn?: string | undefined;
            maxRows?: number | undefined;
        }, {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }[];
            nameEn?: string | undefined;
            allowMultiple?: boolean | undefined;
            minRows?: number | undefined;
            maxRows?: number | undefined;
        }>, "many">>;
        conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
        visibilityConditions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nameDe: string;
        orderIndex: number;
        conditionallyVisible: boolean;
        fields: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            validationRules: string[];
            mandatory: boolean;
            conceptCode: string;
            dependencies: string[];
            conditionallyVisible: boolean;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
        }[];
        openRowSections: {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }[];
            allowMultiple: boolean;
            minRows: number;
            nameEn?: string | undefined;
            maxRows?: number | undefined;
        }[];
        visibilityConditions: Record<string, string | number | boolean | Date | string[] | null>;
        nameEn?: string | undefined;
    }, {
        code: string;
        nameDe: string;
        orderIndex: number;
        nameEn?: string | undefined;
        conditionallyVisible?: boolean | undefined;
        fields?: {
            code: string;
            nameDe: string;
            dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
            conceptCode: string;
            value?: string | number | boolean | Date | string[] | null | undefined;
            nameEn?: string | undefined;
            domainCode?: string | undefined;
            validationRules?: string[] | undefined;
            mandatory?: boolean | undefined;
            helpTextDe?: string | undefined;
            helpTextEn?: string | undefined;
            dependencies?: string[] | undefined;
            conditionallyVisible?: boolean | undefined;
        }[] | undefined;
        openRowSections?: {
            code: string;
            nameDe: string;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }[];
            nameEn?: string | undefined;
            allowMultiple?: boolean | undefined;
            minRows?: number | undefined;
            maxRows?: number | undefined;
        }[] | undefined;
        visibilityConditions?: Record<string, string | number | boolean | Date | string[] | null> | undefined;
    }>;
    FormStructure: z.ZodObject<{
        formDefinition: z.ZodObject<{
            id: z.ZodString;
            code: z.ZodString;
            nameDe: z.ZodString;
            nameEn: z.ZodOptional<z.ZodString>;
            category: z.ZodEnum<["GRP", "RSK", "RDP", "ILAAP", "KPL", "STA", "STKK", "RTFK", "STG", "DBL", "OTHER"]>;
            version: z.ZodDefault<z.ZodString>;
            effectiveDate: z.ZodDate;
            validUntil: z.ZodOptional<z.ZodDate>;
            schemaStructure: z.ZodRecord<z.ZodString, z.ZodAny>;
            validationRules: z.ZodRecord<z.ZodString, z.ZodAny>;
            presentationStructure: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            mandatory: z.ZodDefault<z.ZodBoolean>;
            appliesToIndividual: z.ZodDefault<z.ZodBoolean>;
            appliesToConsolidated: z.ZodDefault<z.ZodBoolean>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            code: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nameDe: string;
            category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
            version: string;
            effectiveDate: Date;
            schemaStructure: Record<string, any>;
            validationRules: Record<string, any>;
            mandatory: boolean;
            appliesToIndividual: boolean;
            appliesToConsolidated: boolean;
            nameEn?: string | undefined;
            validUntil?: Date | undefined;
            presentationStructure?: Record<string, any> | undefined;
        }, {
            code: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nameDe: string;
            category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
            effectiveDate: Date;
            schemaStructure: Record<string, any>;
            validationRules: Record<string, any>;
            nameEn?: string | undefined;
            version?: string | undefined;
            validUntil?: Date | undefined;
            presentationStructure?: Record<string, any> | undefined;
            mandatory?: boolean | undefined;
            appliesToIndividual?: boolean | undefined;
            appliesToConsolidated?: boolean | undefined;
        }>;
        sections: z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            nameDe: z.ZodString;
            nameEn: z.ZodOptional<z.ZodString>;
            orderIndex: z.ZodNumber;
            fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                conceptCode: z.ZodString;
                nameDe: z.ZodString;
                nameEn: z.ZodOptional<z.ZodString>;
                dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
                mandatory: z.ZodDefault<z.ZodBoolean>;
                value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
                validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                helpTextDe: z.ZodOptional<z.ZodString>;
                helpTextEn: z.ZodOptional<z.ZodString>;
                domainCode: z.ZodOptional<z.ZodString>;
                dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }, {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }>, "many">>;
            openRowSections: z.ZodDefault<z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                nameDe: z.ZodString;
                nameEn: z.ZodOptional<z.ZodString>;
                fields: z.ZodArray<z.ZodObject<{
                    code: z.ZodString;
                    conceptCode: z.ZodString;
                    nameDe: z.ZodString;
                    nameEn: z.ZodOptional<z.ZodString>;
                    dataType: z.ZodEnum<["si6", "mi1", "pi2", "ii3", "li1", "di5", "bi7", "ci1", "ti1", "url", "mem", "bool", "date"]>;
                    mandatory: z.ZodDefault<z.ZodBoolean>;
                    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
                    validationRules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    helpTextDe: z.ZodOptional<z.ZodString>;
                    helpTextEn: z.ZodOptional<z.ZodString>;
                    domainCode: z.ZodOptional<z.ZodString>;
                    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
                }, "strip", z.ZodTypeAny, {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    validationRules: string[];
                    mandatory: boolean;
                    conceptCode: string;
                    dependencies: string[];
                    conditionallyVisible: boolean;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                }, {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    conceptCode: string;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    validationRules?: string[] | undefined;
                    mandatory?: boolean | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                    dependencies?: string[] | undefined;
                    conditionallyVisible?: boolean | undefined;
                }>, "many">;
                allowMultiple: z.ZodDefault<z.ZodBoolean>;
                minRows: z.ZodDefault<z.ZodNumber>;
                maxRows: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                nameDe: string;
                fields: {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    validationRules: string[];
                    mandatory: boolean;
                    conceptCode: string;
                    dependencies: string[];
                    conditionallyVisible: boolean;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                }[];
                allowMultiple: boolean;
                minRows: number;
                nameEn?: string | undefined;
                maxRows?: number | undefined;
            }, {
                code: string;
                nameDe: string;
                fields: {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    conceptCode: string;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    validationRules?: string[] | undefined;
                    mandatory?: boolean | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                    dependencies?: string[] | undefined;
                    conditionallyVisible?: boolean | undefined;
                }[];
                nameEn?: string | undefined;
                allowMultiple?: boolean | undefined;
                minRows?: number | undefined;
                maxRows?: number | undefined;
            }>, "many">>;
            conditionallyVisible: z.ZodDefault<z.ZodBoolean>;
            visibilityConditions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            nameDe: string;
            orderIndex: number;
            conditionallyVisible: boolean;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }[];
            openRowSections: {
                code: string;
                nameDe: string;
                fields: {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    validationRules: string[];
                    mandatory: boolean;
                    conceptCode: string;
                    dependencies: string[];
                    conditionallyVisible: boolean;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                }[];
                allowMultiple: boolean;
                minRows: number;
                nameEn?: string | undefined;
                maxRows?: number | undefined;
            }[];
            visibilityConditions: Record<string, string | number | boolean | Date | string[] | null>;
            nameEn?: string | undefined;
        }, {
            code: string;
            nameDe: string;
            orderIndex: number;
            nameEn?: string | undefined;
            conditionallyVisible?: boolean | undefined;
            fields?: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }[] | undefined;
            openRowSections?: {
                code: string;
                nameDe: string;
                fields: {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    conceptCode: string;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    validationRules?: string[] | undefined;
                    mandatory?: boolean | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                    dependencies?: string[] | undefined;
                    conditionallyVisible?: boolean | undefined;
                }[];
                nameEn?: string | undefined;
                allowMultiple?: boolean | undefined;
                minRows?: number | undefined;
                maxRows?: number | undefined;
            }[] | undefined;
            visibilityConditions?: Record<string, string | number | boolean | Date | string[] | null> | undefined;
        }>, "many">;
        totalFields: z.ZodNumber;
        mandatoryFields: z.ZodNumber;
        estimatedCompletionTime: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        formDefinition: {
            code: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nameDe: string;
            category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
            version: string;
            effectiveDate: Date;
            schemaStructure: Record<string, any>;
            validationRules: Record<string, any>;
            mandatory: boolean;
            appliesToIndividual: boolean;
            appliesToConsolidated: boolean;
            nameEn?: string | undefined;
            validUntil?: Date | undefined;
            presentationStructure?: Record<string, any> | undefined;
        };
        sections: {
            code: string;
            nameDe: string;
            orderIndex: number;
            conditionallyVisible: boolean;
            fields: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                validationRules: string[];
                mandatory: boolean;
                conceptCode: string;
                dependencies: string[];
                conditionallyVisible: boolean;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
            }[];
            openRowSections: {
                code: string;
                nameDe: string;
                fields: {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    validationRules: string[];
                    mandatory: boolean;
                    conceptCode: string;
                    dependencies: string[];
                    conditionallyVisible: boolean;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                }[];
                allowMultiple: boolean;
                minRows: number;
                nameEn?: string | undefined;
                maxRows?: number | undefined;
            }[];
            visibilityConditions: Record<string, string | number | boolean | Date | string[] | null>;
            nameEn?: string | undefined;
        }[];
        totalFields: number;
        mandatoryFields: number;
        estimatedCompletionTime?: number | undefined;
    }, {
        formDefinition: {
            code: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nameDe: string;
            category: "GRP" | "RSK" | "RDP" | "ILAAP" | "KPL" | "STA" | "STKK" | "RTFK" | "STG" | "DBL" | "OTHER";
            effectiveDate: Date;
            schemaStructure: Record<string, any>;
            validationRules: Record<string, any>;
            nameEn?: string | undefined;
            version?: string | undefined;
            validUntil?: Date | undefined;
            presentationStructure?: Record<string, any> | undefined;
            mandatory?: boolean | undefined;
            appliesToIndividual?: boolean | undefined;
            appliesToConsolidated?: boolean | undefined;
        };
        sections: {
            code: string;
            nameDe: string;
            orderIndex: number;
            nameEn?: string | undefined;
            conditionallyVisible?: boolean | undefined;
            fields?: {
                code: string;
                nameDe: string;
                dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                conceptCode: string;
                value?: string | number | boolean | Date | string[] | null | undefined;
                nameEn?: string | undefined;
                domainCode?: string | undefined;
                validationRules?: string[] | undefined;
                mandatory?: boolean | undefined;
                helpTextDe?: string | undefined;
                helpTextEn?: string | undefined;
                dependencies?: string[] | undefined;
                conditionallyVisible?: boolean | undefined;
            }[] | undefined;
            openRowSections?: {
                code: string;
                nameDe: string;
                fields: {
                    code: string;
                    nameDe: string;
                    dataType: "si6" | "mi1" | "pi2" | "ii3" | "li1" | "di5" | "bi7" | "ci1" | "ti1" | "url" | "mem" | "bool" | "date";
                    conceptCode: string;
                    value?: string | number | boolean | Date | string[] | null | undefined;
                    nameEn?: string | undefined;
                    domainCode?: string | undefined;
                    validationRules?: string[] | undefined;
                    mandatory?: boolean | undefined;
                    helpTextDe?: string | undefined;
                    helpTextEn?: string | undefined;
                    dependencies?: string[] | undefined;
                    conditionallyVisible?: boolean | undefined;
                }[];
                nameEn?: string | undefined;
                allowMultiple?: boolean | undefined;
                minRows?: number | undefined;
                maxRows?: number | undefined;
            }[] | undefined;
            visibilityConditions?: Record<string, string | number | boolean | Date | string[] | null> | undefined;
        }[];
        totalFields: number;
        mandatoryFields: number;
        estimatedCompletionTime?: number | undefined;
    }>;
    LoginRequest: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
        password: string;
    }, {
        username: string;
        password: string;
    }>;
    LoginResponse: z.ZodObject<{
        user: z.ZodObject<{
            id: z.ZodString;
            institutionId: z.ZodString;
            username: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            role: z.ZodEnum<["admin", "compliance_officer", "risk_manager", "data_entry", "reviewer", "viewer"]>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            lastLogin: z.ZodOptional<z.ZodDate>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            institutionId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
            isActive: boolean;
            lastLogin?: Date | undefined;
        }, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            institutionId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
            isActive?: boolean | undefined;
            lastLogin?: Date | undefined;
        }>;
        institution: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            bik: z.ZodString;
            instituteType: z.ZodEnum<["bank", "savings_bank", "cooperative_bank", "building_society", "investment_firm", "other"]>;
            exemptionCategory: z.ZodOptional<z.ZodEnum<["section_53b", "section_53c", "securities_trading_bank", "risk_management_exemption", "none"]>>;
            parentInstitutionId: z.ZodOptional<z.ZodString>;
            isConsolidatedReporting: z.ZodDefault<z.ZodBoolean>;
            addressStreet: z.ZodOptional<z.ZodString>;
            addressCity: z.ZodOptional<z.ZodString>;
            addressPostalCode: z.ZodOptional<z.ZodString>;
            addressCountry: z.ZodDefault<z.ZodString>;
            contactPerson: z.ZodOptional<z.ZodString>;
            contactEmail: z.ZodOptional<z.ZodString>;
            contactPhone: z.ZodOptional<z.ZodString>;
            active: z.ZodDefault<z.ZodBoolean>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            isConsolidatedReporting: boolean;
            addressCountry: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
        }, {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            isConsolidatedReporting?: boolean | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            addressCountry?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
            active?: boolean | undefined;
        }>;
        accessToken: z.ZodString;
        refreshToken: z.ZodString;
        expiresIn: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            institutionId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
            isActive: boolean;
            lastLogin?: Date | undefined;
        };
        institution: {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            isConsolidatedReporting: boolean;
            addressCountry: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }, {
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            institutionId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            role: "admin" | "compliance_officer" | "risk_manager" | "data_entry" | "reviewer" | "viewer";
            isActive?: boolean | undefined;
            lastLogin?: Date | undefined;
        };
        institution: {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            isConsolidatedReporting?: boolean | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            addressCountry?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
            active?: boolean | undefined;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    CreateFormInstanceRequest: z.ZodObject<{
        formDefinitionId: z.ZodString;
        reportingPeriod: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        formDefinitionId: string;
        reportingPeriod: Date;
    }, {
        formDefinitionId: string;
        reportingPeriod: Date;
    }>;
    UpdateFormInstanceRequest: z.ZodObject<{
        formData: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
        dimensionalData: z.ZodOptional<z.ZodObject<{
            contexts: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
                period: z.ZodObject<{
                    instant: z.ZodOptional<z.ZodDate>;
                    startDate: z.ZodOptional<z.ZodDate>;
                    endDate: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                }, {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }, {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }>, "many">;
            facts: z.ZodArray<z.ZodObject<{
                contextRef: z.ZodString;
                concept: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
                decimals: z.ZodOptional<z.ZodNumber>;
                unitRef: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }, {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        }, {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        formData: Record<string, string | number | boolean | Date | string[] | null>;
        dimensionalData?: {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        } | undefined;
    }, {
        formData: Record<string, string | number | boolean | Date | string[] | null>;
        dimensionalData?: {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        } | undefined;
    }>;
    ValidateFormRequest: z.ZodObject<{
        formData: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodDate, z.ZodArray<z.ZodString, "many">, z.ZodNull]>>;
        dimensionalData: z.ZodOptional<z.ZodObject<{
            contexts: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                dimensions: z.ZodRecord<z.ZodString, z.ZodString>;
                period: z.ZodObject<{
                    instant: z.ZodOptional<z.ZodDate>;
                    startDate: z.ZodOptional<z.ZodDate>;
                    endDate: z.ZodOptional<z.ZodDate>;
                }, "strip", z.ZodTypeAny, {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                }, {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }, {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }>, "many">;
            facts: z.ZodArray<z.ZodObject<{
                contextRef: z.ZodString;
                concept: z.ZodString;
                value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
                decimals: z.ZodOptional<z.ZodNumber>;
                unitRef: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }, {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        }, {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        formData: Record<string, string | number | boolean | Date | string[] | null>;
        dimensionalData?: {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        } | undefined;
    }, {
        formData: Record<string, string | number | boolean | Date | string[] | null>;
        dimensionalData?: {
            contexts: {
                id: string;
                dimensions: Record<string, string>;
                period: {
                    instant?: Date | undefined;
                    startDate?: Date | undefined;
                    endDate?: Date | undefined;
                };
            }[];
            facts: {
                value: string | number | boolean;
                contextRef: string;
                concept: string;
                decimals?: number | undefined;
                unitRef?: string | undefined;
            }[];
        } | undefined;
    }>;
    ValidateFormResponse: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodObject<{
            fieldPath: z.ZodString;
            errorCode: z.ZodString;
            messageDe: z.ZodString;
            messageEn: z.ZodOptional<z.ZodString>;
            severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
        }, "strip", z.ZodTypeAny, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }>, "many">;
        warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
            fieldPath: z.ZodString;
            errorCode: z.ZodString;
            messageDe: z.ZodString;
            messageEn: z.ZodOptional<z.ZodString>;
            severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
        }, "strip", z.ZodTypeAny, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }, {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }[];
        warnings: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            severity: "error" | "warning" | "info";
            messageEn?: string | undefined;
        }[];
    }, {
        isValid: boolean;
        errors: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }[];
        warnings?: {
            fieldPath: string;
            errorCode: string;
            messageDe: string;
            messageEn?: string | undefined;
            severity?: "error" | "warning" | "info" | undefined;
        }[] | undefined;
    }>;
    GenerateXBRLRequest: z.ZodObject<{
        formInstanceIds: z.ZodArray<z.ZodString, "many">;
        reportingPeriod: z.ZodDate;
        includeValidation: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        reportingPeriod: Date;
        formInstanceIds: string[];
        includeValidation: boolean;
    }, {
        reportingPeriod: Date;
        formInstanceIds: string[];
        includeValidation?: boolean | undefined;
    }>;
    GenerateXBRLResponse: z.ZodObject<{
        xbrlDocument: z.ZodString;
        fileName: z.ZodString;
        validationResults: z.ZodOptional<z.ZodObject<{
            isValid: z.ZodBoolean;
            errors: z.ZodArray<z.ZodObject<{
                fieldPath: z.ZodString;
                errorCode: z.ZodString;
                messageDe: z.ZodString;
                messageEn: z.ZodOptional<z.ZodString>;
                severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
            }, "strip", z.ZodTypeAny, {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                severity: "error" | "warning" | "info";
                messageEn?: string | undefined;
            }, {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                messageEn?: string | undefined;
                severity?: "error" | "warning" | "info" | undefined;
            }>, "many">;
            warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
                fieldPath: z.ZodString;
                errorCode: z.ZodString;
                messageDe: z.ZodString;
                messageEn: z.ZodOptional<z.ZodString>;
                severity: z.ZodDefault<z.ZodEnum<["error", "warning", "info"]>>;
            }, "strip", z.ZodTypeAny, {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                severity: "error" | "warning" | "info";
                messageEn?: string | undefined;
            }, {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                messageEn?: string | undefined;
                severity?: "error" | "warning" | "info" | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            isValid: boolean;
            errors: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                severity: "error" | "warning" | "info";
                messageEn?: string | undefined;
            }[];
            warnings: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                severity: "error" | "warning" | "info";
                messageEn?: string | undefined;
            }[];
        }, {
            isValid: boolean;
            errors: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                messageEn?: string | undefined;
                severity?: "error" | "warning" | "info" | undefined;
            }[];
            warnings?: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                messageEn?: string | undefined;
                severity?: "error" | "warning" | "info" | undefined;
            }[] | undefined;
        }>>;
        generatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        xbrlDocument: string;
        fileName: string;
        generatedAt: Date;
        validationResults?: {
            isValid: boolean;
            errors: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                severity: "error" | "warning" | "info";
                messageEn?: string | undefined;
            }[];
            warnings: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                severity: "error" | "warning" | "info";
                messageEn?: string | undefined;
            }[];
        } | undefined;
    }, {
        xbrlDocument: string;
        fileName: string;
        generatedAt: Date;
        validationResults?: {
            isValid: boolean;
            errors: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                messageEn?: string | undefined;
                severity?: "error" | "warning" | "info" | undefined;
            }[];
            warnings?: {
                fieldPath: string;
                errorCode: string;
                messageDe: string;
                messageEn?: string | undefined;
                severity?: "error" | "warning" | "info" | undefined;
            }[] | undefined;
        } | undefined;
    }>;
    InstitutionDashboard: z.ZodObject<{
        institution: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            bik: z.ZodString;
            instituteType: z.ZodEnum<["bank", "savings_bank", "cooperative_bank", "building_society", "investment_firm", "other"]>;
            exemptionCategory: z.ZodOptional<z.ZodEnum<["section_53b", "section_53c", "securities_trading_bank", "risk_management_exemption", "none"]>>;
            parentInstitutionId: z.ZodOptional<z.ZodString>;
            isConsolidatedReporting: z.ZodDefault<z.ZodBoolean>;
            addressStreet: z.ZodOptional<z.ZodString>;
            addressCity: z.ZodOptional<z.ZodString>;
            addressPostalCode: z.ZodOptional<z.ZodString>;
            addressCountry: z.ZodDefault<z.ZodString>;
            contactPerson: z.ZodOptional<z.ZodString>;
            contactEmail: z.ZodOptional<z.ZodString>;
            contactPhone: z.ZodOptional<z.ZodString>;
            active: z.ZodDefault<z.ZodBoolean>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            isConsolidatedReporting: boolean;
            addressCountry: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
        }, {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            isConsolidatedReporting?: boolean | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            addressCountry?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
            active?: boolean | undefined;
        }>;
        reportingPeriod: z.ZodDate;
        formsStatus: z.ZodArray<z.ZodObject<{
            formDefinitionId: z.ZodString;
            formCode: z.ZodString;
            formNameDe: z.ZodString;
            status: z.ZodEnum<["draft", "in_review", "submitted", "accepted", "rejected"]>;
            completionPercentage: z.ZodNumber;
            mandatoryFieldsCompleted: z.ZodNumber;
            totalMandatoryFields: z.ZodNumber;
            lastUpdated: z.ZodOptional<z.ZodDate>;
            daysUntilDeadline: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
            formDefinitionId: string;
            formCode: string;
            formNameDe: string;
            completionPercentage: number;
            mandatoryFieldsCompleted: number;
            totalMandatoryFields: number;
            lastUpdated?: Date | undefined;
            daysUntilDeadline?: number | undefined;
        }, {
            status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
            formDefinitionId: string;
            formCode: string;
            formNameDe: string;
            completionPercentage: number;
            mandatoryFieldsCompleted: number;
            totalMandatoryFields: number;
            lastUpdated?: Date | undefined;
            daysUntilDeadline?: number | undefined;
        }>, "many">;
        overallCompletionPercentage: z.ZodNumber;
        formsWithErrors: z.ZodNumber;
        submissionDeadline: z.ZodOptional<z.ZodDate>;
        lastActivity: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        reportingPeriod: Date;
        institution: {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            isConsolidatedReporting: boolean;
            addressCountry: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
        };
        formsStatus: {
            status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
            formDefinitionId: string;
            formCode: string;
            formNameDe: string;
            completionPercentage: number;
            mandatoryFieldsCompleted: number;
            totalMandatoryFields: number;
            lastUpdated?: Date | undefined;
            daysUntilDeadline?: number | undefined;
        }[];
        overallCompletionPercentage: number;
        formsWithErrors: number;
        submissionDeadline?: Date | undefined;
        lastActivity?: Date | undefined;
    }, {
        reportingPeriod: Date;
        institution: {
            id: string;
            name: string;
            bik: string;
            instituteType: "bank" | "savings_bank" | "cooperative_bank" | "building_society" | "investment_firm" | "other";
            createdAt: Date;
            updatedAt: Date;
            exemptionCategory?: "section_53b" | "section_53c" | "securities_trading_bank" | "risk_management_exemption" | "none" | undefined;
            parentInstitutionId?: string | undefined;
            isConsolidatedReporting?: boolean | undefined;
            addressStreet?: string | undefined;
            addressCity?: string | undefined;
            addressPostalCode?: string | undefined;
            addressCountry?: string | undefined;
            contactPerson?: string | undefined;
            contactEmail?: string | undefined;
            contactPhone?: string | undefined;
            active?: boolean | undefined;
        };
        formsStatus: {
            status: "draft" | "in_review" | "submitted" | "accepted" | "rejected";
            formDefinitionId: string;
            formCode: string;
            formNameDe: string;
            completionPercentage: number;
            mandatoryFieldsCompleted: number;
            totalMandatoryFields: number;
            lastUpdated?: Date | undefined;
            daysUntilDeadline?: number | undefined;
        }[];
        overallCompletionPercentage: number;
        formsWithErrors: number;
        submissionDeadline?: Date | undefined;
        lastActivity?: Date | undefined;
    }>;
};
//# sourceMappingURL=types.d.ts.map