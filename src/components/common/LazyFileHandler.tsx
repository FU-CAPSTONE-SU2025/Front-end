import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';

// Lazy load file handling components
const LazyXLSX = lazy(() => import('xlsx'));

// File handling loading fallback
const FileHandlerLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 100,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    border: '1px dashed rgba(255, 255, 255, 0.2)'
  }}>
    <Spin size="small" />
    <span style={{ marginLeft: 12, color: '#666' }}>Loading file handler...</span>
  </div>
);

// Lazy XLSX operations wrapper
export const LazyXLSXHandler: React.FC<{
  onLoad?: (xlsx: any) => void;
  children: (xlsx: any) => React.ReactNode;
}> = ({ onLoad, children }) => (
  <Suspense fallback={<FileHandlerLoader />}>
    <LazyXLSXLoader onLoad={onLoad}>
      {children}
    </LazyXLSXLoader>
  </Suspense>
);

const LazyXLSXLoader: React.FC<{
  onLoad?: (xlsx: any) => void;
  children: (xlsx: any) => React.ReactNode;
}> = ({ onLoad, children }) => {
  React.useEffect(() => {
    if (onLoad) {
      import('xlsx').then(xlsx => onLoad(xlsx));
    }
  }, [onLoad]);

  return (
    <Suspense fallback={<FileHandlerLoader />}>
      <LazyXLSX>
        {(xlsx: any) => children(xlsx)}
      </LazyXLSX>
    </Suspense>
  );
};

// Utility functions for file operations
export const lazyReadExcelFile = async (file: File): Promise<any[]> => {
  const XLSX = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const lazyExportToExcel = async (data: any[], filename: string): Promise<void> => {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Lazy file saver
export const lazySaveFile = async (blob: Blob, filename: string): Promise<void> => {
  const { saveAs } = await import('file-saver');
  saveAs(blob, filename);
};

// Lazy file upload component
export const LazyFileUpload: React.FC<{
  onFileSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  children: React.ReactNode;
}> = ({ onFileSelect, accept = '.xlsx,.xls,.csv', multiple = false, children }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {children}
    </div>
  );
};
