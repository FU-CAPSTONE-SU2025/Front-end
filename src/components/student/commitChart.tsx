import { motion } from 'framer-motion';
import { Button } from 'antd';

// Fake GitHub-style commit chart data
const days = Array.from({ length: 52 * 7 }, (_, i) => i);
const getRandom = () => Math.floor(Math.random() * 5);
const commitData = days.map(() => getRandom());

interface CommitChartProps {
  isConnected?: boolean;
  onConnect?: () => void;
}

const CommitChart: React.FC<CommitChartProps> = ({ 
  isConnected = false, 
  onConnect 
}) => {
  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    }
  };

  if (!isConnected) {
    return (
      <div className="overflow-x-auto p-8 bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect GitHub</h3>
            <p className="text-gray-300 text-sm mb-6">
              Connect your GitHub account to see your coding activity and track your progress
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Button
              type="primary"
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 h-12 text-base font-medium"
              size="large"
              icon={
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              }
            >
              Sign in with GitHub
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-400">
            <p>This will help track your coding activity and learning progress</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-6 bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">GitHub Activity</h3>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>Connected to GitHub</span>
        </div>
      </div>
      
      <div className="grid grid-cols-52 grid-rows-7 gap-1.5">
        {commitData.map((level, idx) => (
          <motion.div
            key={idx}
            className={`w-4 h-4 rounded-sm transition-colors duration-300 ${
              level === 0
                ? 'bg-white/10'
                : level === 1
                ? 'bg-green-400/60'
                : level === 2
                ? 'bg-green-500/70'
                : level === 3
                ? 'bg-green-600/80'
                : 'bg-green-700/90'
            }`}
            whileHover={{ scale: 1.2, zIndex: 10 }}
            title={`Commits: ${level}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs mt-4 text-gray-300 font-medium">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
    </div>
  );
};

export default CommitChart; 