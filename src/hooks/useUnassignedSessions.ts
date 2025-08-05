import { useState, useEffect } from 'react';
import { getUnassignedSessions } from '../api/student/StudentAPI';
import { AdvisorSession } from './useAdvisorChat';

export const useUnassignedSessions = () => {
  const [unassignedSessions, setUnassignedSessions] = useState<AdvisorSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnassignedSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching unassigned sessions...');
      const data = await getUnassignedSessions();
      console.log('Unassigned sessions response:', data);
      
      if (data && Array.isArray(data)) {
        setUnassignedSessions(data);
      } else if (data && data.items) {
        setUnassignedSessions(data.items);
      } else {
        setUnassignedSessions([]);
      }
    } catch (err) {
      console.error('Failed to fetch unassigned sessions:', err);
      setError('Failed to load unassigned sessions');
      setUnassignedSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassignedSessions();
  }, []);

  return {
    unassignedSessions,
    loading,
    error,
    refetch: fetchUnassignedSessions
  };
}; 