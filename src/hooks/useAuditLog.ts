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

  // Normalize helper
  const normalizeLogs = (logs: any[]): AuditLog[] =>
    logs.map((log: any) => ({
      id: log.id ?? 0,
      tag: log.tag ?? 'Unknown',
      description: log.description ?? '',
      createdAt: log.createdAt ?? new Date().toISOString(),
    }));

  // Fallback: fetch all pages from paginated endpoint
  const fetchAllPages = async (): Promise<AuditLog[]> => {
    const collected: AuditLog[] = [];
    let page = 1;
    const size = 100; 
    // First page to get total
    const firstPage: PagedData<AuditLog> = await GetAuditLogPaged(page, size);
    collected.push(...normalizeLogs(firstPage.items));
    const totalCount = firstPage.totalCount ?? collected.length;
    const totalPages = Math.ceil(totalCount / size);

    // Fetch remaining pages if any
    for (page = 2; page <= totalPages; page++) {
      const res: PagedData<AuditLog> = await GetAuditLogPaged(page, size);
      collected.push(...normalizeLogs(res.items));
    }
    return collected;
  };

  // Download all audit logs
  const downloadAllAuditLogs = async () => {
    showForExport('Downloading audit logs...');
    try {
      const allLogsResult = await GetAllAuditLog();
      // If API already returns an array of logs, normalize and return
      if (Array.isArray(allLogsResult) && allLogsResult.length > 0) {
        hideLoading();
        return normalizeLogs(allLogsResult);
      }

      // Otherwise, handle object-of-arrays shape and flatten
      if (allLogsResult && typeof allLogsResult === 'object') {
        const flattened: AuditLog[] = [];
        Object.keys(allLogsResult).forEach((logType: any) => {
          const logArray = (allLogsResult as any)[logType];
          if (Array.isArray(logArray)) {
            flattened.push(
              ...normalizeLogs(
                logArray.map((log: any) => ({ ...log, tag: log.tag ?? logType }))
              )
            );
          }
        });
        if (flattened.length > 0) {
          hideLoading();
          return flattened;
        }
      }

      // Fallback: if /all returned empty, fetch via paginated endpoint
      const pagedAll = await fetchAllPages();
      hideLoading();
      return pagedAll;
    } catch (err) {
      hideLoading();
      setError(err instanceof Error ? err.message : 'Failed to download audit logs');
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