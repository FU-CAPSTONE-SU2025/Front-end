import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, extractErrorMessage } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { CreateSyllabus, Curriculum, Subject, Syllabus, UpdateSyllabus, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from "../../interfaces/ISchoolProgram";

const syllabusURL = baseUrl + "/Syllabus";

export const AddSyllabus = async (data: CreateSyllabus): Promise<Syllabus | null> => {
  const props = {
    data: data,
    url: syllabusURL,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus');
  }
};
export const AddSyllabusAssessments = async ( data: CreateSyllabusAssessment): Promise<Curriculum | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/assessments",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus assessments');
    }
  };
  export const AddSyllabusAssessmentsBulk = async ( data: CreateSyllabusAssessment[]): Promise<Curriculum | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/assessments/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus assessments');
    }
  };
  export const AddSyllabusMaterial = async ( data: CreateSyllabusMaterial): Promise<any | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/materials",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus material');
    }
  };
  export const AddSyllabusOutcomes = async ( data: CreateSyllabusOutcome): Promise<any | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/outcomes",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus outcomes');
    }
  };
  export const AddSyllabusSessions = async ( data: CreateSyllabusSession): Promise<any | null> => {
    const props = {
      data: data,
      url: syllabusURL+"/sessions",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus sessions');
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
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus outcomes to session');
    }
  };
  export const AddSyllabusMaterialsBulk = async (data: CreateSyllabusMaterial[]): Promise<any | null> => {
    const props = {
      data: data,
      url: syllabusURL + "/materials/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus materials');
    }
  };

  export const AddSyllabusOutcomesBulk = async (data: CreateSyllabusOutcome[]): Promise<any | null> => {
    const props = {
      data: data,
      url: syllabusURL + "/outcomes/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus outcomes');
    }
  };

  export const AddSyllabusSessionsBulk = async (data: CreateSyllabusSession[]): Promise<any | null> => {
    const props = {
      data: data,
      url: syllabusURL + "/sessions/bulk",
      headers: GetHeader(),
    };
    const result = await axiosCreate(props);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(extractErrorMessage(result.error) || 'Failed to add syllabus sessions');
    }
  };
  

export const FetchSyllabusBySubject = async (subjectId: number): Promise<Subject[] | null> => {
  const props = {
    data: null,
    url: syllabusURL+"/by-subject/"+subjectId,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    //throw new Error(result.error || 'Failed to fetch syllabus by subject');
    return null;
  }
};

export const UpdateSyllabusById = async (id: number, data: UpdateSyllabus): Promise<any | null> => {
  const props = {
    data: data,
    url: syllabusURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to update curriculum');
  }
};

export const DisableSyllabus = async (id: number): Promise<any | null> => {
  const props = {
    data: null,
    url: syllabusURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to disable curriculum');
  }
}; 