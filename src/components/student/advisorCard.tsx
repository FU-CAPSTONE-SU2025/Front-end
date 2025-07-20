import { Avatar, Tag } from 'antd';
import { UserOutlined, EnvironmentOutlined, IdcardOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AdvisorData } from '../../api/student/StudentAPI';

interface AdvisorCardProps {
  advisor: AdvisorData;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const AdvisorCard = ({ advisor, isSelected, onClick, index }: AdvisorCardProps) => {
  const fullName = `${advisor.firstName} ${advisor.lastName}`;
  const campus = advisor.staffDataDetailResponse?.campus || 'Not specified';
  const position = advisor.staffDataDetailResponse?.position || 'Advisor';

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      whileHover={{ scale: 1.01, x: 3 }}
      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
        isSelected 
          ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
          : 'border-transparent hover:bg-white hover:border-gray-200 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar 
          size={50} 
          src={advisor.avatarUrl} 
          icon={<UserOutlined />} 
          className="bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg"
        />
        {isSelected && (
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-800 text-lg mb-1 truncate">
          {fullName}
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <IdcardOutlined className="text-blue-500 text-xs" />
          <span className="text-gray-600 text-xs font-medium truncate">
            {position}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-green-500 text-xs" />
          <span className="text-blue-600 text-xs font-medium truncate">
            {campus}
          </span>
        </div>
        
        {advisor.staffDataDetailResponse?.department && (
          <div className="mt-2">
            <Tag color="blue" className="text-xs">
              {advisor.staffDataDetailResponse.department}
            </Tag>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdvisorCard; 