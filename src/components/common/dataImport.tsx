import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import styles from '../../css/admin/dataImport.module.css';
import { 
  HeaderConfiguration, 
  getHeaderConfig 
} from '../../data/importConfigurations';

type DataImportProps = {
  onClose: () => void;
  onDataImported: (data: { [key: string]: string }[]) => void;
  headerConfig: HeaderConfiguration;
  allowMultipleRows?: boolean; // New prop to control single vs multiple row import
  dataType?: string; // Optional data type for better error messages
};

const DataImport: React.FC<DataImportProps> = ({ 
  onClose, 
  onDataImported, 
  headerConfig, 
  allowMultipleRows = false,
  dataType = 'data'
}) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.xlsx')) {
      setFile(droppedFile);
    } else {
      setError('Please drop a valid .xlsx file.');
    }
  };

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // Validation logic
        if (!jsonData || jsonData.length === 0) {
          setError('The Excel file is empty.');
          return;
        }

        const config = getHeaderConfig(headerConfig);
        const headers = jsonData[0] as string[];
        const expectedHeaders = config.headers;
        
        // Check for missing headers
        const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
          setError(`Missing required headers for ${dataType}: ${missingHeaders.join(', ')}.`);
          return;
        }

        const rows = jsonData.slice(1);
        if (rows.length === 0) {
          setError('No data rows found after headers.');
          return;
        }

        // Process data rows
        const processedData: { [key: string]: string }[] = [];
        const rowsToProcess = allowMultipleRows ? rows : [rows[0]];

        rowsToProcess.forEach((rowData, rowIndex) => {
          const mappedData: { [key: string]: string } = {};
          let hasValidData = false;

          headers.forEach((header, index) => {
            const fieldKey = config.fieldMap[header];
            if (fieldKey && rowData[index] !== undefined && rowData[index] !== null && rowData[index] !== '') {
              mappedData[fieldKey] = String(rowData[index]).trim();
              hasValidData = true;
            }
          });

          // Only add row if it has at least one valid field
          if (hasValidData) {
            processedData.push(mappedData);
          }
        });

        if (processedData.length === 0) {
          setError('No valid data found in the Excel file.');
          return;
        }

        onDataImported(processedData);
        onClose();
      };
      reader.readAsBinaryString(file);
    }
  }, [file, onClose, onDataImported, headerConfig, allowMultipleRows, dataType]);

  const dropZoneVariants = {
    hidden: { scale: 0.8, y: -50 },
    visible: { scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const config = getHeaderConfig(headerConfig);
  const expectedHeadersText = config.headers.join(', ');

  return (
    <div className={styles.dataImportContainer}>
      <motion.div
        className={`${styles.dropZone} ${dragging ? styles.dragging : ''}`}
        variants={dropZoneVariants}
        initial="hidden"
        animate="visible"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <>
            <div className={styles.dropText}>
              Drag and drop your {dataType} XLSX file here!
            </div>
            <div className={styles.expectedHeaders}>
              <strong>Expected headers:</strong><br />
              {expectedHeadersText}
            </div>
          </>
        )}
        <svg className={styles.dropIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14m0-14l-6 6m6-6l6 6" />
        </svg>
        <div className={styles.buttonContainer}>
          <div className={styles.cancelButton} onClick={onClose}>
            <div className={styles.buttonContent}>Cancel</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DataImport;
