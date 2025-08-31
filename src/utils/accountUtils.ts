/**
 * Utility functions for account management
 */

/**
 * Generates a username from an email address
 * Extracts the part before @ and converts to lowercase
 * @param email - The email address
 * @returns The generated username
 */
export const generateUsernameFromEmail = (email: string): string => {
  if (!email || !email.includes('@')) {
    return '';
  }
  
  // Extract part before @ and convert to lowercase
  const username = email.split('@')[0].toLowerCase();
  return username;
};

/**
 * Generates a random password with specified requirements
 * @param length - Password length (default: 20)
 * @returns Generated password string
 */
export const generateRandomPassword = (length: number = 20): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  let password = '';
  
  // Ensure at least 1 uppercase letter
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  
  // Ensure at least 1 number
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Ensure at least 1 special character
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length with random characters (mostly lowercase)
  const remainingLength = length - 3;
  const allChars = lowercase + uppercase + numbers + special;
  
  for (let i = 0; i < remainingLength; i++) {
    // Bias towards lowercase letters (70% chance)
    const charSet = Math.random() < 0.7 ? lowercase : allChars;
    password += charSet[Math.floor(Math.random() * charSet.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generates a unique username by adding a random number suffix if needed
 * @param baseUsername - The base username from email
 * @param existingUsernames - Array of existing usernames to check against
 * @returns A unique username
 */
export const generateUniqueUsername = (
  baseUsername: string, 
  existingUsernames: string[] = []
): string => {
  if (!existingUsernames.includes(baseUsername)) {
    return baseUsername;
  }
  
  // Generate random 6-digit number suffix
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const uniqueUsername = `${baseUsername}${randomSuffix}`;
  
  // Recursively check if this is also unique (very unlikely but safe)
  if (existingUsernames.includes(uniqueUsername)) {
    return generateUniqueUsername(baseUsername, existingUsernames);
  }
  
  return uniqueUsername;
};

/**
 * Validates if an email follows the expected student email template
 * @param email - The email to validate
 * @returns True if email follows template, false otherwise
 */
export const isValidStudentEmail = (email: string): boolean => {
  if (!email || !email.includes('@')) {
    return false;
  }
  
  // Check if email ends with numbers (student ID pattern)
  const beforeAt = email.split('@')[0];
  const hasNumbers = /\d/.test(beforeAt);
  
  return hasNumbers;
};
