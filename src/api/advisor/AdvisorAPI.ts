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
    url: baseUrl + `/BookingAvailability/detail/${id}`,
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