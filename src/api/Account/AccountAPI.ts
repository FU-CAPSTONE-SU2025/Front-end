import { axiosCreate, axiosRead } from "../AxiosCRUD";
import { baseUrl, header } from "../template";
import { AccountProps, AccountPropsCreate, LoginProps } from "./IAccount";
const accountUrl = baseUrl+"/account"
const googleLoginURL = import.meta.env.VITE_API_GOOLGE_LOGIN_URL

export const GoogleAccountAuthen = async (data: string) => {
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
export const LoginAccount = async (data: LoginProps):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: accountUrl+`?email=${data.email}&password=${data.password}`,
        headers: header
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }

}
export const LoginAccountWithGoogle = async (email: string):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: accountUrl+`?email=${email}`,
        headers: header
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }

}
export const RegisterAccount = async (data: AccountPropsCreate):Promise<any> => {
    const props = {
        data: data,
        url: accountUrl,
        headers: header
    }
    const result = await axiosCreate(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }

}
export const FetchAccount = async ():Promise<AccountProps[]> => {
    const props = {
        data: null,
        url: accountUrl,
        headers: header
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return []
    }
}
export const FetchAccountById = async ():Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: accountUrl,
        headers: header
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }

}