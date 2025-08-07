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
    searchType?: 'code' | 'name' | 'all';
}

export const fetchSyllabusPaged = async (params: FetchSyllabusParams): Promise<PagedData<Syllabus>> => {
    const { search = '', page = 1, pageSize = 10, searchType = 'code' } = params;
    const queryParams: any = {
        page,
        pageSize,
    };
    
    console.log('API Call - URL:', syllabusURL);
    console.log('API Call - Query Params:', queryParams);
    
    const props = {
        data: queryParams,
        url: syllabusURL,
        headers: GetHeader(),
    };
    const result = await axiosRead(props);
    if (result.success) {
        console.log('API Response:', result.data);
        
        // Filter ở frontend dựa trên searchType
        let filteredItems = result.data.items;
        
        console.log('Original items count:', result.data.items.length);
        console.log('Search term:', search);
        console.log('Search type:', searchType);
        
        if (search.trim()) {
            console.log('Filtering items...');
            filteredItems = result.data.items.filter((item: Syllabus) => {
                console.log('Checking item:', item.subjectCode, item.subjectName);
                
                if (searchType === 'code') {
                    const matches = item.subjectCode.toLowerCase().includes(search.toLowerCase());
                    console.log(`Code match for "${item.subjectCode}": ${matches}`);
                    return matches;
                } else if (searchType === 'name') {
                    const matches = item.subjectName.toLowerCase().includes(search.toLowerCase());
                    console.log(`Name match for "${item.subjectName}": ${matches}`);
                    return matches;
                } else {
                    // searchType === 'all'
                    const codeMatch = item.subjectCode.toLowerCase().includes(search.toLowerCase());
                    const nameMatch = item.subjectName.toLowerCase().includes(search.toLowerCase());
                    const matches = codeMatch || nameMatch;
                    console.log(`All match for "${item.subjectCode}"/"${item.subjectName}": ${matches}`);
                    return matches;
                }
            });
            console.log('Filtered items count:', filteredItems.length);
        }
        
        // Tính toán pagination cho filtered data
        const totalCount = filteredItems.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);
        
        return {
            items: paginatedItems,
            pageNumber: page,
            pageSize: pageSize,
            totalCount: totalCount
        };
    } else {
        throwApiError(result);
        return null as never;
    }
};
