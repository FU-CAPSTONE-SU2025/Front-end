import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

export const useLoading = create<LoadingState>((set) => ({
  isLoading: false,
  message: 'Loading...',
  showLoading: (message = 'Loading...') => set({ isLoading: true, message }),
  hideLoading: () => set({ isLoading: false }),
  setLoadingMessage: (message: string) => set({ message }),
}));

// Export hideLoading function
export const hideLoading = (): void => {
  const { hideLoading: hide } = useLoading.getState();
  hide();
};

// Utility function for async operations
export const withLoading = async <T,>(
  asyncOperation: () => Promise<T>,
  message?: string
): Promise<T> => {
  const { showLoading, hideLoading } = useLoading.getState();
  
  try {
    showLoading(message);
    const result = await asyncOperation();
    return result;
  } finally {
    hideLoading();
  }
};

// Utility function for timeout loading
export const withTimeout = (message?: string, duration: number = 2000): void => {
  const { showLoading, hideLoading } = useLoading.getState();
  
  showLoading(message);
  setTimeout(() => {
    hideLoading();
  }, duration);
};

// Show loading for navigation
export const showForNavigation = (message: string = 'Navigating...'): void => {
  const { showLoading } = useLoading.getState();
  showLoading(message);
};

// Show loading for authentication
export const showForAuth = (message: string = 'Authenticating...'): void => {
  const { showLoading } = useLoading.getState();
  showLoading(message);
};

// Show loading for data fetching
export const showForData = (message: string = 'Fetching data...'): void => {
  const { showLoading } = useLoading.getState();
  showLoading(message);
};

// Show loading for form submission
export const showForForm = (message: string = 'Submitting...'): void => {
  const { showLoading } = useLoading.getState();
  showLoading(message);
};

// Show loading for file operations
export const showForFile = (message: string = 'Processing file...'): void => {
  const { showLoading } = useLoading.getState();
  showLoading(message);
};

// Show loading for export operations
export const showForExport = (message: string = 'Exporting data...'): void => {
  const { showLoading } = useLoading.getState();
  showLoading(message);
};

// Show loading for import operations
export const showForImport = (message: string = 'Importing data...'): void => {
  const { showLoading } = useLoading.getState();
  showLoading(message);
}; 