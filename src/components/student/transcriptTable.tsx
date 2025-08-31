import React from 'react';
import { IPersonalAcademicTranscript } from '../../interfaces/ISubjectMarkReport';

interface TranscriptTableProps {
  data: IPersonalAcademicTranscript[];
  isLoading: boolean;
}

const TranscriptTable: React.FC<TranscriptTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-4 text-gray-200/80">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-gray-200/70">No transcript data available</div>;
  }

  const getStatusInfo = (isPassed: boolean) => {
    if (isPassed) {
      return { color: 'bg-green-500', text: 'Passed' };
    } else {
      return { color: 'bg-orange-500', text: 'In Progress' };
    }
  };

  const formatScore = (score: number) => {
    if (score === 0) return 'N/A';
    return score.toFixed(2);
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-12 text-gray-200/90 text-xs sm:text-sm px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="col-span-3 sm:col-span-2">Code</div>
          <div className="col-span-6 sm:col-span-5">Name</div>
          <div className="hidden sm:block sm:col-span-2 text-center">Version</div>
          <div className="col-span-3 sm:col-span-1 text-center">Credits</div>
          <div className="col-span-3 sm:col-span-1 text-center">Score</div>
          <div className="col-span-3 sm:col-span-1 text-center">Status</div>
        </div>
        <div className="divide-y divide-white/10">
          {data.map((subject, idx) => {
            const statusInfo = getStatusInfo(subject.isPassed);
            return (
              <div key={idx} className="grid grid-cols-12 items-center px-4 py-3 text-white/90">
                <div className="col-span-3 sm:col-span-2 font-medium truncate" title={subject.subjectCode}>
                  {subject.subjectCode}
                </div>
                <div className="col-span-6 sm:col-span-5 pr-2 truncate" title={subject.name}>
                  {subject.name}
                </div>
                <div className="hidden sm:block sm:col-span-2 text-center text-gray-200/70">
                  {subject.subjectVersionCode}
                </div>
                <div className="col-span-3 sm:col-span-1 text-center">
                  {subject.credits}
                </div>
                <div className="col-span-3 sm:col-span-1 text-center font-medium">
                  <span className={subject.avgScore > 0 ? 'text-green-400' : 'text-gray-400'}>
                    {formatScore(subject.avgScore)}
                  </span>
                </div>
                <div className="col-span-3 sm:col-span-1 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} text-white`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TranscriptTable;
