import { axiosCreate, axiosDelete, axiosRead, axiosUpdate } from "../AxiosCRUD";
import { baseUrl, GetHeader } from "../template";
import { AccountProps } from "../../interfaces/IAccount";
import { CreateCombo, Combo, UpdateCombo, Subject, SubjectInCombo } from "../../interfaces/ISchoolProgram";
import { PagedData } from "../../interfaces/ISchoolProgram";

const comboURL = baseUrl + "/Combo";

export const AddCombo = async (data: CreateCombo): Promise<Combo | null> => {
  const props = {
    data: data,
    url: comboURL,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};
export const GetSubjectsInCombo = async (comboId:number): Promise<SubjectInCombo[] | null> => {
    const props = {
      data: null,
      url: comboURL+"/"+comboId+"/subjects",
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

export const AddSubjectToCombo = async (comboId:number,subjectId:number): Promise<Combo | null> => {
    console.log(comboId,subjectId);
  const props = {
    data: null,
    url: comboURL+"/"+comboId+"/subjects/"+subjectId,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

export const RemoveSubjectToCombo = async (comboId:number,subjectId:number): Promise<Combo | null> => {
    const props = {
      data: null,
      url: comboURL+"/"+comboId+"/subjects/"+subjectId,
      headers: GetHeader(),
    };
    const result = await axiosDelete(props);
    if (result.success) {
      return result.data;
    } else {
      console.log(result.error);
      return null;
    }
  };

export const RegisterMultipleCombo = async (data: CreateCombo[]): Promise<any> => {
  const props = {
    data: data,
    url: comboURL,
    headers: GetHeader(),
  };
  const result = await axiosCreate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

export const FetchComboList = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<PagedData<Combo> | null> => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const props = {
    data: null,
    url: comboURL + "?" + params.toString(),
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

export const FetchComboById = async (id: number): Promise<Combo | null> => {
  const props = {
    data: null,
    url: comboURL + `/${id}`,
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

export const UpdateComboById = async (id: number, data: any): Promise<Combo | null> => {
  const props = {
    data: data,
    url: comboURL + `/${id}`,
    headers: GetHeader(),
  };
  const result = await axiosUpdate(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
};

export const DisableCombo = async (comboId: number): Promise<AccountProps | null> => {
  const props = {
    data: null,
    url: comboURL + `/${comboId}`,
    headers: GetHeader(),
  };
  const result = await axiosDelete(props);
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    return null;
  }
}; 