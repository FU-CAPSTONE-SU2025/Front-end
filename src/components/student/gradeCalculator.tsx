import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, Table, Space, Typography, Input } from 'antd';
import { CalculatorOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Grade {
  name: string;
  score: number | null;
  weight?: number;
  isEditable?: boolean;
  isSuggested?: boolean;
  minScore?: number;
}

interface GradeRow {
  key: string;
  cate: string;
  weight: number;
  score: number | null;
  minScore: number;
}

interface GradeCalculatorProps {
  isVisible: boolean;
  onClose: () => void;
  grades: Grade[];
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  isVisible,
  onClose,
  grades,
}) => {
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Initialize grade rows from props
  useEffect(() => {
    if (isVisible && grades.length > 0) {
      const initialRows: GradeRow[] = grades.map((grade, index) => ({
        key: `grade-${index}`,
        cate: grade.name,
        weight: grade.weight || 0,
        score: grade.score,
        minScore: grade.minScore || 0
      }));
      setGradeRows(initialRows);
    }
  }, [isVisible, grades]);

  // Calculate total weight
  useEffect(() => {
    const totalWeight = gradeRows.reduce((sum, row) => sum + row.weight, 0);
    setTotal(totalWeight);
  }, [gradeRows]);

  // Calculate weighted average
  const calculateWeightedAverage = () => {
    const validRows = gradeRows.filter(row => row.score !== null && row.weight > 0);
    if (validRows.length === 0) return 0;
    
    const totalWeight = validRows.reduce((sum, row) => sum + row.weight, 0);
    const weightedSum = validRows.reduce((sum, row) => 
      sum + ((row.score || 0) * row.weight), 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const addRow = () => {
    const newRow: GradeRow = {
      key: `new-${Date.now()}`,
      cate: '',
      weight: 0, // Mặc định 0, không âm
      score: null,
      minScore: 0 // Mặc định 0, không âm
    };
    setGradeRows([...gradeRows, newRow]);
  };

  const removeRow = (key: string) => {
    setGradeRows(gradeRows.filter(row => row.key !== key));
  };

  const updateRow = (key: string, field: keyof GradeRow, value: any) => {
    setGradeRows(gradeRows.map(row => 
      row.key === key ? { ...row, [field]: value } : row
    ));
  };

  // Modal chỉ để tính toán, không cần lưu thay đổi

  const columns = [
    {
      title: <span className="!text-white">Category</span>,
      dataIndex: 'cate',
      key: 'cate',
      render: (text: string, record: GradeRow) => (
        <Input
          value={text}
          onChange={(e) => updateRow(record.key, 'cate', e.target.value)}
          placeholder="Enter item name"
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: <span className="!text-white">Weight (%)</span>,
      dataIndex: 'weight',
      key: 'weight',
      render: (value: number, record: GradeRow) => (
        <InputNumber
          value={value}
          onChange={(val) => {
            // Validate: không cho phép số âm
            if (val !== null && val < 0) return;
            updateRow(record.key, 'weight', val || 0);
          }}
          min={0}
          max={100}
          style={{ width: '100%' }}
          placeholder="0"
          onBlur={(e) => {
            // Đảm bảo giá trị không âm khi blur
            const val = parseFloat(e.target.value);
            if (val < 0) {
              updateRow(record.key, 'weight', 0);
            }
          }}
        />
      )
    },
    {
      title: <span className="!text-white">Value</span>,
      dataIndex: 'score',
      key: 'score',
      render: (value: number | null, record: GradeRow) => (
        <InputNumber
          value={value}
          onChange={(val) => {
            // Validate: không cho phép số âm
            if (val !== null && val < 0) return;
            updateRow(record.key, 'score', val);
          }}
          min={0}
          max={10}
          step={0.1}
          style={{ width: '100%' }}
          placeholder="Enter score"
          onBlur={(e) => {
            // Đảm bảo giá trị không âm khi blur
            const val = parseFloat(e.target.value);
            if (val < 0) {
              updateRow(record.key, 'score', 0);
            }
          }}
        />
      )
    },
    {
      title: <span className="!text-white">Min Score</span>,
      dataIndex: 'minScore',
      key: 'minScore',
      render: (value: number, record: GradeRow) => (
        <InputNumber
          value={value}
          onChange={(val) => {
            // Validate: không cho phép số âm
            if (val !== null && val < 0) return;
            updateRow(record.key, 'minScore', val || 0);
          }}
          min={0}
          max={10}
          step={0.1}
          style={{ width: '100%' }}
          placeholder="0"
          onBlur={(e) => {
            // Đảm bảo giá trị không âm khi blur
            const val = parseFloat(e.target.value);
            if (val < 0) {
              updateRow(record.key, 'minScore', 0);
            }
          }}
        />
      )
    },
    {
      title: <span className="!text-white">Action</span>,
      key: 'action',
      render: (_, record: GradeRow) => (
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => removeRow(record.key)}
          danger
          size="small"
        />
      )
    }
  ];

  const weightedAverage = calculateWeightedAverage();

  return (
    <Modal
      title={
        <Space>
          <CalculatorOutlined style={{ color: '#1890ff' }} />
          <span>Calculate percentage grade</span>
        </Space>
      }
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Total Weight Display */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Total: {total}%</Text>
          <Text strong>Weighted Average: {weightedAverage.toFixed(2)}/10</Text>
        </div>

        {/* Grade Table */}
        <Table
          columns={columns}
          dataSource={gradeRows}
          pagination={false}
          size="small"
          bordered
          rowKey="key"
        />

        {/* Add Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={addRow}
            style={{ width: '120px' }}
          >
            Add +
          </Button>
        </div>

                 {/* Modal chỉ để tính toán, sử dụng nút close mặc định */}
      </Space>
    </Modal>
  );
};

export default GradeCalculator; 