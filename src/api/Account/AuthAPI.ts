import { axiosCreate, axiosRead } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { LoginProps } from "../../interfaces/IAccount";
import { TokenProps } from "../../interfaces/IAuthen";
import { getAuthState, useAuths } from "../../hooks/useAuths";
// const accountUrl = baseUrl+"/account"
const accountUrl = baseUrl+"/Auth"
const googleLoginURL = baseUrl+"/Auth/google"


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
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }
}
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
        console.log(result.error)
        return null
    }


}
export const Logout = async () => {
    const props = {
        data: null,
        url: accountUrl+`/logout`,
    }
    const response = await axiosRead(props)
    if (response.success) {
        return response.data
    }
    else {
        return null
    }

}

export const RefreshToken = async () => {
    const props = {
        data: null,
        url: accountUrl+`/refresh-token`,
    }
    const newAccessToken = await axiosRead(props)
    if (newAccessToken.success) {
        const {setAccessToken,setRefreshToken} = getAuthState()
        //console.log(newAccessToken.data)
        const tokens:TokenProps = newAccessToken.data
        //console.log("New token: ",newAccessToken.data)
          setAccessToken(tokens.accessToken);
          setRefreshToken(tokens.refreshToken);
        return true
    }
    else {
        console.log(newAccessToken.error)
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
        console.log(result.error)
        return null
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
        console.log("Code?",result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }

}
