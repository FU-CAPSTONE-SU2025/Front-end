import { axiosCreate, axiosDelete, axiosRead, axiosUpdate,throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { CreateCurriculum, CreateSubjectToCurriculum, Curriculum, CurriculumApproval, SubjectVersionWithCurriculumInfo } from "../../interfaces/ISchoolProgram";
import { PagedData } from "../../interfaces/ISchoolProgram";

const curriculumURL = baseUrl + "/Curriculum";

export const AddCurriculum = async (data: CreateCurriculum): Promise<Curriculum | null> => {
  const props = {
    data: data,
    url: curriculumURL,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

// Fetch subject versions in curriculum
export const FetchSubjectVersionsToCurriculum = async (id: number): Promise<SubjectVersionWithCurriculumInfo[] | null> => {
  const props = {
    data: null,
    url: curriculumURL+"/"+id+"/subjects",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    throwApiError(result);
  }
};
// Fetch subject versions in curriculum code
export const FetchSubjectVersionsToCurriculumByCode = async (code: string): Promise<SubjectVersionWithCurriculumInfo[] | null> => {
  const props = {
    data: null,
    url: curriculumURL+"/by-code/"+code+"/subjects",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    throwApiError(result);
  }
};

// Add subject version to curriculum
export const AddSubjectVersionToCurriculum = async (id: number, data: CreateSubjectToCurriculum): Promise<CreateSubjectToCurriculum | null> => {
    const props = {
      data: data,
      url: curriculumURL+"/"+id+"/subjects",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      console.log(result.error);
      throwApiError(result);
    }
  };

// Remove subject version from curriculum
export const RemoveSubjectVersionFromCurriculum = async (subjectVersionId: number, curriculumId: number): Promise<any | null> => {
    const props = {
      data: null,
      url: curriculumURL+"/"+curriculumId+"/subjects/"+subjectVersionId,
      headers: GetHeader(),
    };
    const result = await axiosDelete(props);
    if (result.success) {
      return result.data;
    } else {
      console.log(result.error);
      throwApiError(result);
    }
  };

export const RegisterMultipleCurriculum = async (data: CreateCurriculum[]): Promise<any> => {
  const props = {
    data: data,
    url: curriculumURL+"/bulk",
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const FetchCurriculumList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  programId?: number
): Promise<PagedData<Curriculum> | null> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    search: searchQuery || "",
    programId: programId?.toString() || ""
  });

  const props = {
    data: null,
    url: curriculumURL + "?" + params.toString(),
    headers: GetHeader(),
  };
  console.log(props.url)
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const FetchCurriculumById = async (id: number): Promise<Curriculum | null> => {
  const props = {
    data: null,
    url: curriculumURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const UpdateCurriculumById = async (id: number, data: any): Promise<Curriculum | null> => {
  const props = {
    data: data,
    url: curriculumURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};

export const DisableCurriculum = async (curriculumId: number): Promise<any | null> => {
  const props = {
    data: null,
    url: curriculumURL + `/${curriculumId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
}; 

export const ApproveCurriculum = async (curriculumId: number, data: CurriculumApproval): Promise<Curriculum | null> => {
  const props = {
    data: data,
    url: baseUrl + `/Approval/curriculum/${curriculumId}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
  }
};