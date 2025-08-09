import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Input, Select, Space, Typography, Spin, Empty } from 'antd';
import { PlusOutlined, CheckOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useCRUDSubject, useCRUDSubjectVersion } from '../../hooks/useCRUDSchoolMaterial';
import { Subject } from '../../interfaces/ISchoolProgram';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import styles from '../../css/staff/staffEditSyllabus.module.css';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface SubjectVersionItem {
  id: number;
  subjectCode: string;
  versionCode: string;
  subjectName: string;
  key?: number; // Optional key property for React reconciliation
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
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);
  const [subjectOptionsLoading, setSubjectOptionsLoading] = useState(false);
  const [subjectOptionsHasMore, setSubjectOptionsHasMore] = useState(true);
  const [subjectOptionsPage, setSubjectOptionsPage] = useState(1);
  const { handleError, handleSuccess } = useApiErrorHandler();

  // CRUD hooks
  const {
    getSubjectMutation,
  } = useCRUDSubject();

  const { 
    getSubjectVersionMutation,
    addPrerequisiteToSubjectVersionMutation 
  } = useCRUDSubjectVersion();

  // Fetch subject options with real API
  const fetchSubjectOptions = async (reset = false, searchValue = subjectOptionsSearch) => {
    if (reset) {
      setSubjectOptionsPage(1);
      setSubjectOptionsHasMore(true);
    }
    
    if (!subjectOptionsHasMore || subjectOptionsLoading) return;
    
    setSubjectOptionsLoading(true);
    
    try {
      // Check if the function is available
      if (!getSubjectMutation || !getSubjectMutation.mutateAsync) {
        console.error('getSubjectMutation is not available');
        handleError('Subject fetch function is not available');
        return;
      }
      
      const result = await getSubjectMutation.mutateAsync({ pageNumber: reset ? 1 : subjectOptionsPage + 1, pageSize: 10, search: searchValue });
      
      if (result) {
        const newSubjects = result.items || [];
        if (reset) {
          setSubjectOptions(newSubjects);
        } else {
          setSubjectOptions(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueNewSubjects = newSubjects.filter(s => !existingIds.has(s.id));
            return [...prev, ...uniqueNewSubjects];
          });
        }
        
        // Check if there are more pages
        const totalPages = Math.ceil(result.totalCount / 10);
        setSubjectOptionsHasMore((reset ? 1 : subjectOptionsPage + 1) < totalPages);
        if (!reset) {
          setSubjectOptionsPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      handleError('Failed to load subjects');
    } finally {
      setSubjectOptionsLoading(false);
    }
  };

  // Fetch subject versions with real API
  const fetchData = async (reset = false, customPage?: number) => {
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    
    if (!hasMore || loading) return;
    
    setLoading(true);
    
    try {
      // Check if the function is available
      if (!getSubjectVersionMutation || !getSubjectVersionMutation.mutateAsync) {
        console.error('getSubjectVersionMutation is not available');
        handleError('Subject version fetch function is not available');
        return;
      }
      
      const pageNumber = reset ? 1 : customPage || page + 1;
      
      // Build API parameters based on the API documentation
      const params = {
        pageNumber,
        pageSize: 10,
        search: searchValue || "",
        subjectId: selectedSubjectId || ""
      } as any;
      
      // Add subjectId if selected (not part of PaginationParams interface)
      if (selectedSubjectId && selectedSubjectId !== undefined) {
        (params as any).subjectId = selectedSubjectId;
      }
      
      const result = await getSubjectVersionMutation.mutateAsync(params);
      
      if (result && result.items) {
        const transformedData: SubjectVersionItem[] = result.items.map(version => ({
          id: version.id,
          subjectCode: version.subject?.subjectCode || '',
          versionCode: version.versionCode,
          subjectName: version.subject?.subjectName || '',
          key: version.id 
        }));
        
        if (reset) {
          setData(transformedData);
        } else {
          setData(prev => {
            const existingIds = new Set(prev.map(v => v.id));
            const uniqueNewVersions = transformedData.filter(v => !existingIds.has(v.id));
            return [...prev, ...uniqueNewVersions];
          });
        }
        
        // Check if there are more pages
        const totalPages = Math.ceil(result.totalCount / 10);
        setHasMore(pageNumber < totalPages);
        
        if (!reset && !customPage) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subject versions:', error);
      handleError('Failed to load subject versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSubjectOptions(true);
      fetchData(true);
    }
  }, [open]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData(true);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchValue, selectedSubjectId]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSubjectFilterChange = (value: number | undefined) => {
    setSelectedSubjectId(value);
  };

  const handleSubjectDropdownSearch = (value: string) => {
    setSubjectOptionsSearch(value);
  };

  // Debounced subject options search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubjectOptions(true, subjectOptionsSearch);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [subjectOptionsSearch]);

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
      await addPrerequisiteToSubjectVersionMutation.mutateAsync({
        subjectVersionId: currentSubjectVersionId,
        prerequisiteId: item.id
      });
      handleSuccess('Prerequisite added successfully!');
      onClose();
    } catch (err: any) {
      handleError('Failed to add prerequisite: ' + err.message);
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
              placeholder={selectedSubjectId ? "Filter by subject" : "All subjects"}
              value={selectedSubjectId}
              onChange={handleSubjectFilterChange}
              className={styles.modalFilterSelect}
              showSearch
              filterOption={false}
              onSearch={handleSubjectDropdownSearch}
              onPopupScroll={handleSubjectDropdownScroll}
              loading={subjectOptionsLoading}
              allowClear
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
              <Option key="all" value={undefined}>
                All Subjects
              </Option>
              {subjectOptions.map(subject => (
                <Option key={subject.id} value={subject.id}>
                  {subject.subjectName} ({subject.subjectCode})
                </Option>
              ))}
              {subjectOptionsHasMore && (
                <Option key="load-more" value="load-more" disabled>
                  <div className={styles.loadMoreOption}>
                    {subjectOptionsLoading ? 'Loading...' : 'Scroll to load more'}
                  </div>
                </Option>
              )}
            </Select>
          </div>
          
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
    </Modal>
  );
};

export default AddPrerequisiteSubjectVersionModal; 