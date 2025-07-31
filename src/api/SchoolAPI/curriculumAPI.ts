import { axiosCreate, axiosDelete, axiosRead, axiosUpdate,throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps } from "../../interfaces/IAccount";
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
    console.log(result.error);
    return null;
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
    return null;
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
      return null; // This will never be reached, but TypeScript needs it
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
      return null;
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
    console.log(result.error);
    throwApiError(result);
    return null; // This will never be reached, but TypeScript needs it
  }
};

export const FetchCurriculumList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  filterType?: string,
  filterValue?: string
): Promise<PagedData<Curriculum> | null> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchQuery) {
    params.append("searchQuery", searchQuery);
  }

  if (filterType && filterValue) {
    params.append("filterType", filterType);
    params.append("filterValue", filterValue);
  }

  const props = {
    data: null,
    url: curriculumURL + "?" + params.toString(),
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
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
    console.log(result.error);
    return null;
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
    console.log(result.error);
    return null;
  }
};

export const DisableCurriculum = async (userId: number): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: curriculumURL + `/${userId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
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
    return null; // This will never be reached, but TypeScript needs it
  }
};