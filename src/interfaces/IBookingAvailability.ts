export interface BookingAvailability {
  id: number;
  startTime: string;
  endTime: string;
  dayInWeek: number;
  staffProfileId: number;
}

export interface PagedBookingAvailabilityData {
  items: BookingAvailability[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateBookingAvailabilityRequest {
  startTime: string;
  endTime: string;
  dayInWeek: number;
}

export type CreateBulkBookingAvailabilityRequest = {
  startTime: string;
  endTime: string;
  dayInWeek: number;
}[]

export interface UpdateBookingAvailabilityRequest {
  startTime: string;
  endTime: string;
  dayInWeek: number;
} 

export interface AdminViewBooking {
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
}