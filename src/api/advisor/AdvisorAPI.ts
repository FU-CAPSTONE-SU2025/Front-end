import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
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
import { LeaveSchedule, PagedLeaveScheduleData, CreateLeaveScheduleRequest, UpdateLeaveScheduleRequest } from '../../interfaces/ILeaveSchedule';

const userURL = baseUrl + "/User/advisors";

export const GetActiveAdvisor = async (): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: userURL + `/active`,
  };
  const header = GetHeader();
  console.log("Header: ", header);
  const result = await axiosRead(props);
  if (result.success) {
    console.log(result.data);
    return result.data;
  } else {
    console.log(result.error);
    return null;
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
    console.log(result.error);
    return null;
  }
};

export const FetchAdvisorList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  filterType?: string,
  filterValue?: string
): Promise<pagedAdvisorData | null> => {
  // Build query parameters
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
    console.log(result.error);
    return null;
  }
};

export const FetchAdvisorById = async (userId: number): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: userURL + `/${userId}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};


export const FetchBookingAvailability = async (
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<PagedBookingAvailabilityData | null> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  const props = {
    data: null,
    url: baseUrl + "/BookingAvailability?" + params.toString(),
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

export const CreateBookingAvailability = async (data: CreateBookingAvailabilityRequest): Promise<BookingAvailability | null> => {
  const props = {
    data: data,
    url: baseUrl + "/BookingAvailability",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    // Backend might not return data on success, so we return a success indicator
    return result.data || { id: 0, ...data, staffProfileId: 0 } as BookingAvailability;
  } else {
    console.log(result.error);
    const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to create booking availability';
    throw new Error(errorMessage);
  }
};

export const CreateBulkBookingAvailability = async (data: CreateBulkBookingAvailabilityRequest): Promise<BookingAvailability[] | null> => {
  const props = {
    data: data,
    url: baseUrl + "/BookingAvailability/bulk",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    // Backend might not return data on success, so we return a success indicator
    return result.data || data.map((item, index) => ({ id: index + 1, ...item, staffProfileId: 0 })) as BookingAvailability[];
  } else {
    console.log(result.error);
    const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to create bulk booking availability';
    throw new Error(errorMessage);
  }
};

export const UpdateBookingAvailability = async (id: number, data: UpdateBookingAvailabilityRequest): Promise<BookingAvailability | null> => {
  const props = {
    data: data,
    url: baseUrl + `/BookingAvailability/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    // Backend might not return data on success, so we return a success indicator
    return result.data || { id, ...data, staffProfileId: 0 } as BookingAvailability;
  } else {
    console.log(result.error);
    const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to update booking availability';
    throw new Error(errorMessage);
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
    console.log(result.error);
    const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to delete booking availability';
    throw new Error(errorMessage);
  }
};

export const GetBookingAvailabilityById = async (id: number): Promise<BookingAvailability | null> => {
  const props = {
    data: null,
    url: baseUrl + `/BookingAvailability/simply-single/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
}; 

// Send message to advisor (create new session)
const CHAT_WITH_ADVISOR_URL = `${import.meta.env.VITE_API_AISEA_API_URL}/AdvisorySession1to1/human`;

export const sendMessageToAdvisor = async (message: string): Promise<any> => {
  try {
    // Get headers from GetHeader() and add Content-Type if not present
    const baseHeaders = GetHeader();
    const headers = { ...baseHeaders, 'Content-Type': 'application/json' };
    const response = await fetch(CHAT_WITH_ADVISOR_URL, {
      method: 'POST',
      headers: headers as HeadersInit,
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to send message to advisor');
    }
    return await response.json();
  } catch (error) {
    console.error('sendMessageToAdvisor error:', error);
    throw error;
  }
};

// Send message to existing session
export const sendMessageToSession = async (sessionId: number, message: string): Promise<any> => {
  try {
    const baseHeaders = GetHeader();
    const headers = { ...baseHeaders, 'Content-Type': 'application/json' };
    const response = await fetch(`${import.meta.env.VITE_API_AISEA_API_URL}/AdvisorySession1to1/${sessionId}/send-message`, {
      method: 'POST',
      headers: headers as HeadersInit,
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to send message to session');
    }
    return await response.json();
  } catch (error) {
    console.error('sendMessageToSession error:', error);
    throw error;
  }
}; 

// LeaveSchedule API
const leaveScheduleURL = baseUrl + '/LeaveSche';

export const FetchLeaveScheduleList = async (
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<PagedLeaveScheduleData | null> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  const props = {
    data: null,
    url: leaveScheduleURL + '?' + params.toString(),
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

export const CreateLeaveSchedule = async (data: CreateLeaveScheduleRequest): Promise<LeaveSchedule | null> => {
  const props = {
    data: data,
    url: leaveScheduleURL,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    throw new Error('Failed to create leave schedule');
  }
};

export const UpdateLeaveSchedule = async (id: number, data: UpdateLeaveScheduleRequest): Promise<LeaveSchedule | null> => {
  const props = {
    data: data,
    url: leaveScheduleURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    throw new Error('Failed to update leave schedule');
  }
};

export const DeleteLeaveSchedule = async (id: number): Promise<boolean> => {
  const props = {
    data: null,
    url: leaveScheduleURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return true;
  } else {
    console.log(result.error);
    throw new Error('Failed to delete leave schedule');
  }
};

export const GetLeaveScheduleById = async (id: number): Promise<LeaveSchedule | null> => {
  const props = {
    data: null,
    url: leaveScheduleURL + `/simply-single/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
}; 