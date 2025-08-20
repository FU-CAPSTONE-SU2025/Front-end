import { Button, Spin } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AdvisorData } from '../../interfaces/IStudent';
import AdvisorCard from './advisorCard';
import AdvisorSearchBar from './advisorSearchBar';

interface AdvisorListProps {
  advisors: AdvisorData[];
  selectedAdvisor: AdvisorData | null;
  onAdvisorSelect: (advisor: AdvisorData) => void;
  isLoading: boolean;
  error: Error | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
}

const AdvisorList = ({ 
  advisors, 
  selectedAdvisor, 
  onAdvisorSelect, 
  isLoading, 
  error,
  searchValue,
  onSearchChange,
  onSearch
}: AdvisorListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate how many advisors can fit in the container
  useEffect(() => {
    const calculateVisibleCount = () => {
      // Estimate advisor card height (including padding, margin, etc.)
      const cardHeight = 100; // Reduced height for compact cards
      const searchBarHeight = 60; // Height of search bar
      const headerHeight = 80; // Height of header text
      const padding = 30; // Total padding
      
      // Get container height (this will be set by parent)
      const availableHeight = containerHeight - searchBarHeight - headerHeight - padding;
      const maxVisible = Math.floor(availableHeight / cardHeight);
      
      return Math.max(3, Math.min(maxVisible, advisors.length)); // At least 3, at most all advisors
    };

    if (containerHeight > 0) {
      const newVisibleCount = calculateVisibleCount();
      setVisibleCount(newVisibleCount);
    }
  }, [containerHeight, advisors.length]);

  // Filter advisors based on search
  const filteredAdvisors = advisors.filter(advisor => {
    if (!searchValue) return true;
    const fullName = `${advisor.firstName} ${advisor.lastName}`.toLowerCase();
    return fullName.includes(searchValue.toLowerCase());
  });

  // Get advisors to display
  const displayAdvisors = showAll ? filteredAdvisors : filteredAdvisors.slice(0, visibleCount);
  const hasMore = filteredAdvisors.length > visibleCount;

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  return (
    <div 
      className="flex flex-col h-full"
      ref={(el) => {
        if (el) {
          setContainerHeight(el.clientHeight);
        }
      }}
    >
      {/* Search Bar */}
      <AdvisorSearchBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearch={onSearch}
      />

      {/* Advisor List */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">
            Error loading advisors: {error.message}
          </div>
                 ) : filteredAdvisors.length === 0 ? (
           <div className="text-gray-500 text-center py-8">
             {searchValue ? 'No advisors found matching your search' : 'No advisors available'}
           </div>
        ) : (
          <div className="space-y-3 overflow-y-auto h-full pr-2">
            <AnimatePresence>
              {displayAdvisors.map((advisor, index) => (
                <motion.div
                  key={advisor.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AdvisorCard
                    advisor={advisor}
                    isSelected={selectedAdvisor?.id === advisor.id}
                    onClick={() => onAdvisorSelect(advisor)}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4 border-t border-gray-200"
        >
          <Button
            type="text"
            onClick={showAll ? handleShowLess : handleShowMore}
            className="w-full h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-medium"
            icon={showAll ? <UpOutlined /> : <DownOutlined />}
          >
            {showAll ? 'Show Less' : `Show More (${filteredAdvisors.length - visibleCount} advisors)`}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AdvisorList; 