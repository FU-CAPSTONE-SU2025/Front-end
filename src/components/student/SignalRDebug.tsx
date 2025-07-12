import React, { useState } from 'react';
import { Button, Card, Space, Typography, Alert, Input, message, Tabs } from 'antd';
import { useAdvisorChatHub } from '../../hooks/useAdvisorChatHub';
import { useAuths } from '../../hooks/useAuths';

const { Title, Text } = Typography;

const SignalRDebug: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const accessToken = useAuths((state) => state.accessToken);
  const {
    connectionState,
    error,
    sessions,
    availableAdvisors,
    loading,
    isConnected,
    listSessions,
    createHumanSession,
    getAvailableAdvisors,
  } = useAdvisorChatHub();

  const handleCreateSession = async () => {
    if (!newMessage.trim()) {
      message.error('Please enter a message');
      return;
    }

    const success = await createHumanSession(newMessage.trim());
    if (success) {
      setNewMessage('');
      message.success('Session created successfully');
    } else {
      message.error('Failed to create session');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Title level={3}>SignalR Debug - Advisor Chat</Title>
      
      <Card title="Connection Status" className="mb-4">
        <Space direction="vertical" className="w-full">
          <div>
            <Text strong>Status: </Text>
            <Text type={isConnected ? 'success' : 'danger'}>{connectionState}</Text>
          </div>
          <div>
            <Text strong>Token: </Text>
            <Text type={accessToken ? 'success' : 'danger'}>
              {accessToken ? 'Available' : 'Missing'}
            </Text>
          </div>
          <div>
            <Text strong>Sessions: </Text>
            <Text>{sessions.length}</Text>
          </div>
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
            />
          )}
        </Space>
      </Card>

      <Card title="Actions" className="mb-4">
        <Space direction="vertical" className="w-full">
          <Button 
            onClick={listSessions}
            disabled={!isConnected}
            loading={loading}
            type="primary"
            block
          >
            List Sessions
          </Button>
          
          <Button 
            onClick={() => getAvailableAdvisors()}
            loading={loading}
            block
          >
            Refresh Advisors
          </Button>
          
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Create New Session</div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onPressEnter={handleCreateSession}
              />
              <Button 
                onClick={handleCreateSession}
                disabled={!newMessage.trim() || loading}
                loading={loading}
                type="primary"
              >
                Create
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Check browser console for detailed logs
          </div>
        </Space>
      </Card>

      <Tabs
        items={[
          {
            key: 'sessions',
            label: 'Chat Sessions',
            children: (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No sessions available
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{session.title}</div>
                          <div className="text-sm text-gray-600">Staff: {session.staffName}</div>
                          <div className="text-sm text-gray-600">Student: {session.studentName}</div>
                          {session.lastMessage && (
                            <div className="text-xs text-gray-500 mt-1">
                              Last: {session.lastMessage}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            session.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {session.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {session.type && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              session.type === 'HUMAN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {session.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          },
          {
            key: 'advisors',
            label: 'Available Advisors',
            children: (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-center text-gray-500 py-4">
                    Loading advisors...
                  </div>
                ) : availableAdvisors && availableAdvisors.length > 0 ? (
                  availableAdvisors.map((advisor: any) => (
                    <div key={advisor.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{advisor.firstName} {advisor.lastName}</div>
                          <div className="text-sm text-gray-600">{advisor.email}</div>
                          {advisor.specialization && (
                            <div className="text-sm text-blue-600">{advisor.specialization}</div>
                          )}
                          {advisor.yearsOfExperience && (
                            <div className="text-xs text-gray-500">
                              {advisor.yearsOfExperience} years experience
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No advisors available
                  </div>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default SignalRDebug; 