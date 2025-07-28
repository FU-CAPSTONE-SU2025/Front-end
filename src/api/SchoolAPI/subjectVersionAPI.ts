import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { CreateSubjectVersion, PagedData, SubjectVersion, UpdateSubjectVersion } from "../../interfaces/ISchoolProgram";

const subjectVersionURL = baseUrl + "/SubjectVersion";

export const AddSubjectVersion = async (data: CreateSubjectVersion): Promise<SubjectVersion | null> => {
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
  
export const DeleteSubjectVersion = async (id:number): Promise<any | null> => {
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



export const FetchPagedSubjectVersionList = async (
  pageNumber?: number,
  pageSize?: number,
  search?: string,
  filterType?: string,
  filterValue?: string
): Promise<PagedData<SubjectVersion> | null> => {
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

export const FetchSubjectVersionById = async (id: number): Promise<SubjectVersion | null> => {
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

export const FetchSubjectVersionBySubjectId = async (id: number): Promise<SubjectVersion[] | null> => {
  const props = {
    data: null,
    url: subjectVersionURL + `/subject/${id}`,
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

export const FetchDefaultSubjectVersionBySubject = async (id: number): Promise<SubjectVersion | null> => {
  const props = {
    data: null,
    url: subjectVersionURL + `/subject/${id}/default`,
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

export const UpdateSubjectVersionById = async (id: number, data: UpdateSubjectVersion): Promise<any | null> => {
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


export const ActiveSubjectVersion = async (id: number): Promise<any | null> => {
    const props = {
      data: null,
      url: subjectVersionURL + `/${id}/toggle-active`,
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