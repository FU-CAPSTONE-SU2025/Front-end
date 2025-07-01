import { AccountProps } from "./IAccount";

export interface AdvisorBase extends AccountProps {
  specialization: string
  yearsOfExperience:  number
  bio: string
}

export interface pagedAdvisorData {
  items: AdvisorBase[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface CreateAdvisor {
 specialization: string
  yearsOfExperience:  number
  bio: string
}