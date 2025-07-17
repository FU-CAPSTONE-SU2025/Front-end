export interface LeaveSchedule {
  id: number;
  staffProfileId: number;
  startDateTime: string;
  endDateTime: string;
  note?: string;
  createdAt?: string;
}

export interface PagedLeaveScheduleData {
  items: LeaveSchedule[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateLeaveScheduleRequest {
  startDateTime: string;
  endDateTime: string;
  note?: string;
}

export interface UpdateLeaveScheduleRequest {
  startDateTime: string;
  endDateTime: string;
  note?: string;
} 