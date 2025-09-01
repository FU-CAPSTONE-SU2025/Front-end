import { axiosRead, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { ICurriculumOverview, IOverviewDashboard, ISubjectOverView,ISubjectActivityOverview} from "../../interfaces/IDashboard";

const dashboardURL = baseUrl + "/FLMDashboard";


export const GetSubjectDashboardRecent = async (): Promise<ISubjectActivityOverview | null> => {
    const props = {
      data: null,
      url: dashboardURL+"/subjects/recent-activities",
      headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };

  export const GetSubjectDashboard = async (): Promise<ISubjectOverView | null> => {
    const props = {
      data: null,
      url: dashboardURL+"/subjects/statistics",
      headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };

export const GetCurriculumDashboard = async (): Promise<ICurriculumOverview | null> => {
    const props = {
      data: null,
      url: dashboardURL+"/curricula/statistics",
      headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };
  export const GetOverviewDashboard = async (): Promise<IOverviewDashboard | null> => {
    const props = {
      data: null,
      url: dashboardURL+"/overview",
      headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
      return result.data;
    } else {
      throwApiError(result);
    }
  };

  