import { useState, useEffect } from 'react';
import { GetAllAuditLog, GetAuditLogPaged } from '../api/admin/auditlogAPI';
import { AuditLog } from '../interfaces/IAuditLog';
import { PagedData } from '../interfaces/ISchoolProgram';
import { showForExport, hideLoading } from './useLoading';
import { debugLog } from '../utils/performanceOptimization';

export const useAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch paginated audit logs
  const fetchAuditLogs = async (page: number = 1, size: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response: PagedData<AuditLog> = await GetAuditLogPaged(page, size);
      setAuditLogs(response.items);
      setTotal(response.totalCount);
      setCurrentPage(response.pageNumber);
      setPageSize(response.pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      debugLog('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Download all audit logs
  const downloadAllAuditLogs = async () => {
    showForExport('Downloading audit logs...');
    try {
      const allLogsObject = await GetAllAuditLog();
      hideLoading();
      
      // Handle the object structure where each property contains an array of logs
      // Flatten all log arrays into a single array
      const flattenedLogs: AuditLog[] = [];
      
      if (allLogsObject && typeof allLogsObject === 'object') {
        Object.keys(allLogsObject).forEach((logType:any) => {
          const logArray = allLogsObject[logType];
          if (Array.isArray(logArray)) {
            // Add each log entry with the log type as a tag if not already present
            logArray.forEach((log: any) => {
              if (log && typeof log === 'object') {
                flattenedLogs.push({
                  id: log.id || 0,
                  tag: log.tag || logType,
                  description: log.description || `${logType} event`,
                  createdAt: log.createdAt || new Date().toISOString()
                });
              }
            });
          }
        });
      }
      
      return flattenedLogs;
    } catch (err) {
      hideLoading();
      setError(err instanceof Error ? err.message : 'Failed to download audit logs');
      debugLog('Error downloading audit logs:', err);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    auditLogs,
    loading,
    currentPage,
    pageSize,
    total,
    error,
    fetchAuditLogs,
    downloadAllAuditLogs,
  };
}; 