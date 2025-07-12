import { AccountProps } from "./IAccount";

export interface ManagerBase extends AccountProps {
  department: string;
  position: string;
  startWorkAt: Date;
  endWorkAt?: Date;
  address: string;
  phone: string;
}

export interface pagedManagerData {
  items: ManagerBase[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface CreateManager {
  department: string;
  position: string;
  startWorkAt: Date;
} 