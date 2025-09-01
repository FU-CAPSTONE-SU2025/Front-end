import { useState, useEffect } from 'react';
import { 
  GetOverviewDashboard, 
  GetSubjectDashboard, 
  GetCurriculumDashboard 
} from '../api/SchoolAPI/flmDashboardAPI';
import { 
  IOverviewDashboard, 
  ISubjectOverView, 
  ICurriculumOverview 
} from '../interfaces/IDashboard';

export const useFlmDashboard = () => {
  const [overviewData, setOverviewData] = useState<IOverviewDashboard | null>(null);
  const [subjectData, setSubjectData] = useState<ISubjectOverView | null>(null);
  const [curriculumData, setCurriculumData] = useState<ICurriculumOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [overview, subject, curriculum] = await Promise.all([
        GetOverviewDashboard(),
        GetSubjectDashboard(),
        GetCurriculumDashboard()
      ]);
      
      setOverviewData(overview);
      setSubjectData(subject);
      setCurriculumData(curriculum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    overviewData,
    subjectData,
    curriculumData,
    loading,
    error,
    refreshData
  };
};
