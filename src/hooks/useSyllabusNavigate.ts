import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSyllabusByJoinedSubject } from './useStudentFeature';

export const useSyllabusNavigate = (joinedSubjectId: number | null) => {
  const navigate = useNavigate();
  const [triggerId, setTriggerId] = useState<number | null>(null);

  const { data: syllabusIdData, isLoading } = useSyllabusByJoinedSubject(triggerId);

  useEffect(() => {
    if (syllabusIdData && (syllabusIdData as any).syllabusId) {
      const syllabusId = (syllabusIdData as any).syllabusId as number;
      navigate(`/student/syllabus/${syllabusId}`);
      setTriggerId(null);
    }
  }, [syllabusIdData, navigate]);

  const handleClick = useCallback(() => {
    if (!joinedSubjectId) return;
    setTriggerId(joinedSubjectId);
  }, [joinedSubjectId]);

  return {
    onSubjectCodeClick: handleClick,
    isLoading,
  };
};
