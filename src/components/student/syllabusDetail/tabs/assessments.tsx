import React from 'react';
import { Tag, Progress, Typography, Tooltip } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface AssessmentsProps {
  assessments: any[];
}

const Assessments: React.FC<AssessmentsProps> = ({ assessments }) => {
  if (!assessments?.length) {
    return (
      <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
        <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
          <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
            <FileTextOutlined className="!text-white/60" />
            Assessments
          </Title>
        </div>
        <div className="!p-12 text-center">
          <FileTextOutlined className="text-4xl !text-white/40 mb-4" />
          <Text className="!text-white/60">No assessments available</Text>
        </div>
      </div>
    );
  }
  
  return (
    <div className="!bg-white/10 !backdrop-blur-md !rounded-lg !border !border-white/20 !overflow-hidden !shadow-lg">
      <div className="!bg-white/5 !px-6 !py-4 !border-b !border-white/20">
        <Title level={5} className="!text-white !mb-0 !flex !items-center !gap-2">
          <FileTextOutlined className="!text-white/60" />
          Assessments
        </Title>
      </div>
      <div className="!p-6">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="!bg-white/10 !backdrop-blur-sm">
              <th className="!text-left !p-3 !text-white/80 !font-semibold !text-sm !border-b !border-white/20">
                Category
              </th>
              <th className="!text-left !p-3 !text-white/80 !font-semibold !text-sm !border-b !border-white/20">
                Weight
              </th>
              <th className="!text-left !p-3 !text-white/80 !font-semibold !text-sm !border-b !border-white/20">
                Qty
              </th>
              <th className="!text-left !p-3 !text-white/80 !font-semibold !text-sm !border-b !border-white/20">
                Duration
              </th>
              <th className="!text-left !p-3 !text-white/80 !font-semibold !text-sm !border-b !border-white/20">
                Type
              </th>
              <th className="!text-left !p-3 !text-white/80 !font-semibold !text-sm !border-b !border-white/20">
                Criteria
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {assessments.map((assessment: any, index: number) => (
              <tr
                key={index}
                className="!bg-white/5 !backdrop-blur-sm hover:!bg-white/10 !transition-colors !duration-200"
              >
                <td className="!p-3 !border-b !border-white/10">
                  <Tag color="blue" className="!text-xs !bg-blue-500/20 !border-blue-500/30 !text-blue-300">
                    {assessment.category}
                  </Tag>
                </td>
                <td className="!p-3 !border-b !border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-[80px]">
                      <Tooltip title={`${assessment.weight}%`} placement="top">
                        <Progress 
                          percent={assessment.weight} 
                          size="small" 
                          showInfo={false} 
                          strokeColor="#3b82f6"
                          trailColor="rgba(255,255,255,0.1)"
                        />
                      </Tooltip>
                    </div>
                    <span className="!text-white !text-sm font-semibold min-w-[35px] text-right">
                      {assessment.weight}%
                    </span>
                  </div>
                </td>
                <td className="!p-3 !border-b !border-white/10">
                  <span className="!text-white !text-sm">{assessment.quantity}</span>
                </td>
                <td className="!p-3 !border-b !border-white/10">
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="!text-white/60 !text-sm" />
                    <span className="!text-white !text-sm">{assessment.duration} min</span>
                  </div>
                </td>
                <td className="!p-3 !border-b !border-white/10">
                  <span className="!text-white !text-sm">{assessment.questionType}</span>
                </td>
                <td className="!p-3 !border-b !border-white/10">
                  {assessment.completionCriteria ? (
                    <Tooltip title={assessment.completionCriteria} placement="top">
                      <span className="!text-white/70 !text-xs cursor-help line-clamp-2">
                        {assessment.completionCriteria}
                      </span>
                    </Tooltip>
                  ) : (
                    <span className="!text-white/40 !text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assessments; 