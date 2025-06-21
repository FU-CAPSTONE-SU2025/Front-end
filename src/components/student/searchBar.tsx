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
            <SearchOutlined className="text-lg text-white/70" />
          </div>
          
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/40 outline-none transition-all duration-200 hover:bg-white/10 hover:border-white/30 focus:bg-white/10 focus:border-white/40"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar; 