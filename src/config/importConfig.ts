/**
 * Import Header Configurations for DataImport Component
 * 
 * This file contains all predefined header configurations for different data types
 * used by the reusable DataImport component across the application.
 */

// Custom header configuration interface
export interface CustomHeaderConfig {
  headers: string[];
  fieldMap: { [header: string]: string };
}

/**
 * Normalize header for flexible matching
 * Converts to lowercase and removes spaces, underscores, and special characters
 */
export const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .replace(/[\s_-]/g, '') // Remove spaces, underscores, and hyphens
    .replace(/[^\w]/g, ''); // Remove any other non-word characters
};

/**
 * Generate all possible header variations for a field
 * Includes: original, camelCase, PascalCase, snake_case, kebab-case, space separated, etc.
 */
export const generateHeaderVariations = (baseField: string): string[] => {
  const variations = new Set<string>();
  
  // Original field name
  variations.add(baseField);
  
  // Convert camelCase to different formats
  const words = baseField.replace(/([A-Z])/g, ' $1').split(/[\s_-]+/).filter(w => w);
  
  // Add various formats
  variations.add(words.join('')); // no spaces, all lowercase
  variations.add(words.map(w => w.toLowerCase()).join('')); // camelCase style
  variations.add(words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')); // PascalCase
  variations.add(words.map(w => w.toLowerCase()).join('_')); // snake_case
  variations.add(words.map(w => w.toLowerCase()).join('-')); // kebab-case
  variations.add(words.map(w => w.toLowerCase()).join(' ')); // space separated lowercase
  variations.add(words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')); // Title Case
  variations.add(words.map(w => w.toUpperCase()).join(' ')); // UPPER CASE
  variations.add(words.map(w => w.toUpperCase()).join('_')); // UPPER_SNAKE_CASE
  
  return Array.from(variations);
};

/**
 * Create a comprehensive field map with all possible header variations
 */
export const createFlexibleFieldMap = (fieldMappings: { [key: string]: string }): { [header: string]: string } => {
  const flexibleMap: { [header: string]: string } = {};
  
  Object.entries(fieldMappings).forEach(([targetField, sourceField]) => {
    const variations = generateHeaderVariations(sourceField);
    variations.forEach(variation => {
      flexibleMap[variation] = targetField;
    });
  });
  
  return flexibleMap;
};

/**
 * Check if headers match a configuration with flexible matching
 */
export const matchesConfiguration = (excelHeaders: string[], configHeaders: readonly string[]): boolean => {
  const normalizedExcelHeaders = excelHeaders.map(normalizeHeader);
  const normalizedConfigHeaders = configHeaders.map(normalizeHeader);
  
  // Check if all required headers are present (flexible matching)
  return normalizedConfigHeaders.every(configHeader => 
    normalizedExcelHeaders.some(excelHeader => excelHeader === configHeader)
  );
};

/**
 * Find matching field name from Excel header using flexible mapping
 */
export const findFieldMapping = (excelHeader: string, fieldMap: { readonly [key: string]: string }): string | undefined => {
  // First try exact match
  if (fieldMap[excelHeader]) {
    return fieldMap[excelHeader];
  }
  
  // Then try normalized matching
  const normalizedExcelHeader = normalizeHeader(excelHeader);
  const matchingEntry = Object.entries(fieldMap).find(([key]) => 
    normalizeHeader(key) === normalizedExcelHeader
  );
  
  return matchingEntry ? matchingEntry[1] : undefined;
};

// Predefined header configurations for different data types
export const HEADER_CONFIGS = {
  STUDENT: {
    headers: ['firstName', 'lastName', 'email', 'password', 'dateOfBirth', 'enrolledAt', 'careerGoal', 'programId', 'curriculumCode'],
    fieldMap: createFlexibleFieldMap({
      'firstName': 'firstName',
      'lastName': 'lastName', 
      'email': 'email',
      'password': 'password',
      'dateOfBirth': 'dateOfBirth',
      'enrolledAt': 'enrolledAt',
      'careerGoal': 'careerGoal',
      'programId': 'programId',
      'curriculumCode': 'curriculumCode'
    })
  },
  STAFF: {
    headers: ['firstName', 'lastName', 'email', 'password', 'dateOfBirth', 'campus', 'department', 'position', 'startWorkAt'],
    fieldMap: createFlexibleFieldMap({
      'firstName': 'firstName',
      'lastName': 'lastName',
      'email': 'email', 
      'password': 'password',
      'dateOfBirth': 'dateOfBirth',
      'campus': 'campus',
      'department': 'department',
      'position': 'position',
      'startWorkAt': 'startWorkAt'
    })
  },
  ADVISOR: {
    headers: ['firstName', 'lastName', 'email', 'password', 'dateOfBirth', 'campus', 'department', 'position', 'startWorkAt'],
    fieldMap: createFlexibleFieldMap({
      'firstName': 'firstName',
      'lastName': 'lastName',
      'email': 'email',
      'password': 'password', 
      'dateOfBirth': 'dateOfBirth',
      'campus': 'campus',
      'department': 'department',
      'position': 'position',
      'startWorkAt': 'startWorkAt'
    })
  },
  MANAGER: {
    headers: ['firstName', 'lastName', 'email', 'password', 'dateOfBirth', 'campus', 'department', 'position', 'startWorkAt'],
    fieldMap: createFlexibleFieldMap({
      'firstName': 'firstName',
      'lastName': 'lastName',
      'email': 'email',
      'password': 'password',
      'dateOfBirth': 'dateOfBirth',
      'campus': 'campus',
      'department': 'department',
      'position': 'position',
      'startWorkAt': 'startWorkAt'
    })
  },
  CURRICULUM: {
    headers: ['programId', 'curriculumCode', 'curriculumName', 'effectiveDate'],
    fieldMap: createFlexibleFieldMap({
      'programId': 'programId',
      'curriculumCode': 'curriculumCode',
      'curriculumName': 'curriculumName',
      'effectiveDate': 'effectiveDate'
    })
  },
  SUBJECT: {
    headers: ['subjectCode', 'subjectName', 'credits', 'description'],
    fieldMap: createFlexibleFieldMap({
      'subjectCode': 'subjectCode',
      'subjectName': 'subjectName',
      'credits': 'credits',
      'description': 'description'
    })
  },
  PROGRAM: {
    headers: ['programCode', 'programName'],
    fieldMap: createFlexibleFieldMap({
      'programCode': 'programCode',
      'programName': 'programName'
    })
  },
  COMBO: {
    headers: ['comboName', 'comboDescription'],
    fieldMap: createFlexibleFieldMap({
      'comboName': 'comboName',
      'comboDescription': 'comboDescription'
    })
  },
  ASSESSMENT: {
    headers: ['syllabusId', 'category', 'quantity', 'weight', 'completionCriteria', 'duration', 'questionType'],
    fieldMap: createFlexibleFieldMap({
      'syllabusId': 'syllabusId',
      'category': 'category',
      'quantity': 'quantity',
      'weight': 'weight',
      'completionCriteria': 'completionCriteria',
      'duration': 'duration', 
      'questionType': 'questionType'
    })
  },
  MATERIAL: {
    headers: ['syllabusId', 'materialName', 'authorName', 'publishedDate', 'description', 'filepathOrUrl'],
    fieldMap: createFlexibleFieldMap({
      'syllabusId': 'syllabusId',
      'materialName': 'materialName',
      'authorName': 'authorName',
      'publishedDate': 'publishedDate',
      'description': 'description',
      'filepathOrUrl': 'filepathOrUrl'
    })
  },
  BULK_JOINED_SUBJECT: {
    headers: ['subjectCode', 'subjectVersionCode', 'semesterId', 'semesterStudyBlockType'],
    fieldMap: createFlexibleFieldMap({
      'subjectCode': 'subjectCode',
      'subjectVersionCode': 'subjectVersionCode',
      'semesterId': 'semesterId',
      'semesterStudyBlockType': 'semesterStudyBlockType'
    })
  },
  BULK_JOINED_SUBJECT_MULTI_STUDENT: {
    headers: ['studentUserName', 'subjectCode', 'subjectVersionCode', 'semesterId', 'semesterStudyBlockType'],
    fieldMap: createFlexibleFieldMap({
      'studentUserName': 'studentUserName',
      'subjectCode': 'subjectCode',
      'subjectVersionCode': 'subjectVersionCode',
      'semesterId': 'semesterId',
      'semesterStudyBlockType': 'semesterStudyBlockType'
    })
  },
  OUTCOME: {
    headers: ['syllabusId', 'outcomeCode', 'description'],
    fieldMap: createFlexibleFieldMap({
      'syllabusId': 'syllabusId',
      'outcomeCode': 'outcomeCode',
      'description': 'description'
    })
  },
  SESSION: {
    headers: ['syllabusId', 'sessionNumber', 'topic', 'mission'],
    fieldMap: createFlexibleFieldMap({
      'syllabusId': 'syllabusId',
      'sessionNumber': 'sessionNumber',
      'topic': 'topic',
      'mission': 'mission'
    })
  },
  // Admin profile configuration (commonly used)
  ADMIN_PROFILE: {
    headers: ['firstName', 'lastName', 'email', 'password', 'dateOfBirth'],
    fieldMap: createFlexibleFieldMap({
      'firstName': 'firstName',
      'lastName': 'lastName',
      'email': 'email',
      'password': 'password',
      'dateOfBirth': 'dateOfBirth'
    })
  },
  // Admin configuration for bulk creation
  ADMIN: {
    headers: ['firstName', 'lastName', 'email', 'password', 'dateOfBirth'],
    fieldMap: createFlexibleFieldMap({
      'firstName': 'firstName',
      'lastName': 'lastName',
      'email': 'email',
      'password': 'password',
      'dateOfBirth': 'dateOfBirth'
    })
  }
} as const;

// Type for predefined header configurations
export type HeaderConfigType = keyof typeof HEADER_CONFIGS;

// Union type for all possible header configurations
export type HeaderConfiguration = HeaderConfigType | CustomHeaderConfig;

/**
 * Helper function to get header configuration
 * @param headerConfig - Either a predefined type or custom configuration
 * @returns The actual header configuration object
 */
export const getHeaderConfig = (headerConfig: HeaderConfiguration): { headers: readonly string[]; fieldMap: { readonly [key: string]: string } } => {
  if (typeof headerConfig === 'string') {
    return HEADER_CONFIGS[headerConfig];
  }
  return headerConfig;
};

/**
 * Helper function to get available predefined header types
 * @returns Array of available header configuration keys
 */
export const getAvailableHeaderTypes = (): HeaderConfigType[] => {
  return Object.keys(HEADER_CONFIGS) as HeaderConfigType[];
};

/**
 * Helper function to validate if a header type exists
 * @param headerType - The header type to validate
 * @returns True if the header type exists
 */
export const isValidHeaderType = (headerType: string): headerType is HeaderConfigType => {
  return headerType in HEADER_CONFIGS;
}; 