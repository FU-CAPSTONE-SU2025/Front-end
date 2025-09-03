import React from 'react';
import { Card, Avatar } from 'antd';
import { 
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useCurrentAdvisor } from '../../hooks/useCurrentAdvisor';

const AdvisorDashboard: React.FC = () => {
  const advisor = useCurrentAdvisor();



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex items-center justify-center mb-8">
              <Avatar
                src="https://i.pravatar.cc/150?img=5"
                size={120}
                className="ring-4 ring-white ring-opacity-30 shadow-2xl"
                icon={<UserOutlined />}
              />
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">
                {(() => {
                  const fullName = [advisor.firstName, advisor.lastName].filter(Boolean).join(' ');
                  if (fullName) return fullName;
                  if (advisor.username) return advisor.username;
                  return 'Advisor Profile';
                })()}
              </h1>
              
              <p className="text-xl text-blue-100">Academic Advisor</p>
              
              {(advisor.roles || []).length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {advisor.roles.map((role, idx) => (
                    <span key={`${role}-${idx}`} className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <MailOutlined className="text-blue-500" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  {advisor.email && (
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <MailOutlined className="text-blue-600 text-lg" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-semibold text-gray-800">{advisor.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {advisor.username && (
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <UserOutlined className="text-purple-600 text-lg" />
                      <div>
                        <p className="text-sm text-gray-600">Username</p>
                        <p className="font-semibold text-gray-800">@{advisor.username}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* System Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <IdcardOutlined className="text-green-500" />
                  System Information
                </h3>
                
                <div className="space-y-4">
                  {advisor.userId && (
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <IdcardOutlined className="text-green-600 text-lg" />
                      <div>
                        <p className="text-sm text-gray-600">User ID</p>
                        <p className="font-semibold text-gray-800">{advisor.userId}</p>
                      </div>
                    </div>
                  )}
                  
          
                </div>
              </div>
            </div>
            

          
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdvisorDashboard; 