import React from 'react';
import { useStaffName } from '../../hooks/useStaffName';

interface StaffNameDisplayProps {
  staffId: number | null;
  fallbackName?: string;
  className?: string;
}

const StaffNameDisplay: React.FC<StaffNameDisplayProps> = ({ 
  staffId, 
  fallbackName = 'Unknown Staff',
  className = ''
}) => {
  const { staffName, loading } = useStaffName(staffId);

  if (loading) {
    return <span className={className}>Loading...</span>;
  }

  return (
    <span className={className}>
      {staffName || fallbackName}
    </span>
  );
};

export default StaffNameDisplay; 