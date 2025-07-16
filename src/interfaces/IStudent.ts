import { AccountProps } from "./IAccount"

export interface StudentBase extends AccountProps {
      username: string
      email: string
      firstName: string
      lastName: string
      dateOfBirth: Date
      avatarUrl: string,
      roleName: string
      status: number,
      studentDataListResponse: StudentDataListResponse
}

export interface pagedStudentData {
    items: StudentBase[]
    pageNumber: number
    pageSize: number
    totalCount: number
}

export interface CreateStudent {
  userId: number
  studentCode:string
  enrollDate:Date
  currentGpa:number
}
export interface StudentProfileData{
    numberOfBan: number | null
    enrolledAt: Date
    careerGoal: string
}

export interface StudentDataListResponse {
    enrolledAt:Date
    doGraduate: boolean
    careerGoal: string
}

export interface StudentDataUpdateRequest {
    enrolledAt: "2025-07-11T14:56:47.207Z" | Date,
    doGraduate: true,
    careerGoal: string
}