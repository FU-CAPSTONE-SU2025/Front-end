// firebaseConfig.js (or wherever you manage your Firebase initialization)
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
// You can find this in your Firebase project settings -> Project settings -> General
// under "Your apps" (look for Web app with a </>)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

// Avatar upload service with role-based storage
export const uploadAvatar = async (file: File, userId: number, role: string): Promise<string> => {
  try {
    // Create a unique filename for the avatar
    const fileExtension = file.name.split('.').pop();
    const fileName = `ai-sea/${role}/${userId}_${Date.now()}.${fileExtension}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fileName);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('Failed to upload avatar');
  }
};

// Delete avatar service with role-based storage
export const deleteAvatar = async (avatarUrl: string, role: string): Promise<void> => {
  try {
    //console.log('Attempting to delete avatar with URL:', avatarUrl);
    
    let filePath: string;
    
    // Check if it's a Firebase Storage URL
    if (avatarUrl.includes('firebasestorage.googleapis.com')) {
      // Firebase Storage URLs have this format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media&token=...
      const url = new URL(avatarUrl);
      
      // Get the 'o' parameter which contains the encoded file path
      const encodedPath = url.searchParams.get('o');
      if (!encodedPath) {
        // If 'o' parameter is not found, try to extract from the path
        const pathParts = url.pathname.split('/');
        const oIndex = pathParts.indexOf('o');
        if (oIndex !== -1 && oIndex + 1 < pathParts.length) {
          // The path after 'o' is the encoded file path
          const pathAfterO = pathParts.slice(oIndex + 1).join('/');
          filePath = decodeURIComponent(pathAfterO);
        } else {
          throw new Error('Invalid Firebase Storage URL - cannot extract file path');
        }
      } else {
        // Decode the URL-encoded path
        filePath = decodeURIComponent(encodedPath);
      }
    } else {
      // Fallback: try to extract path from a different URL format
      // This handles cases where the URL might be in a different format
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      
      // If the filename already contains the full path, use it directly
      if (fileName.includes('ai-sea/')) {
        filePath = fileName;
      } else {
        // Otherwise, construct the path using the role
        filePath = `ai-sea/${role}/${fileName}`;
      }
    }
    

    
    // Create a reference to the file
    const storageRef = ref(storage, filePath);
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting avatar:', error);
    console.error('Avatar URL was:', avatarUrl);
    throw new Error(`Failed to delete avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true };
};

// Now, 'storage' is your entry point to interact with Firebase Storage!
export { storage };
