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

// Helper function to create and throw proper error with ErrorResponse attached
export const throwApiError = (result: AxiosResult): never => {
    if (isErrorResponse(result.error)) {
        // If it's already an ErrorResponse, throw it directly
        throw result.error;
    } else {
        // Create a new Error with the message and attach ErrorResponse if available
        const errorMessage = extractErrorMessage(result.error);
        const error = new Error(errorMessage);
        if (result.error) {
            (error as any).errorResponse = result.error;
        }
        throw error;
    }
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
        return { success: true, data: response.data };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error);
            console.error("Axios error response:", error.response);
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
                    
                    // If the backend error is already an object with message and status
                    if (typeof backendError === 'object' && backendError.message) {
                        return { 
                            success: false, 
                            error: createErrorResponse(
                                backendError.message, 
                                errorResponse.status
                            ) 
                        };
                    }
                    
                    // If the backend error is a string, wrap it in ErrorResponse
                    if (typeof backendError === 'string') {
                        return { 
                            success: false, 
                            error: createErrorResponse(
                                backendError, 
                                errorResponse.status
                            ) 
                        };
                    }
                    
                    // Fallback: use status text or generic message
                    return { 
                        success: false, 
                        error: createErrorResponse(
                            errorResponse.statusText || `HTTP ${errorResponse.status} Error`, 
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

// React Query mutation hook for any Axios CRUD operation
export const useAxiosMutation = () =>
    useMutation({
        mutationFn: async (params: { method: Method; url: string; data?: any; headers?: any }) => {
            const { method, url, data, headers } = params;
            const result = await makeRequest(method, url, data, headers);
            if (result.success) {
                return result.data;
            } else {
                // Create a proper Error object with the ErrorResponse attached
                const error = new Error(
                    isErrorResponse(result.error) ? result.error.message : (result.error || "Request failed")
                );
                // Attach the full ErrorResponse object to the error
                (error as any).errorResponse = result.error;
                throw error;
            }
        },
        retry: 3, // Retry up to 3 times on error
    });

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