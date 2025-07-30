/**
 * Day of Week Options for the entire system
 * 
 * Format: dayInWeek value mapping
 * - 1 = Sunday
 * - 2 = Monday  
 * - 3 = Tuesday
 * - 4 = Wednesday
 * - 5 = Thursday
 * - 6 = Friday
 * - 7 = Saturday
 * 
 * This format is used consistently across:
 * - Frontend forms (Select components)
 * - API requests/responses
 * - Database storage
 * - Calendar displays
 */
export const dayOptions = [
    { value: 1, label: 'Sunday' },
    { value: 2, label: 'Monday' },
    { value: 3, label: 'Tuesday' },
    { value: 4, label: 'Wednesday' },
    { value: 5, label: 'Thursday' },
    { value: 6, label: 'Friday' },
    { value: 7, label: 'Saturday' },
  ];

export default dayOptions;