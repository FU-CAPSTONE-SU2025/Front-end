import React from 'react';
import { Timeline, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface SessionsProps {
  sessions: any[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Sessions: React.FC<SessionsProps> = ({ sessions }) => {
  if (!sessions?.length) {
    return (
      <div className="text-center py-12">
        <ClockCircleOutlined className="text-4xl text-gray-300 mb-4" />
        <Text className="text-gray-500">No sessions available</Text>
      </div>
    );
  }
  
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <Title level={5} className="text-gray-900 mb-0 flex items-center gap-2">
            <ClockCircleOutlined className="text-gray-600" />
            Sessions
          </Title>
        </div>
        <div className="p-6">
          <Timeline mode="left" className="minimal-timeline">
            {sessions.map((s: any, idx: number) => (
              <Timeline.Item 
                key={idx} 
                dot={
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Text className="text-white font-bold text-xs">{s.sessionNumber}</Text>
                  </div>
                }
              >
                <div className="mb-3">
                  <Title level={5} className="text-gray-900 mb-2">
                    Session {s.sessionNumber}: {s.topic}
                  </Title>
                  <Text className="text-gray-600 block mb-2">{s.mission}</Text>
                  {s.learningOutcomeCodes?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.learningOutcomeCodes.map((code: string, i: number) => (
                        <Tag key={i} color="green" className="text-xs">
                          {code}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </div>
    </motion.div>
  );
};

export default Sessions; 