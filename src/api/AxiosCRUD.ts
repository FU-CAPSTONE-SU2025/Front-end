import axios, { AxiosRequestConfig, Method } from "axios";
import { useMutation } from "@tanstack/react-query";
import { GetHeader } from "./template";
import { RefreshToken } from './Account/AuthAPI';

interface AxiosProp {
    data?: any;
    url: string;
    headers?: any;
}

interface AxiosResult {
    success: boolean;
    data?: any;
    error?: string | ErrorResponse;
}

interface AxiosErrorResponse {
    data: any; // Changed from string to any to handle object responses
    status: number;
    statusText: string;
}

// Custom error response interface matching backend format
export interface ErrorResponse {
    message: string;
    status: number;
}

// Helper function to create ErrorResponse objects
export const createErrorResponse = (message: string, status: number): ErrorResponse => ({
    message,
    status
});

// Helper function to check if an error is an ErrorResponse
export const isErrorResponse = (error: any): error is ErrorResponse => {
    return error && typeof error === 'object' && 'message' in error && 'status' in error;
};

// Helper function to extract error message from either string or ErrorResponse
export const extractErrorMessage = (error: string | ErrorResponse | undefined): string => {
    if (!error) return "Unknown error occurred";
    if (typeof error === 'string') return error;
    if (isErrorResponse(error)) return error.message;
    return "Unknown error occurred";
};

// Helper function to extract detailed error messages from backend response
export const extractBackendErrorMessage = (backendError: any): string => {
    if (!backendError) return "Unknown error occurred";
    
    // Handle validation errors (nested in errors object)
    if (backendError.errors && typeof backendError.errors === 'object') {
        const validationErrors: string[] = [];
        
        // Extract all validation error messages
        for (const field in backendError.errors) {
            const fieldErrors = backendError.errors[field];
            if (Array.isArray(fieldErrors)) {
                validationErrors.push(...fieldErrors);
            } else if (typeof fieldErrors === 'string') {
                validationErrors.push(fieldErrors);
            }
        }
        
        if (validationErrors.length > 0) {
            return validationErrors.join('\n');
        }
    }
    
    // Handle general message
    if (backendError.message && typeof backendError.message === 'string') {
        return backendError.message;
    }
    
    // Handle string errors
    if (typeof backendError === 'string') {
        return backendError;
    }
    
    return "Unknown error occurred";
};

// Helper function to create and throw proper error with ErrorResponse attached
export const throwApiError = (result: AxiosResult): never => {
    if (isErrorResponse(result.error)) {
        // If it's already an ErrorResponse, throw it directly
        throw result.error;
    } else {
        // Create a new Error with the message and attach ErrorResponse if available
        const errorMessage = extractErrorMessage(result.error);
        const error = new Error(errorMessage);
        
        // Attach the full error context for debugging
        if (result.error) {
            (error as any).errorResponse = result.error;
        }
        
        // Add additional context for validation errors
        if (result.error && typeof result.error === 'object' && 'errors' in result.error) {
            (error as any).validationErrors = (result.error as any).errors;
        }
        
        throw error;
    }
};

// Utility function to extract validation errors for UI display
export const extractValidationErrors = (error: any): Record<string, string[]> => {
    if (!error) return {};
    
    // If it's an ErrorResponse with validation errors
    if (isErrorResponse(error) && (error as any).validationErrors) {
        return (error as any).validationErrors;
    }
    
    // If it's a raw error object with validation errors
    if (typeof error === 'object' && error.errors && typeof error.errors === 'object') {
        return error.errors;
    }
    
    return {};
};

// Utility function to get a user-friendly error message
export const getUserFriendlyErrorMessage = (error: any): string => {
    if (!error) return "An unknown error occurred";
    
    // If it's an ErrorResponse
    if (isErrorResponse(error)) {
        return error.message;
    }
    
    // If it's a string
    if (typeof error === 'string') {
        return error;
    }
    
    // If it's an Error object
    if (error instanceof Error) {
        return error.message;
    }
    
    // If it's an object with validation errors
    if (typeof error === 'object' && error.errors) {
        const validationErrors = extractValidationErrors(error);
        const errorMessages: string[] = [];
        
        for (const field in validationErrors) {
            const fieldErrors = validationErrors[field];
            if (Array.isArray(fieldErrors)) {
                errorMessages.push(...fieldErrors);
            }
        }
        
        if (errorMessages.length > 0) {
            return errorMessages.join('\n');
        }
    }
    
    // If it has a message property
    if (typeof error === 'object' && error.message) {
        return error.message;
    }
    
    return "An unknown error occurred";
};

const MAX_REFRESH_RETRIES = 3;

// Generic Axios request handler with retry logic
export const makeRequest = async (
    method: Method,
    url: string,
    data?: any,
    header?: any,
): Promise<AxiosResult> => {
    try {
        const config: AxiosRequestConfig = {
            method,
            url,
            headers: header ?? GetHeader(),
            data: method === "GET" || method === "PATCH" || method === "DELETE" ? undefined : data,
            params: method === "GET" || method === "DELETE" ? data : undefined,
        };
        const response = await axios(config);
        // Fallback for 204 No Content, or 200/201 with empty body
        if (
            response.status === 204 ||
            ((response.status === 200 || response.status === 201) && (typeof response.data === 'undefined' || response.data === null || (typeof response.data === 'object' && Object.keys(response.data).length === 0)))
        ) {
            return { success: true, data: true };
        }
        return { success: true, data: response.data };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error);
            //console.error("Axios error response:", error.response);
            const errorResponse: AxiosErrorResponse | undefined = error.response;
            
            if (errorResponse && errorResponse.status === 401) {
                let retry = 0;
                console.error("Unauthorized access - possibly token expired or invalid");
                if (retry < MAX_REFRESH_RETRIES) {
                    const refreshResult = await RefreshToken();
                    if (refreshResult) {
                        retry += 1;
                        return makeRequest(method, url, data);
                    }
                }
            }
            
            // Try to parse the backend error response
            if (errorResponse) {
                try {
                    // Check if the backend sent a structured error response
                    const backendError = errorResponse.data;
                    
                    // Use the improved error message extraction
                    const errorMessage = extractBackendErrorMessage(backendError);
                    
                    return { 
                        success: false, 
                        error: createErrorResponse(
                            errorMessage, 
                            errorResponse.status
                        ) 
                    };
                } catch (parseError) {
                    console.error("Error parsing backend error response:", parseError);
                    return { 
                        success: false, 
                        error: createErrorResponse(
                            `HTTP ${errorResponse.status} Error`, 
                            errorResponse.status
                        ) 
                    };
                }
            }
            
            // No response from server
            return { 
                success: false, 
                error: createErrorResponse(
                    error.message || "Network error", 
                    0
                ) 
            };
        } else {
            console.error("Unexpected error:", error);
            return { 
                success: false, 
                error: createErrorResponse(
                    "An unexpected error occurred", 
                    0
                ) 
            };
        }
    }
};

// CRUD-specific functions
export const axiosCreate = (props: AxiosProp) =>
    makeRequest("POST", props.url, props.data, props.headers);

export const axiosRead = (props: AxiosProp) =>
    makeRequest("GET", props.url, props.data, props.headers);

export const axiosUpdate = (props: AxiosProp) =>
    makeRequest("PUT", props.url, props.data, props.headers);

export const axiosPatch = (props: AxiosProp) =>
    makeRequest("PATCH", props.url, props.data, props.headers);

export const axiosDelete = (props: AxiosProp) =>
    makeRequest("DELETE", props.url, props.data, props.headers); 
