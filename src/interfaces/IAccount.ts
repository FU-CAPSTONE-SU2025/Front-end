

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
