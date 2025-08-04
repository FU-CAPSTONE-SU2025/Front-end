import React, { useState } from 'react';
import { Button, Card, Space, Typography, Alert, Divider } from 'antd';
import { useAdvisorChatWithStudent } from '../../hooks/useAdvisorChatWithStudent';
import { SIGNALR_CONFIG, ConnectionState } from '../../config/signalRConfig';

const { Title, Text } = Typography;

const AdvisorChatTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const {
    connectionState,
    sessions,
    unassignedSessions,
    currentSession,
    messages,
    error,
    loading,
    advisorId,
    joinSession,
    sendMessage,
    fetchAssignedSessions,
    fetchUnassignedSessions,
    setError,
  } = useAdvisorChatWithStudent();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testConnection = () => {
    addTestResult(`Connection State: ${connectionState}`);
    addTestResult(`Error: ${error || 'None'}`);
    addTestResult(`Loading: ${loading}`);
    addTestResult(`Advisor ID: ${advisorId || 'Not set'}`);
  };

  const testFetchSessions = async () => {
    try {
      addTestResult('Fetching assigned sessions...');
      await fetchAssignedSessions();
      addTestResult(`Assigned sessions: ${sessions.length}`);
      
      addTestResult('Fetching unassigned sessions...');
      await fetchUnassignedSessions();
      addTestResult(`Unassigned sessions: ${unassignedSessions.length}`);
    } catch (err) {
      addTestResult(`Error fetching sessions: ${err}`);
    }
  };

  const testJoinSession = async () => {
    if (sessions.length === 0 && unassignedSessions.length === 0) {
      addTestResult('No sessions available to test');
      return;
    }

    const testSession = sessions[0] || unassignedSessions[0];
    try {
      addTestResult(`Joining session: ${testSession.id}`);
      await joinSession(testSession.id);
      addTestResult(`Successfully joined session: ${testSession.id}`);
      addTestResult(`Current session: ${currentSession?.id || 'None'}`);
    } catch (err) {
      addTestResult(`Error joining session: ${err}`);
    }
  };

  const testSendMessage = async () => {
    if (!currentSession) {
      addTestResult('No active session to send message');
      return;
    }

    try {
      const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
      addTestResult(`Sending message: ${testMessage}`);
      await sendMessage(testMessage);
      addTestResult('Message sent successfully');
      addTestResult(`Total messages: ${messages.length}`);
    } catch (err) {
      addTestResult(`Error sending message: ${err}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Title level={2}>Advisor Chat System Test</Title>
      
      <Alert
        message="Production Test Environment"
        description="This component tests the advisor chat functionality in production. Use this to verify all features work correctly."
        type="info"
        showIcon
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card title="Connection Status" className="h-fit">
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between">
              <Text>State:</Text>
              <Text type={connectionState === ConnectionState.Connected ? 'success' : 'danger'}>
                {connectionState}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text>Error:</Text>
              <Text type={error ? 'danger' : 'success'}>
                {error || 'None'}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text>Loading:</Text>
              <Text>{loading ? 'Yes' : 'No'}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Advisor ID:</Text>
              <Text>{advisorId || 'Not set'}</Text>
            </div>
          </Space>
        </Card>

        {/* Session Info */}
        <Card title="Session Information" className="h-fit">
          <Space direction="vertical" className="w-full">
            <div className="flex justify-between">
              <Text>Assigned Sessions:</Text>
              <Text>{sessions.length}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Unassigned Sessions:</Text>
              <Text>{unassignedSessions.length}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Current Session:</Text>
              <Text>{currentSession?.id || 'None'}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Messages:</Text>
              <Text>{messages.length}</Text>
            </div>
          </Space>
        </Card>
      </div>

      <Divider />

      {/* Test Controls */}
      <Card title="Test Controls">
        <Space wrap className="w-full">
          <Button onClick={testConnection} type="primary">
            Test Connection
          </Button>
          <Button onClick={testFetchSessions} disabled={connectionState !== ConnectionState.Connected}>
            Test Fetch Sessions
          </Button>
          <Button onClick={testJoinSession} disabled={sessions.length === 0 && unassignedSessions.length === 0}>
            Test Join Session
          </Button>
          <Button onClick={testSendMessage} disabled={!currentSession}>
            Test Send Message
          </Button>
          <Button onClick={clearError} danger>
            Clear Error
          </Button>
          <Button onClick={clearResults}>
            Clear Results
          </Button>
        </Space>
      </Card>

      <Divider />

      {/* Test Results */}
      <Card title="Test Results" className="max-h-96 overflow-y-auto">
        {testResults.length === 0 ? (
          <Text type="secondary">No test results yet. Run tests to see results.</Text>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Configuration Info */}
      <Divider />
      <Card title="Configuration">
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between">
            <Text>SignalR URL:</Text>
            <Text code>{SIGNALR_CONFIG.ADVISORY_CHAT_HUB_URL}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Transport:</Text>
            <Text code>{SIGNALR_CONFIG.CONNECTION.TRANSPORT_TYPE}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Max Retries:</Text>
            <Text code>{SIGNALR_CONFIG.CONNECTION.MAX_RETRIES}</Text>
          </div>
          <div className="flex justify-between">
            <Text>Retry Delay:</Text>
            <Text code>{SIGNALR_CONFIG.CONNECTION.RETRY_DELAY}ms</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AdvisorChatTest; 