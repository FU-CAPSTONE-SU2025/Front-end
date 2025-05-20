import axios, { AxiosRequestConfig, Method } from "axios";


interface AxiosProp {
    data?: any; // Optional, since GET/DELETE may not need a body
    url: string;
    headers?: any; // Optional for flexibility
}

interface AxiosResult {
    success: boolean;
    data?: any;
    error?: string;
}

// Generic Axios request handler. THIS IS NEW WOAH
const makeRequest = async (
    method: Method,
    url: string,
    data?: any,
    headers?: any
): Promise<AxiosResult> => {
    try {
        const config: AxiosRequestConfig = {
            method,
            url,
            headers: headers || {}, // Default to empty object if no headers
            data: method === "GET" || method === "PATCH"|| method === "DELETE" ? undefined : data, // Only send data for POST/PUT
            params: method === "GET" || method === "DELETE" ? data : undefined, // Use query params for GET/DELETE
        };

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        } else {
            console.error("Unexpected error:", error);
            return { success: false, error: "An unexpected error occurred" };
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