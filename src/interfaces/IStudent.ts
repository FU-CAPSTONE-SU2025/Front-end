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
    id:number
    numberOfBan: number | null
    enrolledAt: Date
    careerGoal: string
}
export interface CreateStudentProfileData{
  numberOfBan: number | null
  enrolledAt: Date
  careerGoal: string
}

export interface StudentDataListResponse {
    id:number
    enrolledAt:Date
    doGraduate: boolean
    careerGoal: string
    numberOfBan:number
}

export interface StudentDataUpdateRequest {
    enrolledAt: string | Date,
    doGraduate: true,
    careerGoal: string
}

export interface CreateBookingMeetingRequest {
  staffProfileId: number;
  startDateTime: string; 
  endDateTime: string;   
  titleStudentIssue: string;
  contentIssue: string;
}

export interface BookingMeetingResponse {
  id: number;
  staffProfileId: number;
  startDateTime: string;
  endDateTime: string;
  titleStudentIssue: string;
  contentIssue: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdvisorMeetingItem {
  id: number;
  startDateTime: string;
  endDateTime: string;
  status: number;
  titleStudentIssue: string;
  createdAt: string;
  staffProfileId: number;
  staffFirstName: string;
  staffLastName: string;
  staffEmail: string;
  studentProfileId: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
}

export interface AdvisorMeetingPaged {
  items: AdvisorMeetingItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}