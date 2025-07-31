import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate } from "../../interfaces/IAccount";
import { pagedAdvisorData, AdvisorBase } from "../../interfaces/IAdvisor";
import { 
  BookingAvailability, 
  PagedBookingAvailabilityData, 
  CreateBookingAvailabilityRequest, 
  CreateBulkBookingAvailabilityRequest,
  UpdateBookingAvailabilityRequest
} from "../../interfaces/IBookingAvailability";
import { LeaveSchedule, PagedLeaveScheduleData, CreateLeaveScheduleRequest, UpdateLeaveScheduleRequest, CreateBulkLeaveScheduleRequest } from '../../interfaces/ILeaveSchedule';

const userURL = baseUrl + "/User/advisors";

export const GetActiveAdvisor = async (): Promise<AccountProps> => {
  const props = {
    data: null,
    url: userURL + `/active`,
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

export const RegisterAdvisor = async (data: AccountPropsCreate): Promise<any> => {
  const props = {
    data: data,
    url: userURL,
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

export const FetchAdvisorList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  filterType?: string,
  filterValue?: string
): Promise<pagedAdvisorData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  if (searchQuery) {
    params.append("searchQuery", searchQuery);
  }
  if (filterType && filterValue) {
    params.append("filterType", filterType);
    params.append("filterValue", filterValue);
  }
  const props = {
    data: null,
    url: userURL + "/paged?" + params.toString(),
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

export const FetchAdvisorById = async (userId: number): Promise<AccountProps> => {
  const props = {
    data: null,
    url: userURL + `/${userId}`,
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

export const FetchBookingAvailability = async (
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<BookingAvailability[]> => {
  const props = {
    data: null,
    url: baseUrl + "/BookingAvailability/self",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    // Ensure we always return an array
    return Array.isArray(result.data) ? result.data : [];
  } else {

    throwApiError(result);
    return null as never;
  }
};

export const CreateBookingAvailability = async (data: CreateBookingAvailabilityRequest): Promise<BookingAvailability> => {
  // Debug: Log data before sending to API
  console.log('CreateBookingAvailability - Data to send:', data);
  console.log('CreateBookingAvailability - dayInWeek value:', data.dayInWeek);
  
  const props = {
    data: data,
    url: baseUrl + "/BookingAvailability",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data || { id: 0, ...data, staffProfileId: 0 } as BookingAvailability;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const CreateBulkBookingAvailability = async (data: CreateBulkBookingAvailabilityRequest): Promise<BookingAvailability[]> => {
  // Debug: Log data before sending to API
  console.log('CreateBulkBookingAvailability - Data to send:', data);
  console.log('CreateBulkBookingAvailability - dayInWeek values:', data.map(item => ({
    dayInWeek: item.dayInWeek,
    startTime: item.startTime,
    endTime: item.endTime
  })));
  
  const props = {
    data: data,
    url: baseUrl + "/BookingAvailability/bulk",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data || data.map((item, index) => ({ id: index + 1, ...item, staffProfileId: 0 })) as BookingAvailability[];
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const UpdateBookingAvailability = async (id: number, data: UpdateBookingAvailabilityRequest): Promise<BookingAvailability> => {
  const props = {
    data: data,
    url: baseUrl + `/BookingAvailability/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data || { id, ...data, staffProfileId: 0 } as BookingAvailability;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const DeleteBookingAvailability = async (id: number): Promise<boolean> => {
  const props = {
    data: null,
    url: baseUrl + `/BookingAvailability/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return true;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const GetBookingAvailabilityById = async (id: number): Promise<BookingAvailability> => {
  const props = {
    data: null,
    url: baseUrl + `/BookingAvailability/simply-single/${id}`,
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

export const sendMessageToAdvisor = async ({ message }: { message: string }): Promise<any> => {
  const props = {
    data: { message },
    url: baseUrl + "/AdvisorySession1to1/human",
    headers: GetHeader(),
  };

};




export const FetchLeaveScheduleList = async (
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<PagedLeaveScheduleData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  const props = {
    data: null,
    url:  baseUrl + '/LeaveSche/self?' + params.toString(),
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

export const CreateLeaveSchedule = async (data: CreateLeaveScheduleRequest): Promise<LeaveSchedule> => {
  const props = {
    data: data,
    url: baseUrl + '/LeaveSche',
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

export const CreateBulkLeaveSchedule = async (data: CreateBulkLeaveScheduleRequest): Promise<LeaveSchedule[]> => {
  const props = {
    data: data,
    url: baseUrl + '/LeaveSche/bulk',
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

export const UpdateLeaveSchedule = async (id: number, data: UpdateLeaveScheduleRequest): Promise<LeaveSchedule> => {
  const props = {
    data: data,
    url: baseUrl + '/LeaveSche' + `/${id}`,
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

export const DeleteLeaveSchedule = async (id: number): Promise<boolean> => {
  const props = {
    data: null,
    url: baseUrl + '/LeaveSche' + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return true;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const GetLeaveScheduleById = async (id: number): Promise<LeaveSchedule> => {
  const props = {
    data: null,
    url: baseUrl + '/LeaveSche' + `/simply-single/${id}`,
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

// Lấy danh sách meeting của advisor (self)
export const getAdvisorSelfMeetings = async (pageNumber = 1, pageSize = 50): Promise<any> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  const props = {
    data: null,
    url: baseUrl +'/Meeting/all-adv-self/paged?' + params.toString(),
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

export const confirmMeeting = async (id: number): Promise<any> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/confirm/${id}`,
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

export const cancelPendingMeeting = async (id: number, note?: string): Promise<any> => {
  const props = {
    data: note ? { note } : null,
    url: `${baseUrl}/Meeting/adv-cancel/${id}`,
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

export const completeMeeting = async (id: number, checkInCode: string): Promise<any> => {
  const props = {
    data: { checkInCode },
    url: `${baseUrl}/Meeting/complete/${id}`,
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


