import React from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from "../../css/bulkimportButton.module.css";

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
  disabled,
  loading,
  size = 'large',
}) => (
  <Button
    type="default"
   
    icon={<UploadOutlined />}
    onClick={onClick}
    size={size}
    style={{ ...style }}
    disabled={disabled}
    loading={loading}
    className={styles.button}
  >
    {children}
  </Button>
);

export default ExcelImportButton; 