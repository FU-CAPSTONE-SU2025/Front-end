import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AdvisorData } from '../../interfaces/IStudent';

interface SelectedAdvisorInfoProps {
  selectedAdvisor: AdvisorData | null;
}

const SelectedAdvisorInfo = ({ selectedAdvisor }: SelectedAdvisorInfoProps) => {
  if (!selectedAdvisor) return null;

  return (
    <motion.div 
      className="flex items-center gap-4 bg-blue-50 rounded-2xl px-6 py-4 border border-blue-200 mb-6"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Avatar size={48} src={selectedAdvisor.avatarUrl} icon={<UserOutlined />} />
      <div>
        <div className="font-bold text-gray-800 text-lg">
          {selectedAdvisor.firstName} {selectedAdvisor.lastName}
        </div>
        <div className="text-gray-600 text-sm">
          {selectedAdvisor.staffDataDetailResponse?.position || 'Advisor'}
        </div>
      </div>
    </motion.div>
  );
};

export default SelectedAdvisorInfo; 