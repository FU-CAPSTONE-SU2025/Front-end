import { AccountProps } from "./IAccount"

export interface StaffBase extends AccountProps {
  userId: number 
  department:string
  position:string
}
export interface CreateStaff {
  userId:number
  department:string
  position:string
}