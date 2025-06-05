export interface AccountProps{
    email: string,
    createdAt: Date,
    name: string,
    avatar: string,
    username: string,
    password: string,
    isActive: boolean,
    role: string,
    id: string
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
    email_verified: boolean
    family_name: string
    given_name: string
    picture: string
    sub: string,
    roleId:string
  }
