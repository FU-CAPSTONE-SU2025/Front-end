import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { CreateSubject, PagedData, Subject, UpdateSubject, SubjectApproval } from "../../interfaces/ISchoolProgram";

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

/**
 * @deprecated Use AddPrerequisiteToSubjectVersion from subjectVersionAPI instead
 * This function will be removed in a future version
 */
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
  
/**
 * @deprecated Use DeletePrerequisiteFromSubjectVersion from subjectVersionAPI instead
 * This function will be removed in a future version
 */
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

/**
 * @deprecated Use GetPrerequisitesBySubjectVersion from subjectVersionAPI instead
 * This function will be removed in a future version
 */
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

export const DisableSubject = async (userId: number): Promise<any | null> => {
  const props = {
    data: null,
    url: subjectURL + `/${userId}/disable`,
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

export const ApproveSubject = async (subjectId: number, data: SubjectApproval): Promise<Subject | null> => {
  const props = {
    data: data,
    url: baseUrl + `/Approval/subject/${subjectId}`,
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