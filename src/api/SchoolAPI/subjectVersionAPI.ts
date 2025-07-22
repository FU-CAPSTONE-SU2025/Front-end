import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps } from "../../interfaces/IAccount";
import { CreateSubject, PagedData, Subject, UpdateSubject } from "../../interfaces/ISchoolProgram";

const subjectVersionURL = baseUrl + "/SubjectVersion";

export const AddSubject = async (data: CreateSubject): Promise<Subject | null> => {
  const props = {
    data: data,
    url: subjectVersionURL,
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
      url: subjectVersionURL + `/${id}/prerequisites/${prerequisitesId}`,
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
    url: subjectVersionURL + `/${id}/prerequisites/${prerequisitesId}`,
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
    url: subjectVersionURL + `/${id}/prerequisites`,
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
    url: subjectVersionURL+"/bulk",
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
  pageNumber?: number,
  pageSize?: number,
  search?: string,
  filterType?: string,
  filterValue?: string
): Promise<PagedData<Subject> | null> => {
  let params = new URLSearchParams();
  // Build query parameters
  if(pageNumber && pageSize){
   params = new URLSearchParams({
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
  }
  const props = {
    data: null,
    url: subjectVersionURL + "?" + params.toString(),
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
    url: subjectVersionURL + `/${id}`,
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
    url: subjectVersionURL + `/${id}`,
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

export const DisableSubject = async (id: number): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: subjectVersionURL + `/${id}`,
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

export const ACtiveSubject = async (id: number): Promise<AccountProps | null> => {
    const props = {
      data: null,
      url: subjectVersionURL + `/${id}`,
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