 import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import {BulkAccountPropsCreate, AccountProps, AccountPropsCreate, ActiveAccountProps, UpdateAccountProps, UpdateAvatarProps } from "../../interfaces/IAccount";
import { PagedData } from "../../interfaces/ISchoolProgram";
import { StudentBase } from "../../interfaces/IStudent";



const userURL = baseUrl+"/User"

export const GetActiveUser = async ():Promise<ActiveAccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/active`,
    }
    const result = await axiosRead(props)
    if (result.success) {
    
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
    }
}
// This is for Staff and Manager
export const GetPagedActiveStudent = async (
  pageNumber: number,
  pageSize: number,
  searchQuery?: string,
  programId?: number
): Promise<PagedData<StudentBase>> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    search: searchQuery || "",
    programId: programId?.toString() || ""
  });
  const props = {
    data: null,
    url: userURL + `/students/active/paged?${params.toString()}`,
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    throwApiError(result);
  }
};

export const GetCurrentStaffUser = async (userId:number):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/staff/`+userId,
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
    }
}
export const UpdateCurrentStaffUser = async (userId:number,data:UpdateAccountProps):Promise<AccountProps|null|true> => {
    const props = {
        data: data,
        url: userURL+`/staff/`+userId,
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        // If backend returns 204 No Content, result.data will be undefined
        if (typeof result.data === 'undefined') return true;
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
    }
}
export const GetCurrentStudentUser = async (userId:number):Promise<AccountProps|null> => {
    const props = {
        data: null,
        url: userURL+`/student/`+userId,
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
    }
}
export const UpdateCurrentStudentUser = async (userId:number,data:AccountPropsCreate):Promise<AccountProps|null|true> => {
    const props = {
        data: data,
        url: userURL+`/student/`+userId,
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        if (typeof result.data === 'undefined') return true;
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
    }
}
export const UpdateUser = async (userId:number,data:UpdateAccountProps):Promise<AccountProps|null|true> => {
    const props = {
        data: data,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        if (typeof result.data === 'undefined') return true;
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
    }
}

export const UpdateUserAvatar = async (userId:number,data:UpdateAvatarProps):Promise<AccountProps|null|true> => {
    const props = {
        data: data,
        url: userURL+`/staff-update-avatar/`+userId,
        headers: GetHeader()
    }
    
    const result = await axiosUpdate(props)
    if (result.success) {
        if (typeof result.data === 'undefined') return true;
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
    }
}

export const SelfAvatarUpdate = async (data:UpdateAvatarProps):Promise<any|null|true> => {
    const props = {
        data: data,
        url: userURL+`update-avatar/`,
        headers: GetHeader()
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        if (typeof result.data === 'undefined') return true;
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
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
        throwApiError(result);
    }
}

export const ResetBanNumberForStudent = async (studentProfileId:number):Promise<any> => {
    const props = {
        data: null,
        url: userURL+`/reset-noOfBan/`+studentProfileId,
        headers: GetHeader()
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        throwApiError(result);
    }
}