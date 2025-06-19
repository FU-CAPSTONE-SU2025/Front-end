import axios, { AxiosRequestConfig, Method } from "axios";
import { GetHeader } from "./template";
import { RefreshToken } from './Account/AuthAPI';


interface AxiosProp {
    data?: any; // Optional, since GET/DELETE may not need a body
    url: string;
    headers?: any; // Optional headers, can be used to override default headers
}

interface AxiosResult {
    success: boolean;
    data?: any;
    error?: string;
}

const MAX_REFRESH_RETRIES = 3;

// Generic Axios request handler. THIS IS NEW WOAH
const makeRequest = async (
    method: Method,
    url: string,
    data?: any,
    header?: any,
    retryCount = 0
): Promise<AxiosResult> => {
    try {
        const config: AxiosRequestConfig = {
            method,
            url,
            headers: header??GetHeader(), // Default to a predifined header or a custom one
            data: method === "GET" || method === "PATCH"|| method === "DELETE" ? undefined : data, // Only send data for POST/PUT
            params: method === "GET" || method === "DELETE" ? data : undefined, // Use query params for GET/DELETE
        };
        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data || error.message);
            // Handle specific Axios error
            // You can customize this further based on your error handling strategy
            console.error("Axios error code:", error.code)
            if(error.code === "401"){
                console.error("Unauthorized access - possibly token expired or invalid");
                if (retryCount < MAX_REFRESH_RETRIES) {
                    // Try to refresh token
                    const refreshResult = await RefreshToken();
                    if (refreshResult.success) {
                        // Update header with new token
                        const newHeader = {
                            ...header,
                            Authorization: `Bearer ${refreshResult.data.accessToken}`,
                        };
                        // Retry the original request with incremented retryCount
                        return makeRequest(method, url, data, newHeader, retryCount + 1);
                    }
                }
            }
            return { success: false, error: error.response?.data || error.message };
        } else {
            console.error("Unexpected error:", error);
            return { success: false, error: "An unexpected error occurred" };
        }
    }
};

// CRUD-specific functions
export const axiosCreate = (props: AxiosProp) =>
    makeRequest("POST", props.url, props.data,props.headers);

export const axiosRead = (props: AxiosProp) =>
    makeRequest("GET", props.url, props.data,props.headers);

export const axiosUpdate = (props: AxiosProp) =>
    makeRequest("PUT", props.url, props.data,props.headers);

export const axiosPatch = (props: AxiosProp) =>
    makeRequest("PATCH", props.url, props.data,props.headers);

export const axiosDelete = (props: AxiosProp) =>
    makeRequest("DELETE", props.url, props.data,props.headers);