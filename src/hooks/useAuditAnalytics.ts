import { useCallback, useEffect, useState } from 'react';
import { GetAnalyticsLog } from '../api/admin/auditlogAPI';
import { GetAnalyticsAuditLogProps } from '../interfaces/IAuditLog';

const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const useAuditAnalytics = (start?: Date, end?: Date) => {
  const [analytics, setAnalytics] = useState<GetAnalyticsAuditLogProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endDateObj = end ?? new Date();
      const startDateObj = start ?? new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
      const result = await GetAnalyticsLog(toISODate(startDateObj), toISODate(endDateObj));
      setAnalytics(result as unknown as GetAnalyticsAuditLogProps);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch audit analytics');
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
