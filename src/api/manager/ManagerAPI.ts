import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate } from "../../interfaces/IAccount";
import { pagedManagerData } from "../../interfaces/IManager";

const userURL = baseUrl+"/User/managers"

export const RegisterManager = async (data: AccountPropsCreate):Promise<any> => {
    const props = {
        data: data,
        url: userURL,
        headers: GetHeader()
    }
    const result = await axiosCreate(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

export const FetchManagerList = async (pageNumber: number = 1, pageSize: number = 10, searchQuery?: string, filterType?: string, filterValue?: string):Promise<pagedManagerData> => {
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
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

export const FetchManagerById = async (userId:number):Promise<AccountProps> => {
    const props = {
        data: null,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

