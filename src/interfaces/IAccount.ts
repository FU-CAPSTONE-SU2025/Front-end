import { StaffDataUpdateRequest, StaffProfileData } from "./IStaff"
import { StudentDataUpdateRequest, StudentProfileData } from "./IStudent"

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
  roleName: string
  staffDataDetailResponse: StaffProfileData | null
  studentDataDetailResponse: StudentProfileData |null
  status: number | boolean
}
export interface UpdateAccountProps{
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  dateOfBirth:  Date,
  avatarUrl: string,
  roleId: number,
  status: number | boolean,
  staffDataUpdateRequest: StaffDataUpdateRequest | null,
  studentDataUpdateRequest: StudentDataUpdateRequest | null
}

export interface JWTAccountProps{
  FirstName: string
  LastName: string
  LoginAtTime: string
  Role: number
  UserId: number
  UserName: string
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
