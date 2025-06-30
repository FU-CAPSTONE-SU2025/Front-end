import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate, LoginProps } from "../../interfaces/IAccount";
import { TokenProps } from "../../interfaces/IAuthen";
import { pagedStaffData, StaffProfileData } from "../../interfaces/IStaff";

const userURL = baseUrl+"/User/staff"

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

export const RegisterStaff = async (data: AccountPropsCreate):Promise<any> => {
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
export const RegisterMultipleStaff = async (data: AccountPropsCreate[]):Promise<any> => {
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

export const FetchStaffList = async (pageNumber: number = 1, pageSize: number = 10, searchQuery?: string, filterType?: string, filterValue?: string):Promise<pagedStaffData|null> => {
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
        url: userURL+"/paged?" + params.toString(),
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
export const FetchStaffyId = async (userId:number):Promise<AccountProps|null> => {
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
export const UpdateStaff = async (userId:number,data:any):Promise<AccountProps|null> => {
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