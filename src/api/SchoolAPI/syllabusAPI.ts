import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps } from "../../interfaces/IAccount";
import { CreateCurriculum, CreateSubjectToCurriculum, Curriculum, Subject, SyllabusOutcome, UpdateCurriculum } from "../../interfaces/ISchoolProgram";
import { PagedData } from "../../interfaces/ISchoolProgram";
import { SyllabusLearningMaterial, SyllabusLearningOutcome } from "../../interfaces/ISyllabus";

const syllabusURL = baseUrl + "/Syllabus";

export const AddSyllabus = async (data: CreateCurriculum): Promise<Curriculum | null> => {
  const props = {
    data: data,
    url: syllabusURL,
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
export const AddSyllabusAssessments = async (id: number, data: CreateCurriculum): Promise<Curriculum | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/assessments",
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
  export const AddSyllabusMaterial = async (id: number, data: SyllabusLearningMaterial): Promise<Curriculum | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/materials",
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
  export const AddSyllabusOutcomes = async (id: number, data: SyllabusLearningOutcome): Promise<Curriculum | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/outcomes",
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
  export const AddSyllabusSessions = async (id: number, data: SyllabusOutcome): Promise<Curriculum | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/sessions",
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
  export const AddSyllabusOutcomesToSession = async (sessionId: number, outcomeId: number): Promise<Curriculum | null> => {
    const props = {
      data: null,
      url: syllabusURL+"/sessions/"+sessionId+"/outcomes/"+outcomeId,
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
  

export const FetchSyllabusBySubject = async (subjectId: number): Promise<Subject[] | null> => {
  const props = {
    data: null,
    url: syllabusURL+"/by-subject/"+subjectId,
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

export const AddSubjectToCurriculum = async (id: number, data: CreateSubjectToCurriculum): Promise<CreateSubjectToCurriculum | null> => {
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
      return null;
    }
  };
  export const RemoveSubjectToCurriculum = async (subjectId: number, curriculumId: number): Promise<any | null> => {
    const props = {
      data: null,
      url: curriculumURL+"/"+curriculumId+"/subjects/"+subjectId,
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