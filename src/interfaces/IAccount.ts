import { StaffProfileData } from "./IStaff"
import { StudentProfileData } from "./IStudent"

export type ActiveCategoriesProp = {
  admin: ActiveAccountProps[];
  staff: ActiveAccountProps[];
  advisor: ActiveAccountProps[];
  manager: ActiveAccountProps[];
  student: ActiveAccountProps[];
};
export interface ActiveAccountProps{
  id: number
  username :string
  password :string
  email :string
  avatarUrl :string
  firstName :string
  lastName :string
  dateOfBirth :Date
  address :string
  phone:string
  roleName : "Admin" | "Academic Staff" |"Advisor"|"Manager"|"Student"
}

export interface AccountProps{
  id: number
  username :string
  password :string
  email :string
  avatarUrl :string
  firstName :string
  lastName :string
  dateOfBirth :Date
  address :string
  phone:string
  roleId :number | 0 | 1 | 2| 3 | 4 
}

export interface LoginProps{
    username: string,
    password: string
}
export interface AccountPropsCreate{
    email: string,
    username: string,
    password: string,
    firstName:string,
    lastName:string,
    dateOfBirth:string|Date,
    roleId:number
    studentProfileData: StudentProfileData | null,
    staffProfileData: StaffProfileData | null
}
export interface GoogleAccountRequestProps {
    email: string
    sub: string,
    roleId:number
    accessToken:string
    avatarUrl: string
    dateOfBirth: string
    firstName:string
    lastName: string
    refreshToken: string
    username: string
  }
