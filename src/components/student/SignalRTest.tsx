// import React, { useState, useEffect } from 'react';
// import { Card, Button, Input, Typography, Space, Alert, Divider } from 'antd';
// import * as signalR from '@microsoft/signalr';
// import { useAuths } from '../../hooks/useAuths';

// const { Title, Text } = Typography;

// const SignalRTest: React.FC = () => {
//   const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
//   const [token, setToken] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState<string[]>([]);
//   const [connectionStatus, setConnectionStatus] = useState('Disconnected');
//   const [error, setError] = useState<string | null>(null);
  
//   const accessToken = useAuths((state) => state.accessToken);

//   // Initialize SignalR connection when token changes
//   useEffect(() => {
//     if (accessToken) {
//       setToken(accessToken);
//     }
//   }, [accessToken]);

//   useEffect(() => {
//     if (token) {
//       const newConnection = new signalR.HubConnectionBuilder()
//         .withUrl('https://jkh8ing8.online/advisoryChat1to1Hub', {
//           accessTokenFactory: () => `Bearer ${token}`,
//         })
//         .withAutomaticReconnect()
//         .build();

//       setConnection(newConnection);
//     }

//     return () => {
//       if (connection) {
//         connection.stop();
//       }
//     };
//   }, [token]);

//   // Start connection and set up event handlers
//   useEffect(() => {
//     if (connection) {
//       connection
//         .start()
//         .then(() => {
//           setConnectionStatus('Connected');
//           setError(null);
          
//           // Handle incoming messages
//           connection.on('SendADVSSMethod', (message) => {
//             setMessages((prev) => [...prev, `Message: ${JSON.stringify(message)}`]);
//           });

//           // Handle session join response
//           connection.on('JoinSSMethod', (messages) => {
//             setMessages((prev) => [...prev, `Joined session: ${JSON.stringify(messages)}`]);
//           });

//           // Handle session list updates
//           connection.on('GetSessionsHUBMethod', (sessions) => {
//             setMessages((prev) => [...prev, `Sessions: ${JSON.stringify(sessions)}`]);
//           });
//         })
//         .catch((err) => {
//           setConnectionStatus(`Error: ${err.message}`);
//           setError(err.message);
//         });

//       return () => {
//         connection.off('SendADVSSMethod');
//         connection.off('JoinSSMethod');
//         connection.off('GetSessionsHUBMethod');
//       };
//     }
//   }, [connection]);

//   const joinSession = async () => {
//     if (connection && sessionId) {
//       try {
//         await connection.invoke('JoinSession', parseInt(sessionId));
//         setMessages((prev) => [...prev, `Attempted to join session ${sessionId}`]);
//       } catch (err) {
//         const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//         setMessages((prev) => [...prev, `Error joining session: ${errorMessage}`]);
//       }
//     }
//   };

//   const sendMessage = async () => {
//     if (connection && sessionId && message) {
//       try {
//         await connection.invoke('SendMessage', parseInt(sessionId), message);
//         setMessages((prev) => [...prev, `Sent message: ${message}`]);
//         setMessage('');
//       } catch (err) {
//         const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//         setMessages((prev) => [...prev, `Error sending message: ${errorMessage}`]);
//       }
//     }
//   };

//   const listSessions = async () => {
//     if (connection) {
//       try {
//         await connection.invoke('ListAllSessionByStudent');
//         setMessages((prev) => [...prev, 'Requested session list']);
//       } catch (err) {
//         const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//         setMessages((prev) => [...prev, `Error listing sessions: ${errorMessage}`]);
//       }
//     }
//   };

//   return (
//     <Card 
//       title="SignalR Chat Test" 
//       style={{ 
//         position: 'fixed', 
//         top: '50%', 
//         left: '50%', 
//         transform: 'translate(-50%, -50%)', 
//         width: '500px',
//         maxHeight: '80vh',
//         overflow: 'auto',
//         zIndex: 1002
//       }}
//     >
//       <Space direction="vertical" style={{ width: '100%' }}>
//         <div>
//           <Text strong>JWT Token:</Text>
//           <Input
//             value={token}
//             onChange={(e) => setToken(e.target.value)}
//             placeholder="<<token>>"
//             style={{ marginTop: 8 }}
//           />
//         </div>

//         <div>
//           <Text strong>Connection Status:</Text>
//           <Alert
//             message={connectionStatus}
//             type={connectionStatus === 'Connected' ? 'success' : 'error'}
//             style={{ marginTop: 8 }}
//           />
//         </div>

//         <div>
//           <Text strong>Session ID:</Text>
//           <Input
//             type="number"
//             value={sessionId}
//             onChange={(e) => setSessionId(e.target.value)}
//             placeholder="Enter session ID"
//             style={{ marginTop: 8 }}
//           />
//         </div>

//         <Space>
//           <Button
//             onClick={joinSession}
//             disabled={!connection || !sessionId}
//             type="primary"
//           >
//             Join Session
//           </Button>
//           <Button
//             onClick={listSessions}
//             disabled={!connection}
//             type="default"
//           >
//             List Sessions
//           </Button>
//         </Space>

//         <Divider />

//         <div>
//           <Text strong>Message:</Text>
//           <Input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type a message"
//             style={{ marginTop: 8, marginBottom: 8 }}
//             onPressEnter={sendMessage}
//           />
//           <Button
//             onClick={sendMessage}
//             disabled={!connection || !sessionId || !message}
//             type="primary"
//             block
//           >
//             Send Message
//           </Button>
//         </div>

//         <Divider />

//         <div>
//           <Text strong>Messages:</Text>
//           <div 
//             style={{ 
//               border: '1px solid #d9d9d9', 
//               padding: 8, 
//               height: 200, 
//               overflow: 'auto',
//               marginTop: 8,
//               backgroundColor: '#fafafa'
//             }}
//           >
//             {messages.map((msg, index) => (
//               <div key={index} style={{ borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}>
//                 {msg}
//               </div>
//             ))}
//           </div>
//         </div>
//       </Space>
//     </Card>
//   );
// };

// export default SignalRTest; 