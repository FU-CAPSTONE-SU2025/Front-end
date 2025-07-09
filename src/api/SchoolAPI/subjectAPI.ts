import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps } from "../../interfaces/IAccount";
import { CreateSubject, PagedData, Subject, UpdateSubject } from "../../interfaces/ISchoolProgram";

const subjectURL = baseUrl + "/Subject";

export const AddSubject = async (data: CreateSubject): Promise<Subject | null> => {
  const props = {
    data: data,
    url: subjectURL,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
};

export const AddPrerequisitesSubject = async (id:number,prerequisitesId:number): Promise<Subject | null> => {
    const props = {
      data: null,
      url: subjectURL + `/${id}/prerequisites/${prerequisitesId}`,
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null; // This will never be reached, but TypeScript needs it
    }
  };
  
export const DeletePrerequisitesSubject = async (id:number,prerequisitesId:number): Promise<Subject | null> => {
  const props = {
    data: null,
    url: subjectURL + `/${id}/prerequisites/${prerequisitesId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
};

export const GetPrerequisitesSubject = async (id:number): Promise<Subject[] | null> => {
  const props = {
    data: null,
    url: subjectURL + `/${id}/prerequisites`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
}

export const RegisterMultipleSubject = async (data: CreateSubject[]): Promise<any> => {
  const props = {
    data: data,
    url: subjectURL+"/bulk",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
};

export const FetchSubjectList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  search?: string,
  filterType?: string,
  filterValue?: string
): Promise<PagedData<Subject> | null> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  if (filterType && filterValue) {
    params.append("filterType", filterType);
    params.append("filterValue", filterValue);
  }

  const props = {
    data: null,
    url: subjectURL + "?" + params.toString(),
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
};

export const FetchSubjectById = async (id: number): Promise<Subject | null> => {
  const props = {
    data: null,
    url: subjectURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
};

export const UpdateSubjectById = async (id: number, data: UpdateSubject): Promise<Subject | null> => {
  const props = {
    data: data,
    url: subjectURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
};

export const DisableSubject = async (userId: number): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: subjectURL + `/${userId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
}; 