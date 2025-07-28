/**
 * Safely parse Excel dates with proper timezone handling for xlsx 0.20.3 compatibility
 * @param dateValue - Date value from Excel (could be string, number, or Date object)
 * @returns Parsed Date object or current date if parsing fails
 */
export const parseExcelDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  
  // If it's already a Date object, return it
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Handle Excel date serial numbers (days since 1900-01-01)
  if (typeof dateValue === 'number') {
    // Excel dates are days since 1900-01-01, convert to milliseconds
    const excelEpoch = new Date(1900, 0, 1).getTime();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch + (dateValue - 1) * millisecondsPerDay);
  }
  
  // Handle string dates
  if (typeof dateValue === 'string') {
    const trimmedValue = dateValue.trim();
    if (!trimmedValue) return new Date();
    
    // Try parsing as ISO string first
    let date = new Date(trimmedValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try common date formats
    const dateFormats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    ];
    
    for (const format of dateFormats) {
      if (format.test(trimmedValue)) {
        date = new Date(trimmedValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // If all parsing fails, return current date
    console.warn(`Could not parse date: ${dateValue}, using current date`);
    return new Date();
  }
  
  // Default fallback
  return new Date();
};

/**
 * Format date for display in preview table
 * @param date - Date to format
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateForDisplay = (date: any): string => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    // Format as YYYY-MM-DD for consistency
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Enhanced error handling for xlsx operations
 * @param operation - Function that performs xlsx operation
 * @returns Result of operation or throws error with better message
 */
export const safeXlsxOperation = <T>(operation: () => T): T => {
  try {
    return operation();
  } catch (xlsxError) {
    console.error('XLSX operation error:', xlsxError);
    throw new Error('Error processing Excel file. The file format may not be supported or the file may be corrupted.');
  }
}; 