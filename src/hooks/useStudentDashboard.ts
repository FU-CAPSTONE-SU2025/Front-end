import { useState, useEffect, useCallback } from 'react';
import { GetStudentSubjectDashboard, GetStudentPerformanceDashboard } from '../api/SchoolAPI/studentDashboardAPI';
import { IStudentSubjectActivityOverview, IStudentPerformanceOverview } from '../interfaces/IDashboard';
import {
  getStudentSemesterPerformance,
  getStudentCategoryPerformance,
  getStudentCheckpointTimeline,
} from '../api/student/StudentAPI';
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


// Local interfaces to avoid cross-imports
interface StudentSemesterPerformance {
  semesterId: number;
  semesterName: string;
  subjectsAttempted: number;
  subjectsPassed: number;
  creditsAttempted: number;
  creditsEarned: number;
  averageFinalScore: number;
}

interface StudentCategoryPerformance {
  category: string;
  averageScore: number;
  totalWeight: number;
}

interface StudentCheckpointTimelinePoint {
  year: number;
  month: number;
  total: number;
  completed: number;
  overdue: number;
  yearMonthLabel: string;
}

export const useStudentSemesterPerformance = (studentProfileId: number | null) => {
  const [data, setData] = useState<StudentSemesterPerformance[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  console.log('useStudentSemesterPerformance hook initialized with studentProfileId:', studentProfileId);

  useEffect(() => {
    console.log('useStudentSemesterPerformance useEffect triggered with studentProfileId:', studentProfileId);
    if (!studentProfileId) {
      console.log('No studentProfileId, skipping API call');
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    console.log('Calling getStudentSemesterPerformance API...');
    getStudentSemesterPerformance(studentProfileId)
      .then((res) => {
        console.log('API response for semester performance:', res);
        if (!cancelled) setData(res || []);
      })
      .catch((e) => {
        console.error('API error for semester performance:', e);
        if (!cancelled) setError(e as Error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentProfileId]);

  console.log('useStudentSemesterPerformance returning:', { data, isLoading, error });
  return { data, isLoading, error } as const;
};

export const useStudentCategoryPerformance = (studentProfileId: number | null) => {
  const [data, setData] = useState<StudentCategoryPerformance[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentProfileId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getStudentCategoryPerformance(studentProfileId)
      .then((res) => {
        if (!cancelled) setData(res || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e as Error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentProfileId]);

  return { data, isLoading, error } as const;
};

export const useStudentCheckpointTimeline = (studentProfileId: number | null) => {
  const [data, setData] = useState<StudentCheckpointTimelinePoint[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentProfileId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getStudentCheckpointTimeline(studentProfileId)
      .then((res) => {
        if (!cancelled) setData(res || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e as Error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentProfileId]);

  return { data, isLoading, error } as const;
};