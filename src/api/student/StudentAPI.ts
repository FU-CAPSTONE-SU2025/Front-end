 import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate, LoginProps } from "../../interfaces/IAccount";
import { TokenProps } from "../../interfaces/IAuthen";

const userURL = baseUrl+"/User"

export const GetActiveUser = async ():Promise<TokenProps|null> => {
    const props = {
        data: null,
        url: userURL+`/active`,
    }
    const header = GetHeader()
    console.log("Header: ",header) 
    const result = await axiosRead(props)
    if (result.success) {
        console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }
}

export const RegisterStudent = async (data: AccountPropsCreate):Promise<any> => {
    const props = {
        data: data,
        url: userURL,
        headers: GetHeader()
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
export const RegisterMultipleStudent = async (data: AccountPropsCreate[]):Promise<any> => {
    const props = {
        data: data,
        url: userURL,
        headers: GetHeader()
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

export const FetchStudentList = async ():Promise<AccountProps[]> => {
    const props = {
        data: null,
        url: userURL,
        headers: GetHeader()
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
export const FetchStudentById = async (userId:number):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/`+userId,
        headers: GetHeader()
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
export const UpdateStudent = async (userId:number,data:any):Promise<AccountProps|null> => {
    const props = {
        data: data,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }
}
export const DisableUser = async (userId:number):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosDelete(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }
}