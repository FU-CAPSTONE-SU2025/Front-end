import { InputNumberProps } from "antd/lib"
import { StringGradients } from "antd/lib/progress/progress"
import { renderToString } from "react-dom/server"

export interface AccountProps{
  id: number
  username :string
  password_hash :string
  email :string
  avatar :string
  first_name :string
  last_name :string
  date_of_birth :Date
  address :string
  role_id :number
}
export interface DemoAccountProps{
    LoginAtTime: string
    RandKeySession: string
    Role: string
    UserName: string
    exp: number
    iss: "AISEA_Issuer"|string
}
export interface LoginProps{
    userName: string,
    password: string
}
export interface AccountPropsCreate{
    createdAt: Date,
    email: string,
    name: string,
    avatar: string,
    username: string,
    password: string,
    isActive: true,
    role: "user"|string,
}
export interface GoogleAccountRequestProps {
    email: string
    sub: string,
    roleId:string|number
    accessToken:string
    avatarUrl: string
    dateOfBirth: string
    firstName:string
    lastName: string
    refreshToken: string
    username: string
  }
