import { AccountProps } from "./IAccount"


export interface CreateStaff {
  userId:number
  department:string
  position:string
}
export interface StaffProfileData extends AccountProps{
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