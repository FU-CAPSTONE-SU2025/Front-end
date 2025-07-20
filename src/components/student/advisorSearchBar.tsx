import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Search } = Input;

interface AdvisorSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
}

const AdvisorSearchBar = ({ searchValue, onSearchChange, onSearch }: AdvisorSearchBarProps) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-4"
    >
      <Search
        placeholder="Search advisors by name..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onSearch={onSearch}
        enterButton={<SearchOutlined />}
        size="large"
        className="rounded-xl"
        allowClear
      />
    </motion.div>
  );
};

export default AdvisorSearchBar; 