import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, extractErrorMessage, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { CreateSyllabus, Curriculum, Subject, Syllabus, UpdateSyllabus, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from "../../interfaces/ISchoolProgram";

const syllabusURL = baseUrl + "/Syllabus";

export const AddSyllabus = async (data: CreateSyllabus): Promise<Syllabus> => {
  const props = {
    data: data,
    url: syllabusURL,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};
export const AddSyllabusAssessments = async ( data: CreateSyllabusAssessment): Promise<Curriculum> => {
    const props = {
      data: data,
      url: syllabusURL+"/assessments",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };
  export const AddSyllabusAssessmentsBulk = async ( data: CreateSyllabusAssessment[]): Promise<Curriculum> => {
    const props = {
      data: data,
      url: syllabusURL+"/assessments/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };
  export const AddSyllabusMaterial = async ( data: CreateSyllabusMaterial): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL+"/materials",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };
  export const AddSyllabusOutcomes = async ( data: CreateSyllabusOutcome): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL+"/outcomes",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };
  export const AddSyllabusSessions = async ( data: CreateSyllabusSession): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL+"/sessions",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };
  export const AddSyllabusOutcomesToSession = async (sessionId: number, outcomeId: number): Promise<Curriculum> => {
    const props = {
      data: null,
      url: syllabusURL+"/sessions/"+sessionId+"/outcomes/"+outcomeId,
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };
  export const AddSyllabusMaterialsBulk = async (data: CreateSyllabusMaterial[]): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL + "/materials/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };

  export const AddSyllabusOutcomesBulk = async (data: CreateSyllabusOutcome[]): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL + "/outcomes/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };

  export const AddSyllabusSessionsBulk = async (data: CreateSyllabusSession[]): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL + "/sessions/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
      return null as never;
    }
  };
  

export const FetchSyllabusBySubjectVersion = async (subjectVersionId: number): Promise<Syllabus> => {
  const props = {
    data: null,
    url: syllabusURL+"/by-subject-version/"+subjectVersionId,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  console.log(result);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const FetchSyllabusBySubject = async (subjectId: number): Promise<Syllabus> => {
  const props = {
    data: null,
    url: syllabusURL+"/by-subject/"+subjectId,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const UpdateSyllabusById = async (id: number, data: UpdateSyllabus): Promise<any> => {
  const props = {
    data: data,
    url: syllabusURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
};

export const DisableSyllabus = async (id: number): Promise<any> => {
  const props = {
    data: null,
    url: syllabusURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
}; 