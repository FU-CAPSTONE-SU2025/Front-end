import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps } from "../../interfaces/IAccount";
import { CreateCurriculum, Curriculum, UpdateCurriculum } from "../../interfaces/ISchoolProgram";
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

export const AddSubjectToCurriculum = async (data: CreateCurriculum): Promise<Curriculum | null> => {
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

export const RegisterMultipleCurriculum = async (data: CreateCurriculum[]): Promise<any> => {
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