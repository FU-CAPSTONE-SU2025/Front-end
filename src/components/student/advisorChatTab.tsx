import React, { useState, useEffect } from 'react';
import { Avatar, Input, Button, Spin, Empty } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { ChatSession, useAdvisorChatHub } from '../../hooks/useAdvisorChatHub';
import AdvisorChatBox from './advisorChatBox';

interface AdvisorChatTabProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  handleUserClick: (user: any) => void;
}

const AdvisorChatTab: React.FC<AdvisorChatTabProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  handleUserClick 
}) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showAvailableAdvisors, setShowAvailableAdvisors] = useState(false);

  // Use SignalR hook directly
  const {
    sessions,
    availableAdvisors,
    loading,
    isConnected,
    error,
    listSessions,
    getAvailableAdvisors,
  } = useAdvisorChatHub();



  // Load sessions when component mounts or connection changes
  useEffect(() => {
    if (isConnected) {
      listSessions();
    }
  }, [isConnected, listSessions]);

  // Filter sessions based on search term
  const filteredSessions = (sessions || []).filter((session: ChatSession) =>
    session.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique advisors from sessions
  const uniqueAdvisors = filteredSessions.reduce((acc: any[], session: ChatSession) => {
    const existingAdvisor = acc.find(advisor => advisor.id === session.staffId);
    if (!existingAdvisor) {
      acc.push({
        id: session.staffId,
        name: session.staffName,
        avatarUrl: '/img/Logo.svg', // Default avatar
        isOnline: session.isActive,
        lastSeen: session.lastMessageTime || 'Offline',
        role: 'Advisor',
        email: `${session.staffName.toLowerCase().replace(/\s+/g, '.')}@aisea.edu.vn`,
        sessions: [session]
      });
    } else {
      existingAdvisor.sessions.push(session);
    }
    return acc;
  }, []);

  // Create available advisors from sessions if no advisor list is available
  const availableAdvisorsFromSessions = sessions.reduce((acc: any[], session: ChatSession) => {
    const existingAdvisor = acc.find(advisor => advisor.id === session.staffId);
    if (!existingAdvisor) {
      acc.push({
        id: session.staffId,
        firstName: session.staffName.split(' ')[0] || session.staffName,
        lastName: session.staffName.split(' ').slice(1).join(' ') || '',
        email: `${session.staffName.toLowerCase().replace(/\s+/g, '.')}@aisea.edu.vn`,
        specialization: 'Academic Advisor',
        yearsOfExperience: '5+',
        department: 'Student Services'
      });
    }
    return acc;
  }, []);

  // Use available advisors from hub if available, otherwise use from sessions
  const effectiveAdvisors = (availableAdvisors && availableAdvisors.length > 0) 
    ? availableAdvisors 
    : availableAdvisorsFromSessions;

  // Filter available advisors based on search term
  const filteredAvailableAdvisors = effectiveAdvisors.filter((advisor: any) => {
    const fullName = `${advisor.firstName || ''} ${advisor.lastName || ''}`.toLowerCase();
    const email = (advisor.email || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });



  const handleUserSelect = (advisor: any) => {
    setSelectedUser(advisor);
    setShowChatBox(true);
    handleUserClick(advisor);
  };

  const handleCloseChatBox = () => {
    setShowChatBox(false);
    setSelectedUser(null);
  };

  const handleStartNewChat = (advisor: any) => {
    const advisorData = {
      id: advisor.id,
      name: `${advisor.firstName} ${advisor.lastName}`,
      avatarUrl: '/img/Logo.svg',
      isOnline: true,
      lastSeen: 'Available',
      role: 'Advisor',
      email: advisor.email,
      specialization: advisor.specialization,
      yearsOfExperience: advisor.yearsOfExperience,
      department: advisor.department
    };
    setSelectedUser(advisorData);
    setShowChatBox(true);
    setShowAvailableAdvisors(false);
    handleUserClick(advisorData);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Search Bar and Actions */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Search advisors..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-full"
            />
            <Button
              type="primary"
              onClick={() => {
                const newValue = !showAvailableAdvisors;
                if (newValue) {
                  getAvailableAdvisors();
                }
                setShowAvailableAdvisors(newValue);
              }}
              icon={<UserOutlined />}
            >
              {showAvailableAdvisors ? 'My Chats' : 'Find Advisors'}
            </Button>
            <Button
              onClick={() => {
                listSessions();
              }}
              icon={<ReloadOutlined />}
            />
            {showAvailableAdvisors && (
              <Button
                onClick={() => {
                  getAvailableAdvisors();
                }}
                size="small"
                loading={loading}
              >
                Load Advisors
              </Button>
            )}
          </div>
        </div>
        
        {/* Connection Status */}
        {!isConnected && (
          <div className="p-3 bg-yellow-50 border-b border-yellow-200">
            <div className="text-sm text-yellow-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                Connecting to chat server...
              </div>
            </div>
          </div>
        )}
        
        {/* Error Status */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="text-sm text-red-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Connection error: {error}
              </div>
            </div>
          </div>
        )}
        
        {/* Advisors List */}
        <div className="flex-1 overflow-y-auto">
          {showAvailableAdvisors ? (
            // Available Advisors List
            <>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Spin size="large" />
                </div>
              ) : (
                <AnimatePresence>
                  {filteredAvailableAdvisors.map((advisor) => (
                    <motion.div
                      key={advisor.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => handleStartNewChat(advisor)}
                    >
                      <div className="relative">
                        <Avatar src="/img/Logo.svg" size={40} />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">
                            {advisor.firstName} {advisor.lastName}
                          </span>
                          <span className="text-xs text-green-500">Available</span>
                        </div>
                        <div className="text-sm text-gray-600">Advisor</div>
                        <div className="text-xs text-gray-500">{advisor.email}</div>
                        {advisor.specialization && (
                          <div className="text-xs text-blue-500 mt-1">
                            {advisor.specialization}
                            {advisor.yearsOfExperience && ` • ${advisor.yearsOfExperience} years exp.`}
                          </div>
                        )}
                        {advisor.department && (
                          <div className="text-xs text-gray-500 mt-1">
                            {advisor.department}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {!loading && filteredAvailableAdvisors.length === 0 && (
                <Empty
                  description={
                    <span className="text-gray-500">
                      {searchTerm ? 'No advisors found matching your search' : 'No advisors available at the moment'}
                    </span>
                  }
                  className="py-8"
                />
              )}
              
              {!loading && filteredAvailableAdvisors.length > 0 && availableAdvisorsFromSessions.length > 0 && availableAdvisors.length === 0 && (
                <div className="p-3 bg-blue-50 border-t border-blue-200">
                  <div className="text-xs text-blue-600 text-center">
                    Showing advisors from your chat sessions
                  </div>
                </div>
              )}
            </>
          ) : (
            // Existing Chat Sessions
            <>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Spin size="large" />
                </div>
              ) : (
                <AnimatePresence>
                  {uniqueAdvisors.map((advisor) => (
                    <motion.div
                      key={advisor.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer`}
                      onClick={() => handleUserSelect(advisor)}
                    >
                      <div className="relative">
                        <Avatar src={advisor.avatarUrl} size={40} />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          advisor.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">{advisor.name}</span>
                          <span className={`text-xs ml-2 ${
                            advisor.isOnline ? 'text-green-500' : 'text-gray-500'
                          }`}>
                            {advisor.isOnline ? 'Online' : advisor.lastSeen}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{advisor.role}</div>
                        <div className="text-xs text-gray-500">{advisor.email}</div>
                        {advisor.sessions.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-blue-500">
                              {advisor.sessions.length} session{advisor.sessions.length > 1 ? 's' : ''}
                            </div>
                            {advisor.sessions[0].type && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                advisor.sessions[0].type === 'HUMAN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {advisor.sessions[0].type}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {!loading && uniqueAdvisors.length === 0 && (
                <Empty
                  description={
                    <span className="text-gray-500">
                      {searchTerm ? 'No chat sessions found' : 'No chat sessions yet. Start a conversation with an advisor!'}
                    </span>
                  }
                  className="py-8"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Box */}
      {showChatBox && selectedUser && (
        <AdvisorChatBox 
          onClose={handleCloseChatBox}
          selectedUser={selectedUser}
        />
      )}
    </>
  );
};

export default AdvisorChatTab; 