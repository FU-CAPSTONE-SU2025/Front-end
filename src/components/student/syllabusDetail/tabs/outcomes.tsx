import React from 'react';
import { Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OutcomesProps {
  outcomes: any[];
}

const Outcomes: React.FC<OutcomesProps> = ({ outcomes }) => {
  if (!outcomes?.length) {
    return (
      <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
        <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
          <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
            <CheckCircleOutlined className="!text-white/60" />
            Learning Outcomes
          </Title>
        </div>
        <div className="!p-12 text-center">
          <CheckCircleOutlined className="text-4xl !text-white/40 mb-4" />
          <Text className="!text-white/60">No learning outcomes available</Text>
        </div>
      </div>
    );
  }
  
  return (
    <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
      <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
        <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
          <CheckCircleOutlined className="!text-white/60" />
          Learning Outcomes
        </Title>
      </div>
      <div className="!p-6">
        <div className="relative">
          {/* Vertical line connecting the outcomes */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 !bg-white/20"></div>
          
          <div className="space-y-4">
            {outcomes.map((lo: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 relative">
                {/* Outcome badge */}
                <div className="w-12 h-12 !bg-green-500/20 !border !border-green-500/30 rounded-full flex items-center justify-center flex-shrink-0 z-10 relative">
                  <div className="!text-green-300 font-bold text-sm text-center" style={{ 
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
                  <Text className="!text-white font-medium text-base leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                    {lo.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Outcomes; 