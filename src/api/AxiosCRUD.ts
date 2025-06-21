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
    error?: string;
}
interface AxiosErrorResponse {
data: string
status: number
statusText: string
}

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
            const errorResponse:AxiosErrorResponse|undefined = error.response
            if (errorResponse && errorResponse.status === 401) {
                let retry = 0;
                console.error("Unauthorized access - possibly token expired or invalid");
                if (retry < MAX_REFRESH_RETRIES) {
                    const refreshResult = await RefreshToken();
                    console.log("Attempting to refresh token: ",refreshResult)
                    if (refreshResult) {
                        retry +=1
                        return makeRequest(method, url, data);
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

// React Query mutation hook for any Axios CRUD operation
export const useAxiosMutation = () =>
    useMutation({
        mutationFn: async (params: { method: Method; url: string; data?: any; headers?: any }) => {
            const { method, url, data, headers } = params;
            const result = await makeRequest(method, url, data, headers);
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || "Request failed");
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