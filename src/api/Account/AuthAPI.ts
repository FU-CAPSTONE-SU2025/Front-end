import { axiosCreate, axiosRead } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { LoginProps } from "../../interfaces/IAccount";
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
        headers: GetHeader()
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
        headers: GetHeader()
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
        url: accountUrl+`/login`,
        headers: GetHeader()
    }
    const newAccessToken = await axiosRead(props)
    if (newAccessToken.success) {
        console.log(newAccessToken.data)
        return newAccessToken.data
    }
    else {
        console.log(newAccessToken.error)
        return null
    }

}

