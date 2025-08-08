import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, extractErrorMessage, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { CreateSyllabus, Curriculum, Subject, Syllabus, UpdateSyllabus, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession, SyllabusApproval } from "../../interfaces/ISchoolProgram";

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
    }
  };
  export const UpdateSyllabusAssessment = async ( id:number,data: CreateSyllabusAssessment): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL+`/assessments/${id}`,
      headers: GetHeader(),
    };
    const result = await axiosUpdate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };
  export const DeleteSyllabusAssessment = async ( id:number): Promise<any> => {
    const props = {
      data: null,
      url: syllabusURL+`/assessments/${id}`,
      headers: GetHeader(),
    };
    const result = await axiosDelete(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
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
    }
  };
  export const UpdateSyllabusMaterial = async (id:number, data: CreateSyllabusMaterial): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL+`/materials/${id}`,
      headers: GetHeader(),
    };
    const result = await axiosUpdate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };
  export const DeleteSyllabusMaterial = async (id:number): Promise<any> => {
    const props = {
      data:null,
      url: syllabusURL+`/materials/${id}`,
      headers: GetHeader(),
    };
    const result = await axiosDelete(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
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
    }
  };
  export const UpdateSyllabusSessions = async ( id:number,data: CreateSyllabusSession): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL+`/sessions/${id}`,
      headers: GetHeader(),
    };
    const result = await axiosUpdate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };
  export const DeleteSyllabusSessions = async ( id:number): Promise<any> => {
    const props = {
      data: null,
      url: syllabusURL+`/sessions/${id}`,
      headers: GetHeader(),
    };
    const result = await axiosDelete(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
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
    }
  };
  export const DeleteSyllabusOutcomesToSession = async (sessionId: number, outcomeId: number): Promise<any> => {
    const props = {
      data: null,
      url: syllabusURL+"/sessions/"+sessionId+"/outcomes/"+outcomeId,
      headers: GetHeader(),
    };
    const result = await axiosDelete(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
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
    }
  };
  export const UpdateSyllabusOutcomes = async (id:number,data: CreateSyllabusOutcome): Promise<any> => {
    const props = {
      data: data,
      url: syllabusURL + "/outcomes/"+id,
      headers: GetHeader(),
    };
    const result = await axiosUpdate(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };
  export const DeleteSyllabusOutcomes = async (id:number): Promise<any> => {
    const props = {
      data: null,
      url: syllabusURL + "/outcomes/"+id,
      headers: GetHeader(),
    };
    const result = await axiosDelete(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
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

export const ApproveSyllabus = async (syllabusId: number, data: SyllabusApproval): Promise<Syllabus | null> => {
  const props = {
    data: data,
    url: baseUrl + `/Approval/syllabus/${syllabusId}`,
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