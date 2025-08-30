import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

import { ISubjectMarkReport,ICreateSubjectMarkReport, IUpdateSubjectMarkReport, IViewSubjectAssessment } from '../../interfaces/ISubjectMarkReport';
const subjectMarkURL = baseUrl + "/SubjecMarkRp"; // Typeto in the backend

export const FetchViewSubjectMarkReportTemplate = async (subjectCode: string,subjectVersionCode:string): Promise<IViewSubjectAssessment[]> => {
  const props = {
    data: null,
    url: subjectMarkURL+`/view-template-import?subjectCode=${subjectCode}&subjectVersionCode=${subjectVersionCode}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

// reusing the same API endpoint for both the solo adding or bulk adding
export const AddSubjectMarkReport = async (joinedSubjectId: number,data: ICreateSubjectMarkReport[]): Promise<any> => {
  const props = {
    data: data,
    url: subjectMarkURL+`/${joinedSubjectId}`,
    headers: GetHeader(),
  };
   console.log("AddSubjectMarkReport",props)
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

