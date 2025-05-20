export interface IJobProps {
    createdAt: Date,
    jobName: string,
    jobDescription: string,
    jobSalary: number,
    jobSlot: 1|2|3|4|5|6|7,
    posterId: string,
    acceptedId: string,
    isActive: boolean,
    id: string
}
export interface IJobPropsCreate {
    createdAt: Date,
    jobName: string,
    jobDescription: string,
    jobSalary: number,
    jobSlot: 1|2|3|4|5|6|7,
    posterId: string,
    isActive: boolean,
}
export interface IJobPropsUpdate {
    createdAt: Date,
    jobName: string,
    jobDescription: string,
    jobSalary: number,
    jobSlot: 1|2|3|4|5|6|7,
    posterId: string,
    acceptedId: string,
    isActive: boolean,
}

