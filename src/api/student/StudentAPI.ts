import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate, LoginProps } from "../../interfaces/IAccount";
import { pagedStudentData, StudentBase } from "../../interfaces/IStudent";

const userURL = baseUrl+"/User/student"

export const GetAllStudent = async (pageNumber: number = 1, pageSize: number = 10, searchQuery?: string, filterType?: string, filterValue?: string):Promise<pagedStudentData|null> => {
    // Build query parameters
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
    });
    
    if (searchQuery) {
        params.append('searchQuery', searchQuery);
    }
    
    if (filterType && filterValue) {
        params.append('filterType', filterType);
        params.append('filterValue', filterValue);
    }
    
    const props = {
        data: null,
        url: userURL+`/paged?` + params.toString(),
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
        return result.error
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