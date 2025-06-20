export interface StudentBase {
  userId: number
  studentCode:string
  enrollDate:Date
  currentGpa:number
}
export interface CreateStudent {
  userId: number
  studentCode:string
  enrollDate:Date
  currentGpa:number
}