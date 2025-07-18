import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate } from "../../interfaces/IAccount";
import { pagedManagerData, ManagerBase } from "../../interfaces/IManager";

const userURL = baseUrl + "/User/managers";

export const GetActiveManager = async (): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: userURL + `/active`,
  };

  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

export const RegisterManager = async (data: AccountPropsCreate): Promise<any> => {
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


export const FetchManagerList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  filterType?: string,
  filterValue?: string
): Promise<pagedManagerData | null> => {
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

