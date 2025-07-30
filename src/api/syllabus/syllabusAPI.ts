import { axiosCreate, axiosRead, throwApiError } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { Syllabus, PagedData } from "../../interfaces/ISchoolProgram";

const syllabusURL = baseUrl + "/Syllabus";

export const GetSyllabusBySubject = async (subjectId: number) => {
    const props = {
        data: null,
        url: syllabusURL + `/subject/${subjectId}`,
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

export const GetSyllabusById = async (syllabusId: number) => {
    const props = {
        data: null,
        url: syllabusURL + `/${syllabusId}`,
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

// Hàm lấy syllabus có hỗ trợ search và pagination
interface FetchSyllabusParams {
    search?: string;
    page?: number;
    pageSize?: number;
}

export const fetchSyllabusPaged = async (params: FetchSyllabusParams): Promise<PagedData<Syllabus>> => {
    const { search = '', page = 1, pageSize = 10 } = params;
    const queryParams: any = {
        search,
        page,
        pageSize,
    };
    const props = {
        data: queryParams,
        url: syllabusURL,
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
