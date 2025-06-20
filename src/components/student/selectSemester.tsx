import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';


interface SemesterOption {
  label: string;
  value: string;
}

interface SemesterSelectProps {
  value: string;
  options: SemesterOption[];
  onChange: (value: string) => void;
}

const customSelectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  border: 'none',
  boxShadow: 'none',
  borderRadius: 9999, // pill shape
  height: 44,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  fontSize: 16,
};

const SemesterSelect: React.FC<SemesterSelectProps> = ({ value, options, onChange }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg px-4 py-2 flex items-center">
      <span className="text-white font-semibold mr-3 hidden sm:inline">Semester:</span>
      <Select
        className="w-44 font-bold text-white "
        value={value}
        options={options as SelectProps['options']}
        onChange={onChange}
        size="large"
        dropdownStyle={{ zIndex: 2000, background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        popupClassName="rounded-2xl custom-semester-dropdown"
        style={customSelectStyle}
        bordered={false}
        placeholder="Select semester"
        suffixIcon={<span style={{ color: '#fff' }}>▼</span>}
        optionLabelProp="label"
      />
      <style>{`
        .custom-semester-dropdown .ant-select-item-option {
          @apply rounded-xl transition-colors;
        }
        .custom-semester-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled),
        .custom-semester-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled),
        .custom-semester-dropdown .ant-select-item-option:hover:not(.ant-select-item-option-disabled) {
          background-color: #fb923c !important; 
          color: #fff !important;
          font-weight: 700 !important;
        }
        .custom-semester-dropdown .ant-select-item-option {
          background-color: #fff !important;
          color: #222 !important;
          font-weight: 700 !important;
        }
        .ant-select-selector, .ant-select-selection-item {
          color: #fff !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
};

export default SemesterSelect; 