import React, { useState, useRef } from 'react';
import { Input, Button, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface ChatInputProps {
  chatSessionId?: number;
  disabled?: boolean;
  loading?: boolean;
  onSendMessage?: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ chatSessionId, disabled, loading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<any>(null);

  const handleSend = () => {
    if (!input.trim() || !chatSessionId || disabled || loading || !onSendMessage) return;
    onSendMessage(input);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="flex gap-2 items-end w-full">
      <Input.TextArea
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onPressEnter={e => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type your message..."
        className="flex-1 text-base rounded-2xl border-blue-200 focus:border-blue-500 focus:shadow-lg transition-all"
        disabled={disabled || loading}
        maxLength={2000}
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{ resize: 'none', minHeight: 48, maxHeight: 120, paddingRight: 56 }}
      />
      <Button
        type="primary"
        icon={loading ? <Spin size="small" /> : <SendOutlined style={{ fontSize: 18 }} />}
        onClick={handleSend}
        disabled={!input.trim() || !chatSessionId || disabled || loading}
        loading={loading}
        size="large"
        className="rounded-full h-10 w-10 flex items-center justify-center shadow-lg ml-1 hover:shadow-xl transition-all duration-300"
        style={{ minWidth: 40, minHeight: 40, padding: 0 }}
      />
    </div>
  );
};

export default ChatInput; 