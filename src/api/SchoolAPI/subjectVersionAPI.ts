import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { CreateSubjectVersion, PagedData, SubjectVersion, UpdateSubjectVersion, SubjectPrerequisite } from "../../interfaces/ISchoolProgram";

const subjectVersionURL = baseUrl + "/SubjectVersion";
const prerequisiteURL = baseUrl + "/subject-version/prerequisites";

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
  }
};

// New Prerequisite API functions for Subject Version
export const AddPrerequisiteToSubjectVersion = async (subjectVersionId: number, prerequisiteSubjectVersionId: number): Promise<any | null> => {
  const props = {
    data: { prerequisiteSubjectVersionId:prerequisiteSubjectVersionId },
    url: prerequisiteURL + `/${subjectVersionId}`,
    headers: GetHeader(),
  };
  console.log("GetPrerequisitesBySubjectVersion",props)
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const GetPrerequisitesBySubjectVersion = async (subjectVersionId: number): Promise<SubjectPrerequisite[] | null> => {
  const props = {
    data: null,
    url: prerequisiteURL + `/${subjectVersionId}`,
    headers: GetHeader(),
  };

  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const GetDependentsBySubjectVersion = async (subjectVersionId: number): Promise<SubjectVersion[] | null> => {
  const props = {
    data: null,
    url: prerequisiteURL + `/${subjectVersionId}/dependents`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const DeletePrerequisiteFromSubjectVersion = async (subjectVersionId: number, prerequisiteSubjectVersionId: number): Promise<any | null> => {
  const props = {
    data: null,
    url: prerequisiteURL + `/${subjectVersionId}/${prerequisiteSubjectVersionId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const GetPrerequisitesBySubject = async (subjectId: number): Promise<any | null> => {
  const props = {
    data: null,
    url: prerequisiteURL + `/by-subject/${subjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const CopyPrerequisitesBetweenVersions = async (sourceVersionId: number, targetVersionId: number): Promise<any | null> => {
  const props = {
    data: { sourceVersionId, targetVersionId },
    url: prerequisiteURL + `/copy`,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const FetchPagedSubjectVersionList = async (
  pageNumber?: number,
  pageSize?: number,
  search?: string,
  subjectId?: number
): Promise<PagedData<SubjectVersion> | null> => {
  let params = new URLSearchParams();
  // Build query parameters
  if(pageNumber && pageSize){
   params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    search: search || "",
    subjectId: subjectId ? subjectId.toString() : ""
  });
  const props = {
    data: null,
    url: subjectVersionURL + "?" + params.toString(),
    headers: GetHeader(),
  };
  //console.log("FetchPagedSubjectVersionList",props)
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
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
  }
}; 

export const SetDefaultSubjectVersion = async (id: number): Promise<any | null> => {
  const props = {
    data: null,
    url: subjectVersionURL + `/${id}/set-default`,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
}; 