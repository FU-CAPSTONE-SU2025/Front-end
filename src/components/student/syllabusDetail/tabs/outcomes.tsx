import React from 'react';
import { Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface OutcomesProps {
  outcomes: any[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Outcomes: React.FC<OutcomesProps> = ({ outcomes }) => {
  if (!outcomes?.length) {
    return (
      <div className="text-center py-12">
        <CheckCircleOutlined className="text-4xl text-gray-300 mb-4" />
        <Text className="text-gray-500">No learning outcomes available</Text>
      </div>
    );
  }
  
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <Title level={5} className="text-gray-900 mb-0 flex items-center gap-2">
            <CheckCircleOutlined className="text-gray-600" />
            Learning Outcomes
          </Title>
        </div>
        <div className="p-6">
          <div className="relative">
            {/* Vertical line connecting the outcomes */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-200"></div>
            
            <div className="space-y-4">
              {outcomes.map((lo: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  {/* Outcome badge */}
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 z-10 relative">
                    <div className="text-white font-bold text-sm text-center" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      lineHeight: '1',
                      transform: 'translateY(0px)'
                    }}>
                      {lo.outcomeCode}
                    </div>
                  </div>
                  
                  {/* Outcome content */}
                  <div className="flex-1 pt-1">
                    <Text className="text-gray-900 font-medium text-base leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                      {lo.description}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Outcomes; 