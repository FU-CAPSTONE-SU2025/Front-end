
import { useMutation } from '@tanstack/react-query';
import { pagedStaffData } from '../interfaces/IStaff';
import { FetchStaffList } from '../api/staff/StaffAPI';



export default function useCRUDStaff() {

   const getStaffMutation = useMutation<pagedStaffData|null, unknown, void>({
    mutationFn: async () => {
      const data = await FetchStaffList();
      // If API returns a single staff, wrap in array
      if (!data) return null;
      return data;
    },
    onError: (error) => {
      // Handle error if needed
       console.error(error);
    },
  });
  const metaData = getStaffMutation.data? getStaffMutation.data : null
  const staffList = metaData?.items ?? []
  return {
    ...getStaffMutation,
    getAllStaff : getStaffMutation.mutate,
    staffList
  }
}

