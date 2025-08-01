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