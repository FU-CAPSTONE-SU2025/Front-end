import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

import { ISubjectMarkReport,ICreateSubjectMarkReport, IUpdateSubjectMarkReport } from '../../interfaces/ISubjectMarkReport';
const subjectMarkURL = baseUrl + "/SubjectMarkRp";

// reusing the same API endpoint for both the solo adding or bulk adding
export const AddSubjectMarkReport = async (joinedSubjectId: number,data: ICreateSubjectMarkReport[]): Promise<any> => {
  const props = {
    data: data,
    url: subjectMarkURL+`/${joinedSubjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

  // for Staff, manager, admin
export const FetchSubjectMarkReport = async (joinedSubjectId: number): Promise<ISubjectMarkReport[]> => {

  const props = {
    data: null,
    url: subjectMarkURL+`/${joinedSubjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};
  // for STUDENT only
  export const FetchSelfSubjectMarkReport = async (): Promise<ISubjectMarkReport[]> => {
    const props = {
      data: null,
      url: subjectMarkURL+`/personal-academic-transcript`,
      headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };

export const UpdateSubjectMarkReport = async (id: number,data:IUpdateSubjectMarkReport): Promise<any> => {
    const props = {
      data: data,
      url: subjectMarkURL+`/${id}`,
      headers: GetHeader(),
    };
    const result = await axiosUpdate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };

export const DeleteSubjectMarkReport = async (id: number): Promise<any> => {
  const props = {
    data: null,
    url: subjectMarkURL+`/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

