import { AccountProps } from "./IAccount"


export interface CreateStaff {
  userId:number
  department:string
  position:string
}
export interface StaffProfileData{
    id:number
    campus: string,
    department: string,
    position:string,
    startWorkAt:Date
    endWorkAt: Date
}

export interface CreateStaffProfileData{
  campus: string,
  department: string,
  position:string,
  startWorkAt:Date
  endWorkAt: Date
}

export interface pagedStaffData {
  items: StaffProfileData[]
  pageNumber: number
  pageSize: number
  totalCount: number
}

export interface StaffDataUpdateRequest {
  campus: string,
  position: string,
  department: string,
  startWorkAt: Date,
  endWorkAt: Date
}