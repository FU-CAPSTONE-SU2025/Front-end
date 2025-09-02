import { useState, useEffect, useCallback } from 'react';
import { GetStudentSubjectDashboard, GetStudentPerformanceDashboard } from '../api/SchoolAPI/studentDashboardAPI';
import { IStudentSubjectActivityOverview, IStudentPerformanceOverview } from '../interfaces/IDashboard';

export const useStudentDashboard = (studentProfileId: number | null) => {
  const [subjectData, setSubjectData] = useState<IStudentSubjectActivityOverview[] | null>(null);
  const [performanceData, setPerformanceData] = useState<IStudentPerformanceOverview[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!studentProfileId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [subjectResult, performanceResult] = await Promise.all([
        GetStudentSubjectDashboard(studentProfileId),
        GetStudentPerformanceDashboard(studentProfileId)
      ]);
      
      setSubjectData(subjectResult);
      setPerformanceData(performanceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student dashboard data');
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [studentProfileId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    subjectData,
    performanceData,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
