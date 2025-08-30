import { axiosCreate, axiosDelete, axiosRead, axiosUpdate, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps, AccountPropsCreate } from "../../interfaces/IAccount";
import { 
    pagedStudentData, 
    CreateBookingMeetingRequest, 
    BookingMeetingResponse,  
    AdvisorMeetingPaged, 
    IStudentBookingResponse, 
    IStudentBookingCalendarResponse,
    PagedAdvisorData,
    PagedLeaveScheduleData,
    BookingAvailabilityData,
    JoinedSubject,
    SubjectCheckpoint,
    SubjectCheckpointDetail,
    IUpdateStudentMajor,
    SubjectMark
} from "../../interfaces/IStudent";
import { ChatSessionRequest, ChatSessionResponse } from "../../interfaces/IChat";


const userURL = baseUrl+"/User/student"

export const GetAllStudent = async (pageNumber: number = 1, pageSize: number = 10, search?: string, filterType?: string, filterValue?: string):Promise<pagedStudentData> => {
    // Build query parameters
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        search:search
    });
    if (filterType && filterValue) {
        params.append('filterType', filterType);
        params.append('filterValue', filterValue);
    }
    const props = {
        data: null,
        url: userURL+`/paged?` + params.toString(),
    }
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

export const RegisterStudent = async (data: AccountPropsCreate):Promise<any> => {
    const props = {
        data: data,
        url: userURL,
        headers: GetHeader()
    }
    const result = await axiosCreate(props)
    if (result.success) {
        //(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}


export const FetchStudentById = async (userId:number):Promise<AccountProps> => {
    const props = {
        data: null,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosRead(props)
    if (result.success) {
        //(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}
export const UpdateStudent = async (userId:number,data:any):Promise<AccountProps> => {
    const props = {
        data: data,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        //(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}
export const UpdateStudentMajor = async (studentProfileId:number,data:IUpdateStudentMajor):Promise<any> => {
  const props = {
      data: data,
      url: baseUrl+`/`+"Profile/student-profile/"+studentProfileId,
      headers: GetHeader()
  }
  const result = await axiosUpdate(props)
  if (result.success) {
      //(result.data)
      return result.data
  }
  else {
      throwApiError(result);
      return null as never;
  }
}
export const DisableUser = async (userId:number):Promise<AccountProps> => {
    const props = {
        data: null,
        url: userURL+`/`+userId,
        headers: GetHeader()
    }
    const result = await axiosDelete(props)
    if (result.success) {
        //(result.data)
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}



export const GetActiveAdvisors = async (pageNumber: number = 1, pageSize: number = 10): Promise<PagedAdvisorData> => {
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
    });
    
    const props = {
        data: null,
        url: baseUrl + `/User/advisors/active/paged?` + params.toString(),
        headers: GetHeader()
    }
    
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}





export const GetPagedLeaveSchedulesOneStaff = async (staffProfileId: number): Promise<PagedLeaveScheduleData> => {
  const props = {
      data: null,
      url: baseUrl + `/LeaveSche/${staffProfileId}`,
      headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
      return result.data
  }
  else {
      throwApiError(result);
      return null as never;
  }
}

// Get booking availability for an advisor
export const GetBookingAvailability = async (staffProfileId: number): Promise<BookingAvailabilityData[]> => {
    const props = {
        data: null,
        url: baseUrl + `/BookingAvailability/${staffProfileId}`,
        headers: GetHeader()
    }
    
    const result = await axiosRead(props)
    if (result.success) {
  
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

// API tạo booking meeting
export const CreateBookingMeeting = async (data: CreateBookingMeetingRequest): Promise<BookingMeetingResponse> => {
  const props = {
    data,
    url: baseUrl + '/Meeting',
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

export const getAdvisorMeetings = async (staffProfileId: number, pageNumber = 1, pageSize = 50): Promise<AdvisorMeetingPaged> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/all-of-one-adv/paged/${staffProfileId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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



// API lấy chi tiết meeting - cho cả Admin
export const getMeetingDetail = async (meetingId: number): Promise<any> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/detail/${meetingId}`,
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

export const sendMeetingFeedback = async (meetingId: number, feedback: string, suggestionFromAdvisor: string): Promise<any> => {
  const props = {
    data: { feedback, suggestionFromAdvisor },
    url: `${baseUrl}/Meeting/feedBack/${meetingId}`,
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

// API cancel confirmed meeting by student
export const cancelConfirmedMeeting = async (meetingId: number, note: string): Promise<any> => {
  const props = {
    data: { note },
    url: `${baseUrl}/Meeting/stu-cancel-the-confirmed/${meetingId}`,
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

// API cancel pending meeting by student
export const cancelPendingMeeting = async (meetingId: number, note: string): Promise<any> => {
  const props = {
    data: { note },
    url: `${baseUrl}/Meeting/stu-cancel-the-pending/${meetingId}`,
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

// API mark advisor missed by student
export const markAdvisorMissed = async (meetingId: number, note: string): Promise<any> => {
  const props = {
    data: { note },
    url: `${baseUrl}/Meeting/mark-adv-missed/${meetingId}`,
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

// Get all student self bookings for history calendar
export const getAllStudentSelfBookings = async (pageNumber: number, pageSize: number): Promise<IStudentBookingResponse> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/all-stu-self/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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

// Get all student self bookings for history calendar (API riêng cho calendar)
export const getStudentBookingsForCalendar = async (pageNumber: number, pageSize: number): Promise<IStudentBookingCalendarResponse> => {
  const props = {
    data: null,
    url: `${baseUrl}/Meeting/all-stu-self/active/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    const calendarData = {
      ...result.data,
      items: result.data.items.map((item: any) => ({
        id: item.id,
        startDateTime: item.startDateTime,
        endDateTime: item.endDateTime,
        status: item.status,
        titleStudentIssue: item.titleStudentIssue,
        staffProfileId: item.staffProfileId,
        staffFirstName: item.staffFirstName,
        staffLastName: item.staffLastName,
      }))
    };
    return calendarData;
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get unassigned sessions for student
export const getUnassignedSessions = async () => {
  const props = {
    data: null,
    url: baseUrl + "/AdvisorySession1to1/unassigned",
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

// Get max number of bans for student
export const getMaxNumberOfBan = async () => {
  const props = {
    data: null,
    url: baseUrl + "/Meeting/max-number-of-ban",
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

// Get current number of bans for student
export const getCurrentNumberOfBan = async () => {
  const props = {
    data: null,
    url: baseUrl + "/Meeting/cur-number-of-ban",
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





// Initialize chat session with human advisor
export const initChatSession = async (message: string): Promise<ChatSessionResponse> => {
  const props = {
    data: { message } as ChatSessionRequest,
    url: baseUrl + "/AdvisorySession1to1/human",
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

// Get joined subjects for current student
export const getJoinedSubjects = async (): Promise<JoinedSubject[]> => {
  const props = {
    data: null,
    url: baseUrl + "/JoinedSubject/self",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    // Ensure we always return an array
    return Array.isArray(result.data) ? result.data : [];
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get joined subject by ID
export const getJoinedSubjectById = async (id: number): Promise<JoinedSubject> => {
  const props = {
    data: null,
    url: baseUrl + `/JoinedSubject/${id}`,
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

// Get subject checkpoints/todo list for joined subject
export const getSubjectCheckpoints = async (joinedSubjectId: number): Promise<SubjectCheckpoint[]> => {
  const props = {
    data: null,
    url: baseUrl + `/JoinedSubjectCheckPoint/joinedSubject/${joinedSubjectId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  
  if (result.success) {
 
    // Ensure we always return an array
    return Array.isArray(result.data) ? result.data : [];
  } else {
    throwApiError(result);
    return null as never;
  }
};

// Get detailed checkpoint information by ID
export const getCheckpointDetail = async (checkpointId: number): Promise<SubjectCheckpointDetail> => {
  const props = {
    data: null,
    url: baseUrl + `/JoinedSubjectCheckPoint/${checkpointId}`,
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

// Update checkpoint
export const updateCheckpoint = async (checkpointId: number, data: {
  title: string;
  content: string;
  note: string;
  link1: string;
  link2: string;
  link3: string;
  link4: string;
  link5: string;
  deadline: string;
}): Promise<SubjectCheckpointDetail> => {
  const props = {
    data: data,
    url: baseUrl + `/JoinedSubjectCheckPoint/${checkpointId}`,
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

// Delete checkpoint
export const deleteCheckpoint = async (checkpointId: number): Promise<boolean> => {
  const props = {
    data: null,
    url: baseUrl + `/JoinedSubjectCheckPoint/${checkpointId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosDelete(props);
  
  if (result.success) {
    ("Checkpoint deleted successfully");
    return true;
  } else {
    throwApiError(result);
    return false;
  }
};

// Complete checkpoint
export const completeCheckpoint = async (checkpointId: number): Promise<boolean> => {
  const props = {
    data: null,
    url: baseUrl + `/JoinedSubjectCheckPoint/complete/${checkpointId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosUpdate(props);
  
  if (result.success) {
    ("Checkpoint completed successfully");
    return true;
  } else {
    throwApiError(result);
    return false;
  }
};

// AI Generate checkpoints
export const generateCheckpoints = async (joinedSubjectId: number, studentMessage: string): Promise<any[]> => {
  const props = {
    data: { studentMessage },
    url: baseUrl + `/JoinedSubjectCheckPoint/gen/${joinedSubjectId}`,
    headers: GetHeader(),
  };
  
  const result = await axiosRead(props);
  
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return [];
  }
};

// Create single checkpoint
export const createCheckpoint = async (joinedSubjectId: number, data: {
  title: string;
  content: string;
  note: string;
  link1: string;
  link2: string;
  link3: string;
  link4: string;
  link5: string;
  deadline: string;
}): Promise<SubjectCheckpointDetail> => {
  const props = {
    data: data,
    url: baseUrl + `/JoinedSubjectCheckPoint/${joinedSubjectId}`,
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

// Bulk save checkpoints
export const bulkSaveCheckpoints = async (joinedSubjectId: number, checkpoints: any[], doReplaceAll: boolean = false): Promise<boolean> => {
  const params = new URLSearchParams({
    doReplaceAll: doReplaceAll.toString()
  });
  
  const props = {
    data: checkpoints,
    url: baseUrl + `/JoinedSubjectCheckPoint/bulk/${joinedSubjectId}?` + params.toString(),
    headers: GetHeader(),
  };
  
  const result = await axiosCreate(props);
  
  if (result.success) {
    ("Checkpoints saved successfully");
    return true;
  } else {
    throwApiError(result);
    return false;
  }
};

// Get upcoming checkpoints/todos
export const getUpcomingCheckpoints = async (): Promise<SubjectCheckpoint[]> => {
  const props = {
    data: null,
    url: baseUrl + `/JoinedSubjectCheckPoint/upcoming`,
    headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return [] as never;
  }
};

// Add: Get checkpoints/todos for a student profile (paged with filters)
export const getStudentCheckpoints = async (
  studentProfileId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
  opts?: {
    isInCompletedOnly?: boolean;
    isNoneFilterStatus?: boolean;
    isOrderedByNearToFarDeadline?: boolean;
  }
): Promise<{ items: SubjectCheckpoint[]; totalCount: number; pageNumber: number; pageSize: number }> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  
  if (typeof opts?.isInCompletedOnly === 'boolean') {
    params.append('isInCompletedOnly', String(opts.isInCompletedOnly));
  }
  if (typeof opts?.isNoneFilterStatus === 'boolean') {
    params.append('isNoneFilterStatus', String(opts.isNoneFilterStatus));
  }
  if (typeof opts?.isOrderedByNearToFarDeadline === 'boolean') {
    params.append('isOrderedByNearToFarDeadline', String(opts.isOrderedByNearToFarDeadline));
  }

  const props = {
    data: null,
    url: `${baseUrl}/JoinedSubjectCheckPoint/student/${studentProfileId}?${params.toString()}`,
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

// Get all joined subjects for a student profile
export const getJoinedSubjectsOfStudent = async (studentProfileId: number): Promise<any[]> => {
  const props = {
    data: null,
    url: baseUrl + `/JoinedSubject/${studentProfileId}/all`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return Array.isArray(result.data) ? result.data : [];
  } else {
    throwApiError(result);
    return [] as never;
  }
};

// Get all students by combo code (paged)
export const GetStudentsByCombo = async (comboCode: string, pageNumber: number = 1, pageSize: number = 10): Promise<pagedStudentData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });
  
  const props = {
    data: null,
    url: userURL + `/${comboCode}/paged?` + params.toString(),
    headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
    return result.data
  }
  else {
    throwApiError(result);
    return null as never;
  }
}

// Get all students by program ID (paged)
export const GetStudentsByProgram = async (programId: number, pageNumber: number = 1, pageSize: number = 10): Promise<pagedStudentData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });
  
  const props = {
    data: null,
    url: userURL + `/${programId}/paged?` + params.toString(),
    headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
    return result.data
  }
  else {
    throwApiError(result);
    return null as never;
  }
}

// Get all students by curriculum code (paged)
export const GetStudentsByCurriculum = async (curriculumCode: string, pageNumber: number = 1, pageSize: number = 10): Promise<pagedStudentData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });
  
  const props = {
    data: null,
    url: userURL + `/${curriculumCode}/paged?` + params.toString(),
    headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
    return result.data
  }
  else {
    throwApiError(result);
    return null as never;
  }
}

// Get all active students by combo code (paged)
export const GetActiveStudentsByCombo = async (comboCode: string, pageNumber: number = 1, pageSize: number = 10): Promise<pagedStudentData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });
  
  const props = {
    data: null,
    url: userURL + `/active/comboFilter/${comboCode}/paged?` + params.toString(),
    headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
    return result.data
  }
  else {
    throwApiError(result);
    return null as never;
  }
}

// Get all active students by program ID (paged)
export const GetActiveStudentsByProgram = async (programId: number, pageNumber: number = 1, pageSize: number = 10): Promise<pagedStudentData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });
  
  const props = {
    data: null,
    url: userURL + `/active/programFilter/${programId}/paged?` + params.toString(),
    headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
    return result.data
  }
  else {
    throwApiError(result);
    return null as never;
  }
}

// Get all active students by curriculum code (paged)
export const GetActiveStudentsByCurriculum = async (curriculumCode: string, pageNumber: number = 1, pageSize: number = 10): Promise<pagedStudentData> => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });
  
  const props = {
    data: null,
    url: userURL + `/active/curriculumFilter/${curriculumCode}/paged?` + params.toString(),
    headers: GetHeader()
  }
  
  const result = await axiosRead(props)
  if (result.success) {
    return result.data
  }
  else {
    throwApiError(result);
    return null as never;
  }
}

export const getPersonalCurriculumSubjects = async (): Promise<Array<{ subjectCode: string; subjectName: string; credits: number; semesterNumber: number }>> => {
  const props = {
    data: null,
    url: baseUrl + "/Profile/personal-curriculum-subject",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    const items = Array.isArray(result.data) ? result.data : [];
    return items.map((x: any) => ({
      subjectCode: x.subjectCode,
      subjectName: x.subjectName,
      credits: x.credits,
      semesterNumber: x.semesterNumber,
    }));
  } else {
    throwApiError(result);
    return [] as never;
  }
};

export const getPersonalComboSubjects = async (): Promise<Array<{ subjectCode: string; subjectName: string; credits: number; semesterNumber: number }>> => {
  const props = {
    data: null,
    url: baseUrl + "/Profile/personal-combo-subject",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    const items = Array.isArray(result.data) ? result.data : [];
    return items.map((x: any) => ({
      subjectCode: x.subjectCode,
      subjectName: x.subjectName,
      credits: x.credits,
      semesterNumber: x.semesterNumber,
    }));
  } else {
    throwApiError(result);
    return [] as never;
  }
};

export const getSubjectMarks = async (joinedSubjectId: number): Promise<SubjectMark[]> => {
    const props = {
        data: null,
        url: baseUrl + `/SubjecMarkRp/${joinedSubjectId}`,
        headers: GetHeader()
    }
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

export const postSubjectComment = async (subjectId: number, content: string): Promise<any> => {
    const props = {
        data: { subjectId, content },
        url: baseUrl + '/SubjectComment',
        headers: GetHeader()
    }
    const result = await axiosCreate(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

export const getSubjectComments = async (subjectId: number): Promise<any> => {
    const props = {
        data: null,
        url: baseUrl + `/SubjectComment/subject/${subjectId}`,
        headers: GetHeader()
    }
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

export const postCommentReaction = async (commentId: number, reactionType: number): Promise<any> => {
    const props = {
        data: { reactionType },
        url: baseUrl + `/SubjectComment/${commentId}/reactions`,
        headers: GetHeader()
    }
    const result = await axiosCreate(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

// Get GitHub repository data
export const getGitHubRepoData = async (owner: string, repoName: string): Promise<any> => {
    const props = {
        data: null,
        url: baseUrl + `/GitRepo?owner=${owner}&repoName=${repoName}`,
        headers: GetHeader()
    }
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}

// Update GitHub repository URL for a joined subject
export const updateGitHubRepoURL = async (joinedSubjectId: number, publicRepoURL: string): Promise<any> => {
    const props = {
        data: null, // No body data needed
        url: baseUrl + `/GitRepo/${joinedSubjectId}?publicRepoURL=${encodeURIComponent(publicRepoURL)}`,
        headers: GetHeader()
    }
    const result = await axiosUpdate(props)
    if (result.success) {
        return result.data
    }
    else {
        throwApiError(result);
        return null as never;
    }
}