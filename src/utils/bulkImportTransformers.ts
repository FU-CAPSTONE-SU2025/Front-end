import { BulkAccountPropsCreate } from '../interfaces/IAccount';
import { StudentProfileData } from '../interfaces/IStudent';
import { StaffProfileData } from '../interfaces/IStaff';
import { parseExcelDate, formatDateForDisplay } from './dateUtils';

/**
 * Transform flat Excel data into proper nested structure for bulk account creation
 * Only include the correct fields in each sub-object, with no overlap.
 */
export const transformBulkImportData = (
  flatData: { [key: string]: string }[],
  dataType: string
): BulkAccountPropsCreate[] => {
  return flatData.map(item => {
    // Main fields with safe date parsing
    const baseAccount = {
      email: item.email || '',
      username: item.username || item.email?.split('@')[0] || '',
      password: item.password || 'defaultPassword123',
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      dateOfBirth: parseExcelDate(item.dateOfBirth),
      studentProfileData: null as StudentProfileData | null,
      staffProfileData: null as StaffProfileData | null
    };

    // Only include the correct fields in each sub-object
    switch (dataType) {
      case 'STUDENT':
        return {
          ...baseAccount,
          studentProfileData: {
            numberOfBan: item.numberOfBan ? parseInt(item.numberOfBan) : 0,
            enrolledAt: parseExcelDate(item.enrolledAt || item.enrollDate),
            careerGoal: item.careerGoal || 'Not specified'
          },
          staffProfileData: null
        };
      case 'STAFF':
      case 'MANAGER':
      case 'ADVISOR':
        return {
          ...baseAccount,
          studentProfileData: null,
          staffProfileData: {
            campus: item.campus || '',
            department: item.department || '',
            position: item.position || '',
            startWorkAt: parseExcelDate(item.startWorkAt),
            endWorkAt: parseExcelDate(item.endWorkAt)
          }
        };
      case 'ADMIN':
        return {
          ...baseAccount,
          studentProfileData: null,
          staffProfileData: null
        };
      default:
        console.warn(`Unknown data type: ${dataType}`);
        return baseAccount;
    }
  });
};

/**
 * Get the appropriate API function name for each data type
 * @param dataType - Type of data
 * @returns API function name
 */
export const getApiFunctionName = (dataType: string): string => {
  switch (dataType) {
    case 'STUDENT':
      return 'BulkRegisterStudent';
    case 'STAFF':
      return 'BulkRegisterStaff';
    case 'MANAGER':
      return 'BulkRegisterManager';
    case 'ADVISOR':
      return 'BulkRegisterAdvisor';
    case 'ADMIN':
      return 'BulkRegisterAdmin';
    default:
      return 'Unknown';
  }
};

/**
 * Validate transformed data before sending to API
 * @param data - Transformed data
 * @returns Filtered valid data
 */
export const validateBulkData = (data: BulkAccountPropsCreate[]): BulkAccountPropsCreate[] => {
  return data.filter(item => 
    item.email.trim() !== '' && 
    item.firstName.trim() !== '' && 
    item.lastName.trim() !== ''
  );
};

/**
 * Create preview data structure for display in the import preview table
 * This flattens the nested structure back to a flat format for easy editing
 * Only includes the correct fields for each type.
 */
export const createPreviewData = (
  data: BulkAccountPropsCreate[],
  dataType: string
): { [key: string]: string }[] => {
  return data.map(item => {
    const basePreview: { [key: string]: string } = {
      email: item.email,
      username: item.username,
      password: item.password,
      firstName: item.firstName,
      lastName: item.lastName,
      dateOfBirth: formatDateForDisplay(item.dateOfBirth)
    };
    switch (dataType) {
      case 'STUDENT':
        return {
          ...basePreview,
          enrolledAt: formatDateForDisplay(item.studentProfileData?.enrolledAt),
          careerGoal: item.studentProfileData?.careerGoal || ''
        };
      case 'STAFF':
      case 'MANAGER':
      case 'ADVISOR':
        return {
          ...basePreview,
          campus: item.staffProfileData?.campus || '',
          department: item.staffProfileData?.department || '',
          position: item.staffProfileData?.position || '',
          startWorkAt: formatDateForDisplay(item.staffProfileData?.startWorkAt),
          endWorkAt: formatDateForDisplay(item.staffProfileData?.endWorkAt)
        };
      case 'ADMIN':
        return basePreview;
      default:
        return basePreview;
    }
  });
}; 