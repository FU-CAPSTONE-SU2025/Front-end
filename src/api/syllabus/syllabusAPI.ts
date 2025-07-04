import { axiosRead } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { pagedSyllabusData, SyllabusItem } from "../../interfaces/ISyllabus";

const userURL = baseUrl+"/Syllabus"
export const GetAllSyllabus = async (): Promise<SyllabusItem[] | null> => {
    const props = {
        data: null,
        url: userURL,
        headers: GetHeader()
    }
    const result = await axiosRead(props)
    if (result.success) {
        return result.data
    } else {
        console.log(result.error)
        return null
    }
}

// Hàm lấy syllabus có hỗ trợ search và pagination
interface FetchSyllabusParams {
    search?: string;
    page?: number;
    pageSize?: number;
}

export const fetchSyllabusPaged = async (params: FetchSyllabusParams): Promise<pagedSyllabusData | null> => {
    const { search = '', page = 1, pageSize = 10 } = params;
    const queryParams: any = {
        search,
        page,
        pageSize,
    };
    const props = {
        data: queryParams,
        url: userURL,
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
