import { useState } from 'react';
import { message } from 'antd';

import { 
  SubjectApproval, 
  CurriculumApproval, 
  SyllabusApproval, 
  ComboApproval 
} from '../interfaces/ISchoolProgram';
import { ApprovalType } from '../components/manager/approvalModal';
import { ApproveSubject } from '../api/SchoolAPI/subjectAPI';
import { ApproveCurriculum } from '../api/SchoolAPI/curriculumAPI';
import { ApproveSyllabus } from '../api/SchoolAPI/syllabusAPI';
import { ApproveCombo } from '../api/SchoolAPI/comboAPI';

interface UseApprovalActionsReturn {
  handleApproval: (type: ApprovalType, id: number, approvalStatus: number, rejectionReason?: string) => Promise<void>;
  isApproving: boolean;
}

export const useApprovalActions = (): UseApprovalActionsReturn => {
  const [isApproving, setIsApproving] = useState(false);

  const handleApproval = async (
    type: ApprovalType, 
    id: number, 
    approvalStatus: number, 
    rejectionReason?: string
  ): Promise<void> => {
    setIsApproving(true);
    
    try {
      const approvalData = {
        approvalStatus,
        rejectionReason: rejectionReason || null
      };

      switch (type) {
        case 'subject':
          await ApproveSubject(id, approvalData as SubjectApproval);
          break;
        case 'curriculum':
          await ApproveCurriculum(id, approvalData as CurriculumApproval);
          break;
        case 'syllabus':
          await ApproveSyllabus(id, approvalData as SyllabusApproval);
          break;
        case 'combo':
          await ApproveCombo(id, approvalData as ComboApproval);
          break;
        default:
          throw new Error(`Unknown approval type: ${type}`);
      }

      const action = approvalStatus === 2 ? 'approved' : 'rejected';
      const typeName = type.charAt(0).toUpperCase() + type.slice(1);
      message.success(`${typeName} ${action} successfully!`);
      
    } catch (error: any) {
      console.error('Approval error:', error);
      const errorMessage = error?.message || 'Failed to process approval';
      message.error(errorMessage);
      throw error; // Re-throw so the modal can handle it
    } finally {
      setIsApproving(false);
    }
  };

  return {
    handleApproval,
    isApproving
  };
}; 