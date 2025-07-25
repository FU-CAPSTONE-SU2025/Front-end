import React from 'react';
import { Modal, Spin, Tag, Divider } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, MailOutlined, CheckCircleTwoTone, CloseCircleTwoTone, InfoCircleTwoTone, MessageTwoTone } from '@ant-design/icons';
import dayjs from 'dayjs';

interface MeetingDetailModalProps {
  open: boolean;
  onClose: () => void;
  detail: any;
  loading: boolean;
}

const statusMap: Record<number, { color: string; text: string; icon: React.ReactNode }> = {
  1: { color: 'blue', text: 'Upcoming', icon: <InfoCircleTwoTone twoToneColor="#1890ff" /> },
  2: { color: 'green', text: 'Completed', icon: <CheckCircleTwoTone twoToneColor="#52c41a" /> },
  3: { color: 'red', text: 'Cancelled', icon: <CloseCircleTwoTone twoToneColor="#ff4d4f" /> },
  4: { color: 'orange', text: 'Advisor Absent', icon: <InfoCircleTwoTone twoToneColor="#faad14" /> },
};

const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ open, onClose, detail, loading }) => {
  const status = detail?.status;
  const statusInfo = statusMap[status] || { color: 'default', text: 'Unknown', icon: <InfoCircleTwoTone /> };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      className="rounded-2xl"
      title={null}
    >
      {loading || !detail ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <CalendarOutlined className="text-blue-500 text-2xl" />
            <div>
              <div className="text-gray-500 text-xs font-medium">Date</div>
              <div className="font-semibold text-lg">{dayjs(detail.startDateTime).format('dddd, MMMM D, YYYY')}</div>
            </div>
            <span className="ml-auto flex items-center gap-2">
              {statusInfo.icon}
              <Tag color={statusInfo.color} className="font-semibold text-xs px-3 py-1 rounded-full">{statusInfo.text}</Tag>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ClockCircleOutlined className="text-green-500 text-xl" />
            <div>
              <div className="text-gray-500 text-xs font-medium">Time</div>
              <div className="font-semibold text-base">{dayjs(detail.startDateTime).format('HH:mm')} - {dayjs(detail.endDateTime).format('HH:mm')}</div>
            </div>
          </div>
          <Divider className="my-2" />
          {/* Advisor Info */}
          <div className="flex items-center gap-4">
            <UserOutlined className="text-purple-500 text-xl" />
            <div>
              <div className="text-gray-500 text-xs font-medium">Advisor</div>
              <div className="font-semibold text-base">{detail.staffFirstName} {detail.staffLastName}</div>
              <div className="text-gray-500 text-xs flex items-center gap-1"><MailOutlined /> {detail.staffEmail}</div>
            </div>
          </div>
          <Divider className="my-2" />
          {/* Issue Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-gray-500 text-xs font-medium mb-1">Issue Title</div>
            <div className="font-semibold text-base mb-2 text-blue-900">{detail.titleStudentIssue}</div>
            <div className="text-gray-500 text-xs font-medium mb-1">Issue Description</div>
            <div className="text-base text-gray-800">{detail.contentIssue}</div>
          </div>
          {/* Feedback, Suggestion, Note */}
          {detail.feedback && (
            <div className="bg-blue-50 rounded-xl p-4 flex gap-2 items-start mt-2">
              <MessageTwoTone twoToneColor="#1890ff" className="text-lg mt-1" />
              <div>
                <div className="text-xs font-medium text-blue-700 mb-1">Feedback from Advisor</div>
                <div className="text-base">{detail.feedback}</div>
              </div>
            </div>
          )}
          {detail.suggestionFromAdvisor && (
            <div className="bg-purple-50 rounded-xl p-4 flex gap-2 items-start mt-2">
              <InfoCircleTwoTone twoToneColor="#722ed1" className="text-lg mt-1" />
              <div>
                <div className="text-xs font-medium text-purple-700 mb-1">Suggestion from Advisor</div>
                <div className="text-base">{detail.suggestionFromAdvisor}</div>
              </div>
            </div>
          )}
          {detail.note && (
            <div className="bg-orange-50 rounded-xl p-4 flex gap-2 items-start mt-2">
              <InfoCircleTwoTone twoToneColor="#faad14" className="text-lg mt-1" />
              <div>
                <div className="text-xs font-medium text-orange-700 mb-1">Note</div>
                <div className="text-base">{detail.note}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default MeetingDetailModal; 