import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search for subjects, courses, or resources...",
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex justify-center w-full ${className}`}
    >
      <div className="relative w-full max-w-2xl">
        {/* Main search container */}
        <div className="relative flex items-center">
          <div className="absolute left-4 flex items-center pointer-events-none z-10">
            <SearchOutlined className="text-lg text-gray-400" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-blue-300 shadow-sm"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar; 