import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import axios from "axios";
import { AccountProps, AccountPropsCreate, LoginProps } from "../../interfaces/IAccount";
import { pagedStudentData, StudentBase, CreateBookingMeetingRequest, BookingMeetingResponse, AdvisorMeetingItem, AdvisorMeetingPaged, IStudentBookingResponse, IStudentBookingCalendarResponse } from "../../interfaces/IStudent";


const userURL = baseUrl+"/User/student"

export const GetAllStudent = async (pageNumber: number = 1, pageSize: number = 10, searchQuery?: string, filterType?: string, filterValue?: string):Promise<pagedStudentData> => {
    // Build query parameters
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
    });
    
    if (searchQuery) {
        params.append('searchQuery', searchQuery);
    }
    
    if (filterType && filterValue) {
        params.append('filterType', filterType);
        params.append('filterValue', filterValue);
    }
    
    const props = {
        data: null,
        url: userURL+`/paged?` + params.toString(),
    }
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

export const RegisterStudent = async (data: AccountPropsCreate):Promise<any> => {
    const props = {
        data: data,
        url: userURL,
        headers: GetHeader()
    }
    const result = await axiosCreate(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}


export const FetchStudentById = async (userId:number):Promise<AccountProps> => {
    const props = {
        data: null,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}
export const UpdateStudent = async (userId:number,data:any):Promise<AccountProps> => {
    const props = {
        data: data,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}
export const DisableUser = async (userId:number):Promise<AccountProps> => {
    const props = {
        data: null,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosDelete(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
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

export const GetActiveAdvisors = async (pageNumber: number = 1, pageSize: number = 10): Promise<PagedAdvisorData> => {
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
    });
    
    const props = {
        data: null,
        url: baseUrl + `/User/advisors/active/paged?` + params.toString(),
        headers: GetHeader()
    }
    
    const result = await axiosRead(props)
    if (result.success) {
        console.log("Advisors data:", result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
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



export const GetPagedLeaveSchedulesOneStaff = async (staffProfileId: number): Promise<PagedLeaveScheduleData> => {
  const props = {
      data: null,
      url: baseUrl + `/LeaveSche/${staffProfileId}`,
      headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
      console.log("Leave schedules data:", result.data)
      return result.data
  }
  else {
      throwApiError(result);
      return null as never;
  }
}

// Get booking availability for an advisor
export const GetBookingAvailability = async (staffProfileId: number): Promise<BookingAvailabilityData[]> => {
    const props = {
        data: null,
        url: baseUrl + `/BookingAvailability/${staffProfileId}`,
        headers: GetHeader()
    }
    
    const result = await axiosRead(props)
    if (result.success) {
        console.log("Booking availability data:", result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

// API tạo booking meeting
export const CreateBookingMeeting = async (data: CreateBookingMeetingRequest): Promise<BookingMeetingResponse> => {
  const props = {
    data,
    url: baseUrl + '/Meeting',
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// API lấy danh sách meeting của advisor
export const getAdvisorMeetings = async (staffProfileId: number, pageNumber = 1, pageSize = 50): Promise<AdvisorMeetingPaged> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/all-of-one-adv/paged/${staffProfileId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// API lấy lịch sử meeting của sinh viên
export const getStudentMeetings = async (pageNumber = 1, pageSize = 20): Promise<AdvisorMeetingPaged> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/all-stu-self/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// API lấy chi tiết meeting - cho cả Admin
export const getMeetingDetail = async (meetingId: number): Promise<any> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/detail/${meetingId}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const sendMeetingFeedback = async (meetingId: number, feedback: string, suggestionFromAdvisor: string): Promise<any> => {
  const props = {
    data: { feedback, suggestionFromAdvisor },
    url: `${baseUrl}/Meeting/feedBack/${meetingId}`,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// API cancel confirmed meeting by student
export const cancelConfirmedMeeting = async (meetingId: number, note: string): Promise<any> => {
  const props = {
    data: { note },
    url: `${baseUrl}/Meeting/stu-cancel-the-confirmed/${meetingId}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// API cancel pending meeting by student
export const cancelPendingMeeting = async (meetingId: number, note: string): Promise<any> => {
  const props = {
    data: { note },
    url: `${baseUrl}/Meeting/stu-cancel-the-pending/${meetingId}`,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// API mark advisor missed by student
export const markAdvisorMissed = async (meetingId: number, note: string): Promise<any> => {
  const props = {
    data: { note },
    url: `${baseUrl}/Meeting/mark-adv-missed/${meetingId}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get all student self bookings for history calendar
export const getAllStudentSelfBookings = async (pageNumber: number, pageSize: number): Promise<IStudentBookingResponse> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/all-stu-self/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get all student self bookings for history calendar (API riêng cho calendar)
export const getStudentBookingsForCalendar = async (pageNumber: number, pageSize: number): Promise<IStudentBookingCalendarResponse> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/all-stu-self/active/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    const calendarData = {
      ...result.data,
      items: result.data.items.map((item: any) => ({
        id: item.id,
        startDateTime: item.startDateTime,
        endDateTime: item.endDateTime,
        status: item.status,
        titleStudentIssue: item.titleStudentIssue,
        staffProfileId: item.staffProfileId,
        staffFirstName: item.staffFirstName,
        staffLastName: item.staffLastName,
      }))
    };
    return calendarData;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get unassigned sessions for student
export const getUnassignedSessions = async () => {
  const props = {
    data: null,
    url: baseUrl + "/AdvisorySession1to1/unassigned",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};