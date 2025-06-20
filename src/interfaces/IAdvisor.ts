export interface AdvisorBase {
  userId: number
  specialization: string
  yearsOfExperience:  number
  bio: string
}
export interface CreateAdvisor {
 specialization: string
  yearsOfExperience:  number
  bio: string
}