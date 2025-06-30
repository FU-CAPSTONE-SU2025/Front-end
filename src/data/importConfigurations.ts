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

// Predefined header configurations for different data types
export const HEADER_CONFIGS = {
  STUDENT: {
    headers: ['First Name', 'Last Name', 'Email', 'Password', 'Address', 'Phone', 'Date of Birth', 'Student Code', 'Enroll Date'],
    fieldMap: {
      'First Name': 'firstName',
      'Last Name': 'lastName',
      'Email': 'email',
      'Password': 'password',
      'Address': 'address',
      'Phone': 'phone',
      'Date of Birth': 'dateOfBirth',
      'Student Code': 'studentCode',
      'Enroll Date': 'enrollDate'
    }
  },
  STAFF: {
    headers: ['First Name', 'Last Name', 'Email', 'Password', 'Address', 'Phone', 'Date of Birth', 'Campus', 'Department', 'Position', 'Start Work Date'],
    fieldMap: {
      'First Name': 'firstName',
      'Last Name': 'lastName',
      'Email': 'email',
      'Password': 'password',
      'Address': 'address',
      'Phone': 'phone',
      'Date of Birth': 'dateOfBirth',
      'Campus': 'campus',
      'Department': 'department',
      'Position': 'position',
      'Start Work Date': 'startWorkAt'
    }
  },
  CURRICULUM: {
    headers: ['Program Code', 'Curriculum Code', 'Curriculum Name', 'Effective Date'],
    fieldMap: {
      'Program Code': 'programCode',
      'Curriculum Code': 'curriculumCode',
      'Curriculum Name': 'curriculumName',
      'Effective Date': 'effectiveDate'
    }
  },
  SUBJECT: {
    headers: ['Subject Code', 'Subject Name', 'Credits', 'Description'],
    fieldMap: {
      'Subject Code': 'subjectCode',
      'Subject Name': 'subjectName',
      'Credits': 'credits',
      'Description': 'description'
    }
  },
  PROGRAM: {
    headers: ['Program Code', 'Program Name'],
    fieldMap: {
      'Program Code': 'programCode',
      'Program Name': 'programName'
    }
  },
  COMBO: {
    headers: ['Combo Name', 'Combo Description'],
    fieldMap: {
      'Combo Name': 'comboName',
      'Combo Description': 'comboDescription'
    }
  },
  // Admin profile configuration (commonly used)
  ADMIN_PROFILE: {
    headers: ['First Name', 'Last Name', 'Email', 'Password', 'Address', 'Phone', 'Date of Birth'],
    fieldMap: {
      'First Name': 'firstName',
      'Last Name': 'lastName',
      'Email': 'email',
      'Password': 'password',
      'Address': 'address',
      'Phone': 'phone',
      'Date of Birth': 'dateOfBirth'
    }
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