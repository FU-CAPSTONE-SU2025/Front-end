import { AdminViewBooking } from "../../interfaces/IBookingAvailability";
import { PagedData } from "../../interfaces/ISchoolProgram";
import { axiosRead, extractErrorMessage } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

const auditlogURL = baseUrl + "/AuditLog";
const meetingURL = baseUrl + "/Meeting";

export const GetAuditLog = async (): Promise<any> => {
  const props = {
    data: null,
    url: auditlogURL,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to fetch audit log');
  }
};

export const GetSyllabusBySubjectId = async (subjectId: number): Promise<any> => {
  const props = {
    data: null,
    url: auditlogURL + `/${subjectId}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to fetch syllabus by subject');
  }
};
  
export const GetAllMeetingRecordPaged = async (pageNumber: number = 1, pageSize: number = 10): Promise<PagedData<AdminViewBooking>> => {
  const props = {
    data: null,
    url: meetingURL + `/all/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to fetch syllabus by subject');
  }
}