import { axiosRead, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import {IStudentSubjectActivityOverview, IStudentPerformanceOverview} from "../../interfaces/IDashboard";

const studentDashboardURL = baseUrl + "/Dashboard";


export const GetStudentSubjectDashboard = async (studentProfileId:number): Promise<IStudentSubjectActivityOverview[] | null> => {
    const props = {
      data: null,
      url: studentDashboardURL+`/subjects/student-semester-performance?studentProfileId=${studentProfileId}`,
      headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };

  export const GetStudentPerformanceDashboard = async (studentProfileId:number): Promise<IStudentPerformanceOverview[] | null> => {
    const props = {
      data: null,
      url: studentDashboardURL+`/subjects/student-category-performance?studentProfileId=${studentProfileId}`,
      headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };



  