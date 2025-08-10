import { AccountProps } from "./IAccount"

export interface StudentBase extends AccountProps {
      username: string
      email: string
      firstName: string
      lastName: string
      dateOfBirth: string
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
    doGraduate: boolean;
  enrolledAt: string;
  careerGoal: string;
  programId: number;
  registeredComboCode: string;
  curriculumCode: string;
}
export interface CreateStudentProfileData{
doGraduate: boolean;
enrolledAt: string;
careerGoal: string;
programId: number;
registeredComboCode: string;
curriculumCode: string;
}

export interface StudentDataListResponse {
  id: number;
  enrolledAt: string;
  doGraduate: boolean;
  careerGoal: string;
  numberOfBan: number;
  programId: number | 0;
  registeredComboCode: string | "";
  curriculumCode: string | "";
}

export interface StudentDataUpdateRequest {
  enrolledAt: string;
  doGraduate: boolean;
  careerGoal: string;
  numberOfBan: number;
  programId: number | 0;
  registeredComboCode: string | "";
  curriculumCode: string | "";
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
export interface IStudentBooking {
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

export interface IStudentBookingResponse {
  items: IStudentBooking[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Interface mới cho calendar data (chỉ cần thông tin cơ bản)
export interface IStudentBookingCalendar {
  id: number;
  startDateTime: string;
  endDateTime: string;
  status: number;
  titleStudentIssue: string;
  staffProfileId: number;
  staffFirstName: string;
  staffLastName: string;
}

export interface IStudentBookingCalendarResponse {
  items: IStudentBookingCalendar[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Interface for advisor data
export interface AdvisorData {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    avatarUrl: string | null;
    roleName: string;
    status: number;
    staffDataDetailResponse: {
        id: number;
        campus: string;
        position: string;
        department: string;
        startWorkAt: string;
        endWorkAt: string | null;
    } | null;
}

export interface PagedAdvisorData {
    items: AdvisorData[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

// Interface for leave schedule data
export interface LeaveScheduleData {
    id: number;
    staffProfileId: number;
    startDateTime: string;
    endDateTime: string;
    staffProfile: {
        id: number;
        campus: string;
        department: string;
        position: string;
        startWorkAt: string;
        endWorkAt: string | null;
        userId: number;
        user: any;
        advisorySessions1to1: any[];
        bookingAvailabilities: any[];
        leaveSchedules: any[];
        bookedMeetings: any[];
        createdAt: string;
        updatedAt: string | null;
        deletedAt: string | null;
        isDeleted: boolean;
    };
    createdAt: string;
}

export interface PagedLeaveScheduleData {
    items: LeaveScheduleData[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

// Interface for booking availability data
export interface BookingAvailabilityData {
    id: number;
    startTime: string;
    endTime: string;
    dayInWeek: number;
    staffProfileId: number;
    staffProfile: any;
    createdAt: string;
}

// Interface for ban data
export interface MaxBanData {
    maxNoOfBan: number;
}

export interface CurrentBanData {
    curNoOfBan: number;
}