import React from 'react';
import { motion } from 'framer-motion';
import { Spin } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined
} from '@ant-design/icons';
import { SubjectCheckpoint } from '../../interfaces/IStudent';
import { useUpcomingCheckpoints } from '../../hooks/useStudentFeature';

const UpcomingTodosTimeline: React.FC = () => {
  // Fetch upcoming checkpoints
  const { data: upcomingCheckpoints, isLoading, error } = useUpcomingCheckpoints();

  // Sort checkpoints by deadline (earliest first)
  const sortedCheckpoints = React.useMemo(() => {
    if (!upcomingCheckpoints) return [];
    return [...upcomingCheckpoints].sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  }, [upcomingCheckpoints]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (checkpoint: SubjectCheckpoint) => {
    if (checkpoint.isCompleted) return 'text-green-500';
    
    const daysUntil = getDaysUntilDeadline(checkpoint.deadline);
    if (daysUntil < 0) return 'text-red-500'; // Overdue
    if (daysUntil <= 3) return 'text-orange-500'; // Due soon
    return 'text-blue-500'; // Normal
  };

  const getStatusText = (checkpoint: SubjectCheckpoint) => {
    if (checkpoint.isCompleted) return 'Completed';
    
    const daysUntil = getDaysUntilDeadline(checkpoint.deadline);
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 3) return `Due in ${daysUntil} days`;
    return `Due in ${daysUntil} days`;
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Upcoming Todos</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16">
          {/* Loading icon container */}
          <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
          </div>
          
          {/* Loading text */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-white">
              Loading Upcoming Todos
            </h3>
            <p className="text-gray-300 text-base">
              Please wait while we fetch your upcoming tasks...
            </p>
          </div>
          
          {/* Loading dots */}
          <div className="mt-8 flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Upcoming Todos</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-red-400">
              Error Loading Todos
            </h3>
            <p className="text-gray-300 text-base">
              Failed to load upcoming todos. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!upcomingCheckpoints || upcomingCheckpoints.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Upcoming Todos</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16">
          {/* Empty state icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          
          {/* Text content */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-white">
              No Upcoming Todos
            </h3>
            <p className="text-gray-300 text-base max-w-md mx-auto leading-relaxed">
              You don't have any upcoming todos at the moment. All caught up!
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-8 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full opacity-60"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full opacity-40"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Upcoming Todos</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-400 mx-auto rounded-full"></div>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/20"></div>
        
        <div className="space-y-6">
          {sortedCheckpoints.map((checkpoint, index) => (
            <motion.div
              key={checkpoint.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start"
            >
              {/* Timeline dot */}
              <div className={`absolute left-4 top-2 w-4 h-4 rounded-full border-2 ${
                checkpoint.isCompleted 
                  ? 'bg-green-500 border-green-500' 
                  : getDaysUntilDeadline(checkpoint.deadline) < 0
                    ? 'bg-red-500 border-red-500'
                    : getDaysUntilDeadline(checkpoint.deadline) <= 3
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-blue-500 border-blue-500'
              }`}>
                {/* Green checkmark for completed checkpoints */}
                {checkpoint.isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircleOutlined className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              {/* Content card */}
              <div 
                className={`ml-12 flex-1 p-4 rounded-xl border transition-all duration-300 ${
                  checkpoint.isCompleted 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-white/5 border-white/20'
                }`}
              >
                {/* Completion ribbon for completed checkpoints */}
                {checkpoint.isCompleted && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                    <CheckCircleOutlined className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      checkpoint.isCompleted ? 'line-through text-gray-400' : 'text-white'
                    }`}>
                      {checkpoint.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CalendarOutlined className="w-4 h-4" />
                        <span>{formatDate(checkpoint.deadline)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      checkpoint.isCompleted 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : getDaysUntilDeadline(checkpoint.deadline) < 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : getDaysUntilDeadline(checkpoint.deadline) <= 3
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {checkpoint.isCompleted ? (
                        <CheckCircleOutlined className="w-3 h-3" />
                      ) : (
                        <ClockCircleOutlined className="w-3 h-3" />
                      )}
                      <span>{getStatusText(checkpoint)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-8 pt-4 border-t border-white/20">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">
            Total: {upcomingCheckpoints.length} upcoming todos
          </span>
          <span className="text-green-400">
            Completed: {upcomingCheckpoints.filter(c => c.isCompleted).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UpcomingTodosTimeline;
