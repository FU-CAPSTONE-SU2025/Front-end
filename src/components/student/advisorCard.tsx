import { Card, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface AdvisorCardProps {
  name: string;
  match: number;
  role: string;
  location: string;
  avatarUrl?: string;
}

const AdvisorCard: React.FC<AdvisorCardProps> = ({
  name,
  match,
  role,
  location,
  avatarUrl,
}) => {
  return (
    <Card
      className="rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between w-full max-w-sm"
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-gray-900">{name}</div>
          <Tag color="green" className="mt-2 text-base bg-green-50 text-green-600 border-none rounded-xl px-3 py-1">
            {match}% Match
          </Tag>
        </div>
        <Avatar
          size={48}
          src={avatarUrl}
          icon={!avatarUrl && <UserOutlined />}
          className="bg-green-100"
        />
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <div className="flex justify-between text-gray-400 text-base">
          <span>Role</span>
          <span className="text-gray-700">{role}</span>
        </div>
        <div className="flex justify-between text-gray-400 text-base">
          <span>Location</span>
          <span className="text-gray-700">{location}</span>
        </div>
      </div>
    </Card>
  );
};

export default AdvisorCard;
