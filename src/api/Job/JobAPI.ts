import { axiosCreate, axiosRead } from "../AxiosCRUD";
import { baseUrl, header } from "../template";
import { IJobProps, IJobPropsCreate } from "./IJob";
const jobUrl = baseUrl + "/job";

export const CreateJob = async (data: IJobPropsCreate):Promise<any> => {
    const props = {
        data: data,
        url: jobUrl,
        headers: header
    }
    const result = await axiosCreate(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }

}
export const FetchJob = async ():Promise<IJobProps[]> => {
    const props = {
        data: null,
        url: jobUrl,
        headers: header
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return []
    }

}
export const FetchJobById = async ():Promise<IJobProps|null> => {
    const props = {
        data: null,
        url: jobUrl,
        headers: header
    }
    const result = await axiosRead(props)
    if (result.success) {
        //console.log(result.data)
        return result.data
    }
    else {
        console.log(result.error)
        return null
    }
}