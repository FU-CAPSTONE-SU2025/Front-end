import React from 'react';
import { Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';

interface ExcelImportButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

const ExcelImportButton: React.FC<ExcelImportButtonProps> = ({
  children,
  onClick,
  type = 'primary',
  style,
  className,
  disabled,
}) => (
  <Button
    type={type}
    icon={<FileExcelOutlined style={{ color: '#22C55E' }} />}
    onClick={onClick}
    style={{
      background: '#22C55E',
      border: 'none',
      color: '#fff',
      fontWeight: 600,
      fontSize: 16,
      padding: '8px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 8px #bbf7d055',
      ...style,
    }}
    className={className}
    disabled={disabled}
  >
    {children}
  </Button>
);

export default ExcelImportButton; 