import { useState, useEffect } from 'react';
import { GetCurrentStaffUser } from '../api/Account/UserAPI';
import { AccountProps } from '../interfaces/IAccount';

export const useStaffName = (staffId: number | null) => {
  const [staffName, setStaffName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffName = async () => {
      if (!staffId || staffId === 0) {
        setStaffName('Unassigned Advisor');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const staffData: AccountProps | null = await GetCurrentStaffUser(staffId);
        if (staffData) {
          // Combine firstName and lastName if available, otherwise use fullName
          const name = staffData.firstName && staffData.lastName 
            ? `${staffData.firstName} ${staffData.lastName}`
            : staffData.fullName || staffData.email || 'Unknown Staff';
          setStaffName(name);
        } else {
          setStaffName('Unknown Staff');
        }
      } catch (err) {
        console.error('Failed to fetch staff name:', err);
        setError('Failed to load staff name');
        setStaffName('Unknown Staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffName();
  }, [staffId]);

  return { staffName, loading, error };
}; 