import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate } from "../../interfaces/IAccount";
import { pagedAdvisorData, AdvisorBase } from "../../interfaces/IAdvisor";

const userURL = baseUrl + "/User/advisor";

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

export const RegisterMultipleAdvisor = async (data: AccountPropsCreate[]): Promise<any> => {
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

export const UpdateAdvisor = async (userId: number, data: any): Promise<AccountProps | null> => {
  const props = {
    data: data,
    url: userURL + `/${userId}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

export const DisableAdvisor = async (userId: number): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: userURL + `/${userId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
}; 