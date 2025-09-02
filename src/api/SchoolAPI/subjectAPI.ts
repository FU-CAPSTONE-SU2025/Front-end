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
  console.log("AddSubject", props)
  const result = await axiosCreate(props);
  console.log("AddSubject Result", result)
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};


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
  }
};

export const FetchSubjectList = async (
  pageNumber?: number,
  pageSize?: number,
  search?: string,
  comboName?: string,
  curriculumCode?: string
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
  if (comboName) {
    params.append("comboName", comboName);
  }
  if (curriculumCode) {
    params.append("curriculumCode", curriculumCode);
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
  }
};

export const UpdateSubjectById = async (subjectId: number, data: UpdateSubject): Promise<Subject | null> => {
  const props = {
    data: data,
    url: subjectURL + `/${subjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const DisableSubject = async (subjectId: number): Promise<any | null> => {
  const props = {
    data: null,
    url: subjectURL + `/${subjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
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
  }
};

export const FetchSubjectTips = async (sylaid: number): Promise<any> => {
  const props = {
    data: null,
    url: subjectURL + `/gen-tip/${sylaid}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};