import { AccountProps } from "./IAccount"

export interface StudentBase extends AccountProps {
  userId: number
  studentCode:string
  enrollDate:Date
  currentGpa:number
}
export interface CreateStudent {
  userId: number
  studentCode:string
  enrollDate:Date
  currentGpa:number
}