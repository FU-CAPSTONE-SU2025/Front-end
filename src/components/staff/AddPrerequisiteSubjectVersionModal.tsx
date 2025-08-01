import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Input, Select, Space, Typography, Spin, Empty } from 'antd';
import { PlusOutlined, CheckOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import { message } from 'antd';
import styles from '../../css/staff/staffEditSyllabus.module.css';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface SubjectVersionItem {
  id: number;
  subjectCode: string;
  versionCode: string;
  subjectName: string;
}

interface AddPrerequisiteSubjectVersionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (prerequisiteId: number) => Promise<void>;
  currentSubjectVersionId: number;
  existingPrerequisites: number[];
}

const AddPrerequisiteSubjectVersionModal: React.FC<AddPrerequisiteSubjectVersionModalProps> = ({
  open,
  onClose,
  onAdd,
  currentSubjectVersionId,
  existingPrerequisites,
}) => {
  const [data, setData] = useState<SubjectVersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [subjectOptionsSearch, setSubjectOptionsSearch] = useState('');
  const [subjectOptions, setSubjectOptions] = useState<{ id: number; subjectName: string; subjectCode: string }[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);
  const [subjectOptionsLoading, setSubjectOptionsLoading] = useState(false);
  const [subjectOptionsHasMore, setSubjectOptionsHasMore] = useState(true);
  const [subjectOptionsPage, setSubjectOptionsPage] = useState(1);

  // Mock data for demonstration - replace with actual API calls
  const fetchSubjectOptions = async (reset = false, searchValue = subjectOptionsSearch) => {
    if (reset) {
      setSubjectOptionsPage(1);
      setSubjectOptionsHasMore(true);
    }
    
    if (!subjectOptionsHasMore || subjectOptionsLoading) return;
    
    setSubjectOptionsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        { id: 1, subjectName: 'Computer Science', subjectCode: 'CS101' },
        { id: 2, subjectName: 'Mathematics', subjectCode: 'MATH101' },
        { id: 3, subjectName: 'Physics', subjectCode: 'PHY101' },
        { id: 4, subjectName: 'Chemistry', subjectCode: 'CHEM101' },
        { id: 5, subjectName: 'Biology', subjectCode: 'BIO101' },
      ].filter(item => 
        item.subjectName.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.subjectCode.toLowerCase().includes(searchValue.toLowerCase())
      );
      
      if (reset) {
        setSubjectOptions(mockData);
      } else {
        setSubjectOptions(prev => [...prev, ...mockData]);
      }
      
      setSubjectOptionsHasMore(mockData.length === 5);
      setSubjectOptionsLoading(false);
    }, 500);
  };

  const fetchData = async (reset = false, customPage?: number) => {
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    
    if (!hasMore || loading) return;
    
    setLoading(true);
    
    // Simulate API call with search and filter
    setTimeout(() => {
      const mockData = [
        { id: 1, subjectCode: 'CS101', versionCode: '1.0', subjectName: 'Introduction to Computer Science' },
        { id: 2, subjectCode: 'CS101', versionCode: '2.0', subjectName: 'Introduction to Computer Science' },
        { id: 3, subjectCode: 'MATH101', versionCode: '1.0', subjectName: 'Calculus I' },
        { id: 4, subjectCode: 'PHY101', versionCode: '1.0', subjectName: 'Physics I' },
        { id: 5, subjectCode: 'CHEM101', versionCode: '1.0', subjectName: 'Chemistry I' },
      ].filter(item => {
        const matchesSearch = searchValue === '' || 
          item.subjectName.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.subjectCode.toLowerCase().includes(searchValue.toLowerCase());
        
        const matchesSubjectFilter = !selectedSubjectId || item.subjectCode === 
          subjectOptions.find(s => s.id === selectedSubjectId)?.subjectCode;
        
        return matchesSearch && matchesSubjectFilter;
      });
      
      if (reset) {
        setData(mockData);
      } else {
        setData(prev => [...prev, ...mockData]);
      }
      
      setHasMore(mockData.length === 5);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (open) {
      fetchSubjectOptions(true);
      fetchData(true);
    }
  }, [open]);

  useEffect(() => {
    fetchData(true);
  }, [searchValue, selectedSubjectId]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSubjectFilterChange = (value: number | undefined) => {
    setSelectedSubjectId(value);
  };

  const handleSubjectDropdownSearch = (value: string) => {
    setSubjectOptionsSearch(value);
    fetchSubjectOptions(true, value);
  };

  const handleSubjectDropdownScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { target } = e;
    const { scrollTop, scrollHeight, clientHeight } = target as HTMLElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      fetchSubjectOptions(false);
    }
  };

  const handleSubjectVersionListScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { target } = e;
    const { scrollTop, scrollHeight, clientHeight } = target as HTMLElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      fetchData(false);
    }
  };

  const handleAdd = async (item: SubjectVersionItem) => {
    setAddingId(item.id);
    try {
      await onAdd(item.id);
      message.success('Prerequisite added successfully!');
    } catch (err: any) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error('Failed to add prerequisite: ' + errorMessage);
    } finally {
      setAddingId(null);
    }
  };

  const isAlreadyPrerequisite = (item: SubjectVersionItem) => {
    return item.id === currentSubjectVersionId || existingPrerequisites.includes(item.id);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(false);
    }
  };

  const renderItem = (item: SubjectVersionItem) => (
    <List.Item
      className={styles.modalBodyContent}
      onMouseEnter={(e) => {
        if (!isAlreadyPrerequisite(item)) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderLeft}>
          <div className={styles.modalHeaderTitle}>
            <Text strong className={styles.modalHeaderTitleText}>
              {item.subjectCode} v{item.versionCode}
            </Text>
            {isAlreadyPrerequisite(item) && (
              <Text type="secondary" className={styles.modalHeaderSubtitle}>
                {item.id === currentSubjectVersionId ? '(Current Version)' : '(Already Added)'}
              </Text>
            )}
          </div>
          <Text type="secondary" className={styles.modalHeaderDescription}>
            {item.subjectName}
          </Text>
        </div>
        <Space>
          {isAlreadyPrerequisite(item) ? (
            <Button
              type="text"
              icon={<CheckOutlined />}
              className={styles.modalHeaderStatus}
              disabled
            >
              {item.id === currentSubjectVersionId ? 'Current' : 'Added'}
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={addingId === item.id}
              onClick={() => handleAdd(item)}
              className={styles.modalAddButton}
            >
              Add
            </Button>
          )}
        </Space>
      </div>
    </List.Item>
  );

  return (
    <Modal
      title={
        <div className={styles.modalAddButton}>
          <PlusOutlined className={styles.modalAddButtonIcon} />
          <span>Add Prerequisite Subject Version</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      className={styles.modalDropdown}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalBody}>
          <Space direction="vertical" className={styles.modalBodyContent} size="middle">
            <div className={styles.modalSearch}>
              <SearchOutlined className={styles.modalSearchIcon} />
              <Search
                placeholder="Search subject versions..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={styles.modalSearchInput}
              />
            </div>
            <div className={styles.modalFilter}>
              <FilterOutlined className={styles.modalFilterIcon} />
              <Select
                placeholder="Filter by subject"
                value={selectedSubjectId}
                onChange={handleSubjectFilterChange}
                className={styles.modalFilterSelect}
                showSearch
                filterOption={false}
                onSearch={handleSubjectDropdownSearch}
                onPopupScroll={handleSubjectDropdownScroll}
                loading={subjectOptionsLoading}
                notFoundContent={
                  subjectOptionsLoading ? (
                    <div className={styles.modalBodyLoadingText}>
                      <Spin size="small" />
                    </div>
                  ) : (
                    <div className={styles.modalBodyEmptyText}>
                      No subjects found
                    </div>
                  )
                }
              >
                {subjectOptions.map(subject => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
          
          <div className={styles.modalBodyContent}>
            <div className={styles.modalBodyScroll} onScroll={handleSubjectVersionListScroll}>
              {data.length > 0 ? (
                <List
                  dataSource={data}
                  renderItem={renderItem}
                  loading={loading}
                  className={styles.modalBodyLoading}
                />
              ) : (
                <div className={styles.modalBodyEmpty}>
                  <Empty
                    description={
                      <Text type="secondary" className={styles.modalBodyEmptyText}>
                        No subject versions found
                      </Text>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddPrerequisiteSubjectVersionModal; 