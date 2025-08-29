import React from 'react';

interface NoDataCardProps {
  title?: string;
  description?: string;
  stats?: Array<{ label: string; value: number; accent?: 'green' | 'blue' | 'yellow' | 'white' }>;
}

const NoDataCard: React.FC<NoDataCardProps> = ({
  title = 'No Subjects Found',
  description = `You haven't enrolled in any subjects yet. Please contact your academic advisor to register for courses.`,
  stats = [
    { label: 'Total Subjects', value: 0, accent: 'white' },
    { label: 'Completed', value: 0, accent: 'green' },
    { label: 'Passed', value: 0, accent: 'blue' },
    { label: 'Total Credits', value: 0, accent: 'yellow' },
  ],
}) => {
  const accentClass = (accent?: 'green' | 'blue' | 'yellow' | 'white') => {
    switch (accent) {
      case 'green':
        return 'text-green-400';
      case 'blue':
        return 'text-blue-400';
      case 'yellow':
        return 'text-yellow-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-12">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{title}</h2>
          <p className="text-gray-200 opacity-80 text-lg mb-6 max-w-md mx-auto">{description}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${accentClass(s.accent)}`}>{s.value}</div>
              <div className="text-gray-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoDataCard;
