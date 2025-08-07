import React, { useState } from 'react';
import { Upload, Button, Card, Typography, Space, Progress, Alert } from 'antd';
import { UploadOutlined, FileExcelOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const { Dragger } = Upload;
const { Title, Text } = Typography;

interface ExcelUploadProps {
  title: string;
  icon: string;
  color: string;
  expectedFormat: {
    required: string[];
    optional?: string[];
    notes?: string[];
  };
  onDataUploaded: (data: any[]) => void;
  transformData: (jsonData: any[]) => any[];
  templateData: any[];
  fileName: string;
  sheetName: string;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({
  title,
  icon,
  color,
  expectedFormat,
  onDataUploaded,
  transformData,
  templateData,
  fileName,
  sheetName
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { handleError, handleSuccess } = useApiErrorHandler();

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Enhanced error handling for xlsx 0.20.3 compatibility
        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'array' });
        } catch (xlsxError) {
          console.error('XLSX parsing error:', xlsxError);
          const errorMessage = getUserFriendlyErrorMessage(xlsxError);
          handleError(errorMessage);
          setIsUploading(false);
          return;
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          handleError('No worksheet found in the Excel file.');
          setIsUploading(false);
          return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!jsonData || jsonData.length === 0) {
          handleError('No data found in the Excel file.');
          setIsUploading(false);
          return;
        }
        
        const transformedData = transformData(jsonData);
        onDataUploaded(transformedData);
        handleSuccess(`Successfully uploaded ${transformedData.length} items`);
      } catch (error) {
        console.error('File processing error:', error);
        const errorMessage = getUserFriendlyErrorMessage(error);
        handleError(errorMessage);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Card title={`Upload ${title} from Excel`} className="shadow-md">
      <div className="text-center py-8">
        <Dragger
          name="file"
          accept=".xlsx,.xls"
          beforeUpload={handleFileUpload}
          showUploadList={false}
          disabled={isUploading}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`text-4xl mb-4`} style={{ color }}>
              {icon}
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isUploading ? 'Processing...' : 'Click or drag Excel file here'}
            </p>
            <p className="text-sm text-gray-500">
              Support for .xlsx and .xls files
            </p>
          </motion.div>
        </Dragger>

        <div className="mt-6 text-left">
          <h4 className="font-medium text-gray-700 mb-2">Expected Excel Format:</h4>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>Required Columns:</strong> {expectedFormat.required.join(', ')}</p>
            {expectedFormat.optional && (
              <p><strong>Optional Columns:</strong> {expectedFormat.optional.join(', ')}</p>
            )}
            {expectedFormat.notes?.map((note, index) => (
              <p key={index}><strong>{note.split(':')[0]}:</strong> {note.split(':')[1]}</p>
            ))}
            <button 
              onClick={handleDownloadTemplate}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <FileExcelOutlined />
              Download Template
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExcelUpload; 