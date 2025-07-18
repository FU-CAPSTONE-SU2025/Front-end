import { axiosCreate, throwApiError } from "../AxiosCRUD";
import { baseUrl } from "../template";
import { LoginProps } from "../../interfaces/IAccount";
import { TokenProps } from "../../interfaces/IAuthen";
import { getAuthState } from "../../hooks/useAuths";
// const accountUrl = baseUrl+"/account"
const accountUrl = baseUrl+"/Auth"
const googleLoginURL = baseUrl+"/Auth/google"
const cloudflareVerificationURL = import.meta.env.VITE_CLOUDFLARE_VERIFICATION_URL

export const LoginGoogleAccount = async (data: string) => {
    const googleHeader = {
        Authorization: `Bearer ${data}`,
        "Content-Type": "application/json"
    }
    const props = {
        data: null,
        url: googleLoginURL,
        headers: googleHeader
    }
    const result = await axiosCreate(props)
    if (result.success) {
        return result.data
    }
    else {
        return null; // This will never be reached, but TypeScript needs it
    }
} // TODO change to use axiosCreate

export const LoginAccount = async (data: LoginProps) => {
    const props = {
        data: data,
        url: accountUrl+`/login`,
    }
    const result = await axiosCreate(props)
    if (result.success) {
        return result.data
    }
    else {
        //throwApiError(result);
        return null; 
    }
}

export const CloudflareVerification = async (data:any) => {
    const props = {
        data: data,
        url: cloudflareVerificationURL,
    }
    const result = await axiosCreate(props)
    if (result.success) {
        return result.data
    }
    else {
        return null;
    }
}

export const Logout = async () => {
    const props = {
        data: null,
        url: accountUrl+`/logout`,
    }
    const response = await axiosCreate(props)
    if (response.success) {
        return response.data
    }
    else {
        throwApiError(response);
        return null; // This will never be reached, but TypeScript needs it
    }
} // TODO change to use axiosCreate

export const RefreshToken = async () => {
    const props = {
        data: null,
        url: accountUrl+`/refresh-token`,
    }
    const newAccessToken = await axiosCreate(props)
    if (newAccessToken.success) {
        const {setAccessToken,setRefreshToken} = getAuthState()
  
        const tokens:TokenProps = newAccessToken.data

          setAccessToken(tokens.accessToken);
          setRefreshToken(tokens.refreshToken);
        return true
    }
    else {
        //console.log(newAccessToken.error)
        return false
    }
}

//send email
export const SendEmail = async (data:any) => {
      const props = {
        data: data,
        url: accountUrl+`/send-reset-code`,
        headers: null
    }
    const result = await axiosCreate(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null; // This will never be reached, but TypeScript needs it
    }
}

export const ResetPassword = async (data:any) => {
      const props = {
        data: data,
        url: accountUrl+`/forget-password`,
        headers: null
    }
    const result = await axiosCreate(props)
    if (result.success) {
       //console.log("Code?",result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null; // This will never be reached, but TypeScript needs it
    }
}
