import { AuditLog } from "../../interfaces/IAuditLog";
import { AdminViewBooking } from "../../interfaces/IBookingAvailability";
import { PagedData } from "../../interfaces/ISchoolProgram";
import { axiosRead, extractErrorMessage } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";

const auditlogURL = baseUrl + "/AuditLog";
const meetingURL = baseUrl + "/Meeting";

export const GetAllAuditLog = async (): Promise<AuditLog[]> => {
  const props = {
    data: null,
    url: auditlogURL+"/all",
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    console.log(result.data)
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to fetch audit log');
  }
};

export const GetAuditLogPaged= async (pageNumber: number = 1, pageSize: number = 10): Promise<PagedData<AuditLog>> => {
  const props = {
    data: null,
    url: auditlogURL+`?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throw new Error(extractErrorMessage(result.error) || 'Failed to fetch audit log');
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