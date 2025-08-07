import React from 'react';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';

// This is an example of how to wrap existing components with error handling
// You can apply this pattern to your existing Staff pages

const ErrorHandledSubjectPage: React.FC = () => {
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { getAllSubjects, addMultipleSubjectsMutation } = useCRUDSubject();

  // Example of how to handle API calls with the new error system
  const handleLoadSubjects = async () => {
    try {
      await getAllSubjects({ pageNumber: 1, pageSize: 10 });
      handleSuccess('Subjects loaded successfully');
    } catch (error) {
      handleError(error, 'Failed to load subjects');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    try {
      await addMultipleSubjectsMutation.mutateAsync(data);
      handleSuccess('Subjects imported successfully');
    } catch (error) {
      handleError(error, 'Import failed');
    }
  };

  return (
    <div>
      <h2>Error-Handled Subject Page Example</h2>
      <p>This demonstrates how to integrate the new error handling system.</p>
      <button onClick={handleLoadSubjects}>Load Subjects</button>
      <button onClick={() => handleBulkImport([])}>Import Subjects</button>
    </div>
  );
};

export default ErrorHandledSubjectPage; 