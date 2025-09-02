import { useCallback, useState } from 'react';
import { DeleteJoinedSubject } from '../api/SchoolAPI/joinedSubjectAPI';

export const useJoinedSubjectActions = () => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJoinedSubject = useCallback(async (joinedSubjectId: number) => {
    setDeleting(true);
    setError(null);
    try {
      await DeleteJoinedSubject(joinedSubjectId);
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete joined subject');
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    deleteJoinedSubject,
    deleting,
    error,
  };
};
