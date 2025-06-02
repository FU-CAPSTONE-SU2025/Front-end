export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!email.endsWith("@gmail.com")) return "Email must be a Gmail address (e.g., example@gmail.com)";
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) return "Invalid email format";
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  if (!/^\+?\d{7,15}$/.test(phone)) return "Phone number must be 7-15 digits, optionally starting with +";
  return null;
};