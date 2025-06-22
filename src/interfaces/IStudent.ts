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
    pageNumber: 1
    pageSize: 10
    totalCount: 6
}

export interface CreateStudent {
  userId: number
  studentCode:string
  enrollDate:Date
  currentGpa:number
}
export interface StudentProfileData{
    enrolledAt: Date
    careerGoal: string
}

export interface StudentDataListResponse {
    enrolledAt:Date
    doGraduate: boolean
    careerGoal: string
}
