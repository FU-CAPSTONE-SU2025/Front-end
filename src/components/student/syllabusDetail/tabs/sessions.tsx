import React from 'react';
import { Timeline, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SessionsProps {
  sessions: any[];
}

const Sessions: React.FC<SessionsProps> = ({ sessions }) => {
  if (!sessions?.length) {
    return (
      <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
        <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
          <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
            <ClockCircleOutlined className="!text-white/60" />
            Sessions
          </Title>
        </div>
        <div className="!p-12 text-center">
          <ClockCircleOutlined className="text-4xl !text-white/40 mb-4" />
          <Text className="!text-white/60">No sessions available</Text>
        </div>
      </div>
    );
  }
  
  return (
    <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
      <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
        <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
          <ClockCircleOutlined className="!text-white/60" />
          Sessions
        </Title>
      </div>
      <div className="!p-6">
        <Timeline mode="left" className="!minimal-timeline">
          {sessions.map((s: any, idx: number) => (
            <Timeline.Item 
              key={idx} 
              dot={
                <div className="w-5 h-5 !bg-blue-500/20 !border !border-blue-500/30 rounded-full flex items-center justify-center">
                  <Text className="!text-blue-300 font-bold text-xs">{s.sessionNumber}</Text>
                </div>
              }
            >
              <div className="mb-3">
                <Title level={5} className="!text-white mb-2">
                  Session {s.sessionNumber}: {s.topic}
                </Title>
                <Text className="!text-white/70 block mb-2">{s.mission}</Text>
                {s.learningOutcomeCodes?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.learningOutcomeCodes.map((code: string, i: number) => (
                      <Tag key={i} color="green" className="!text-xs !bg-green-500/20 !border-green-500/30 !text-green-300">
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
  );
};

export default Sessions; 