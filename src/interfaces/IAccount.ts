import { CreateStaffProfileData, StaffDataUpdateRequest, StaffProfileData } from "./IStaff"
import { CreateStudentProfileData, StudentDataUpdateRequest, StudentProfileData } from "./IStudent"

export type ActiveCategoriesProp = {
  admin: ActiveAccountProps[];
  staff: ActiveAccountProps[];
  advisor: ActiveAccountProps[];
  manager: ActiveAccountProps[];
  student: ActiveAccountProps[];
};

//Acvitve notation
// 0 - ACTIVE,
// 1 - INACTIVE,
// 2 - SUSPENDED,
// 3 - PENDING,
// 4 - DELETED,
// 5 - LOCKED

export interface ActiveAccountProps{
  id: number
  username :string
  password :string
  email :string
  avatarUrl :string
  firstName :string
  lastName :string
  dateOfBirth :Date
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
  dateOfBirth :string
  roleName: string
  staffDataDetailResponse: StaffProfileData | null
  studentDataDetailResponse: StudentProfileData |null
  studentDataListResponse?: {
    id: number;
    enrolledAt: string | Date;
    doGraduate: boolean;
    careerGoal: string;
    numberOfBan: number;
    programId: number | 0;
    registeredComboCode: string | "";
    curriculumCode: string | "";
  } | null
  status: 0 | 1 |2 | 3| 4| 5
}
export interface UpdateAccountProps{
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string | Date,
  avatarUrl: string,
  roleId: number,
  status: 0 | 1 |2 | 3| 4| 5 | number
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
    roleId:number,
    studentProfileData: CreateStudentProfileData | null,
    staffProfileData: CreateStaffProfileData | null,
}

export interface BulkAccountPropsCreate{
  email: string,
  username: string,  
  password: string,
  firstName:string,
  lastName:string,
  dateOfBirth:string|Date,
  studentProfileData: CreateStudentProfileData | null,
  staffProfileData: CreateStaffProfileData | null
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

export interface UpdateAvatarProps{
  url: string
}