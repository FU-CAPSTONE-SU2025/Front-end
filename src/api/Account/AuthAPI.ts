import { axiosCreate, axiosRead } from "../AxiosCRUD";
import { baseUrl, header } from "../template";
import { AccountProps, AccountPropsCreate, GoogleAccountRequestProps, LoginProps } from "../../interfaces/IAccount";
import { TokenProps } from "../../interfaces/IAuthen";
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
        //console.log(result)
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
        headers: header
    }
    const result = await axiosCreate(props)
    if (result.success) {
        console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }

}

