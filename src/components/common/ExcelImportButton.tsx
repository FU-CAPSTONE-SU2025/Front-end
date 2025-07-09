import React from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ExcelImportButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'middle' | 'large';
}

const ExcelImportButton: React.FC<ExcelImportButtonProps> = ({
  children,
  onClick,
  style,
  className,
  disabled,
  loading,
  size = 'large',
}) => (
  <Button
    type="default"
    icon={<UploadOutlined />}
    onClick={onClick}
    size={size}
    style={{
      borderRadius: 999,
      borderColor: '#10B981',
      color: '#10B981',
      ...style,
    }}
    className={className}
    disabled={disabled}
    loading={loading}
  >
    {children}
  </Button>
);

export default ExcelImportButton; 