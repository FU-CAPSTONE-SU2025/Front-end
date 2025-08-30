import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

import { BulkCreateJoinedSubjectMultipleStudents, BulkCreateJoinedSubjects, CreateJoinedSubject, PagedSemester, JoinedSubject, PagedJoinedSubject, PagedSemesterBlock } from '../../interfaces/ISchoolProgram';

const joinedSubjectURL = baseUrl + "/JoinedSubject";
const semesterURL = baseUrl + "/SemesterRefer";
// Add a student to a subject course 
export const RegisterStudentToSubject = async (data: CreateJoinedSubject): Promise<any | null> => {
  const props = {
    data: data,
    url: joinedSubjectURL+"/import",
    headers: GetHeader(),
  };
  console.log("RegisterStudentToSubject",props)
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const RegisterOneStudentsToMultipleSubjects = async (data: BulkCreateJoinedSubjects): Promise<any> => {
  const props = {
    data: data,
    url: joinedSubjectURL+"/import-multiple",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};
export const RegisterMultipleStudentsToMultipleSubjects = async (data: BulkCreateJoinedSubjectMultipleStudents): Promise<any> => {
    const props = {
      data: data,
      url: joinedSubjectURL+"/import-multiple-students",
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
export const FetchJoinedSubjectList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  studentProfileId: number
): Promise<PagedJoinedSubject | null> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  const props = {
    data: null,
    url: joinedSubjectURL+`/${studentProfileId}/all` + "?" + params.toString(),
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const FetchJoinedSubjectListById = async (joinedSubjectId: number): Promise<JoinedSubject> => {
  const props = {
    data: null,
    url: joinedSubjectURL + `/${joinedSubjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
}
export const DeleteJoinedSubject = async (joinedSubjectId: number): Promise<any> => {
  const props = {
    data: null,
    url: joinedSubjectURL + `/${joinedSubjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};


// Semester Data Fetching
export const FetchPagedSemesterList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
): Promise<PagedSemester | null> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  const props = {
    data: null,
    url: semesterURL + "?" + params.toString(),
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const FetchPagedSemesterBlockType = async (
  pageNumber: number = 1,
  pageSize: number = 10,
): Promise<PagedSemesterBlock> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  const props = {
    data: null,
    url: semesterURL+"/block-types" + "?" + params.toString(),
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    console.log("FetchPagedSemesterBlockType",result.data)
    return result.data;
  } else {
    throwApiError(result);
  }
};



