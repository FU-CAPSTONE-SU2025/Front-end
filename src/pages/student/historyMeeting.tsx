import StudentHistoryCalendar from '../../components/student/studentHistoryCalendar';
import { useStudentHistoryMeetings } from '../../hooks/useStudentHistoryMeetings';

const HistoryMeeting = () => {
  const { data, isLoading } = useStudentHistoryMeetings(1, 50);
  const meetings = data?.items || [];
  console.log(meetings)
  return (
    <div className="min-h-screen flex flex-col items-center justify-start mt-12 py-10 px-2 sm:px-8">
      <StudentHistoryCalendar meetings={meetings} loading={isLoading} />
    </div>
  );
};

export default HistoryMeeting;
