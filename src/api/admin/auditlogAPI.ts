import { AuditLog, GetAnalyticsAuditLogProps } from "../../interfaces/IAuditLog";
import { AdminViewBooking } from "../../interfaces/IBookingAvailability";
import { PagedData } from "../../interfaces/ISchoolProgram";
import { axiosDelete, axiosRead, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { debugLog } from "../../utils/performanceOptimization";

const auditlogURL = baseUrl + "/AuditLog";
const meetingURL = baseUrl + "/Meeting";

export const GetAnalyticsLog = async (startDate:string,endDate:string): Promise<GetAnalyticsAuditLogProps> => {
  const props = {
    data: null,
    url: auditlogURL+`/analytics?startDate=${startDate}&endDate=${endDate}`,
    headers: GetHeader(),
  };
  const result = await axiosRead(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
}

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
    throwApiError(result);
    return null as never;
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
    throwApiError(result);
    return null as never;
  }
}



// Admin only
export const DeleteMeetingById = async (id:number): Promise<any> => {
  const props = {
    data: null,
    url: meetingURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    throwApiError(result);
    return null as never;
  }
}