 import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import {BulkAccountPropsCreate, AccountProps, AccountPropsCreate, ActiveAccountProps, UpdateAccountProps } from "../../interfaces/IAccount";



const userURL = baseUrl+"/User"

export const GetActiveUser = async ():Promise<ActiveAccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/active`,
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

export const GetCurrentStaffUser = async (userId:number):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/staff/`+userId,
    }
    const header = GetHeader()
    console.log("Header: ",header) 
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
export const UpdateCurrentStaffUser = async (userId:number,data:UpdateAccountProps):Promise<AccountProps|null> => {
    const props = {
        data: data,
        url: userURL+`/staff/`+userId,
    }
    const header = GetHeader()
    console.log("Header: ",header) 
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
export const GetCurrentStudentUser = async (userId:number):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/student/`+userId,
    }
    const header = GetHeader()
    console.log("Header: ",header) 
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
export const UpdateCurrentStudentUser = async (userId:number,data:AccountPropsCreate):Promise<AccountProps|null> => {
    const props = {
        data: data,
        url: userURL+`/student/`+userId,
    }
    const header = GetHeader()
    console.log("Header: ",header) 
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

export const RegisterUser = async (data: AccountPropsCreate):Promise<any> => {
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
export const RegisterMultipleUser = async (data: AccountPropsCreate[]):Promise<any> => {
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

export const FetchUserList = async ():Promise<AccountProps[]> => {
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
export const FetchUserById = async (userId:number):Promise<AccountProps|null> => {
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
export const UpdateUser = async (userId:number,data:any):Promise<AccountProps|null> => {
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

export const BulkRegisterStudent = async (data: BulkAccountPropsCreate[]):Promise<any> => {
    const props = {
        data: data,
        url: userURL+`/student-bulk`,
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


export const BulkRegisterStaff = async (data: BulkAccountPropsCreate[]):Promise<any> => {
    const props = {
        data: data,
        url: userURL+`/academic-staff-bulk`,
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


export const BulkRegisterAdvisor = async (data: BulkAccountPropsCreate[]):Promise<any> => {
    const props = {
        data: data,
        url: userURL+`/advisor-bulk`,
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

export const BulkRegisterManager = async (data: BulkAccountPropsCreate[]):Promise<any> => {
    const props = {
        data: data,
        url: userURL+`/manager-bulk`,
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

export const BulkRegisterAdmin = async (data: BulkAccountPropsCreate[]):Promise<any> => {
    const props = {
        data: data,
        url: userURL+`/admin-bulk`,
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


