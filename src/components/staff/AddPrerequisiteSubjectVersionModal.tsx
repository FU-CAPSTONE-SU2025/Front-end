import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Input, List, Spin, Button, Select, Card, Typography, Space, Divider, message } from 'antd';
import { PlusOutlined, CheckOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { FetchPagedSubjectVersionList, FetchSubjectVersionBySubjectId } from '../../api/SchoolAPI/subjectVersionAPI';
import { FetchSubjectList } from '../../api/SchoolAPI/subjectAPI';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';

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

const PAGE_SIZE = 10;

const AddPrerequisiteSubjectVersionModal: React.FC<AddPrerequisiteSubjectVersionModalProps> = ({
  open,
  onClose,
  onAdd,
  currentSubjectVersionId,
  existingPrerequisites,
}) => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<SubjectVersionItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);
  const [subjectOptions, setSubjectOptions] = useState<{ id: number; code: string; name: string }[]>([]);
  const [subjectOptionsPage, setSubjectOptionsPage] = useState(1);
  const [subjectOptionsHasMore, setSubjectOptionsHasMore] = useState(true);
  const [subjectOptionsLoading, setSubjectOptionsLoading] = useState(false);
  const [subjectOptionsSearch, setSubjectOptionsSearch] = useState('');

  // Fetch a page of subject options
  const fetchSubjectOptions = async (reset = false, searchValue = subjectOptionsSearch) => {
    setSubjectOptionsLoading(true);
    try {
      const pageNumber = reset ? 1 : subjectOptionsPage;
      const pageSize = 20;
      const res = await FetchSubjectList(pageNumber, pageSize, searchValue);
      const items = (res?.items || []).map((s: any) => ({
        id: s.id,
        code: s.subjectCode,
        name: s.subjectName,
      }));
      setSubjectOptions(prev => reset ? items : [...prev, ...items]);
      setSubjectOptionsHasMore(items.length === pageSize);
      setSubjectOptionsPage(reset ? 2 : pageNumber + 1);
    } catch (err: any) {
      setSubjectOptionsHasMore(false);
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error('Failed to load subjects: ' + errorMessage);
    } finally {
      setSubjectOptionsLoading(false);
    }
  };

  // Reset subject options when modal opens or search changes
  useEffect(() => {
    if (open) {
      setSubjectOptions([]);
      setSubjectOptionsPage(1);
      setSubjectOptionsHasMore(true);
      setSubjectOptionsSearch('');
      fetchSubjectOptions(true, '');
    }
    // eslint-disable-next-line
  }, [open]);

  // Fetch subject versions
  const fetchData = async (reset = false, customPage?: number) => {
    setLoading(true);
    try {
      let items: any[] = [];
      
      if (selectedSubjectId) {
        // Use the dedicated API for filtering by subject ID
        const res = await FetchSubjectVersionBySubjectId(selectedSubjectId);
        items = (res || []).map((item: any) => ({
          id: item.id,
          subjectCode: item.subjectCode || (item.subject?.subjectCode),
          versionCode: item.versionCode,
          subjectName: item.subjectName || (item.subject?.subjectName),
        }));
        setData(prev => reset ? items : [...prev, ...items]);
        setHasMore(false); // No pagination for filtered results
      } else {
        // Use the paged API for general listing
        const pageNumber = reset ? 1 : (customPage || page);
        const pageSize = PAGE_SIZE;
        const searchValue = search.trim() || undefined;
        const res = await FetchPagedSubjectVersionList(pageNumber, pageSize, searchValue);
        items = (res?.items || []).map((item: any) => ({
          id: item.id,
          subjectCode: item.subjectCode || (item.subject?.subjectCode),
          versionCode: item.versionCode,
          subjectName: item.subjectName || (item.subject?.subjectName),
        }));
        setData(prev => reset ? items : [...prev, ...items]);
        setHasMore(items.length === PAGE_SIZE);
        setPage(reset ? 2 : pageNumber + 1);
      }
    } catch (err: any) {
      setHasMore(false);
      const errorMessage = getUserFriendlyErrorMessage(err);
      message.error('Failed to load subject versions: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset state and fetch first page when modal opens
  useEffect(() => {
    if (open) {
      setData([]);
      setPage(1);
      setHasMore(true);
      setSearch('');
      setSelectedSubjectId(undefined);
      fetchData(true, 1);
    }
    // DO NOT include fetchData in deps
    // eslint-disable-next-line
  }, [open]);

  // Fetch first page when search/filter changes (but not on modal open)
  useEffect(() => {
    if (open) {
      setData([]);
      setPage(1);
      setHasMore(true);
      fetchData(true, 1);
    }
    // DO NOT include fetchData in deps
    // eslint-disable-next-line
  }, [search, selectedSubjectId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSubjectFilterChange = (value: number | undefined) => {
    setSelectedSubjectId(value);
  };

  // Handle subject dropdown search
  const handleSubjectDropdownSearch = (value: string) => {
    setSubjectOptionsSearch(value);
    setSubjectOptions([]);
    setSubjectOptionsPage(1);
    setSubjectOptionsHasMore(true);
    fetchSubjectOptions(true, value);
  };

  // Handle subject dropdown scroll
  const handleSubjectDropdownScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 32 &&
      subjectOptionsHasMore &&
      !subjectOptionsLoading
    ) {
      fetchSubjectOptions(false);
    }
  };

  const handleSubjectVersionListScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 32 &&
      hasMore &&
      !loading
    ) {
      loadMore();
    }
  };

  const handleAdd = async (item: SubjectVersionItem) => {
    if (item.id === currentSubjectVersionId || existingPrerequisites.includes(item.id)) {
      return;
    }
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
      style={{
        padding: '16px',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        marginBottom: '8px',
        backgroundColor: '#fff',
        transition: 'all 0.3s ease',
        cursor: isAlreadyPrerequisite(item) ? 'not-allowed' : 'pointer',
        opacity: isAlreadyPrerequisite(item) ? 0.6 : 1,
      }}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              {item.subjectCode} v{item.versionCode}
            </Text>
            {isAlreadyPrerequisite(item) && (
              <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                {item.id === currentSubjectVersionId ? '(Current Version)' : '(Already Added)'}
              </Text>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {item.subjectName}
          </Text>
        </div>
        <Space>
          {isAlreadyPrerequisite(item) ? (
            <Button
              type="text"
              icon={<CheckOutlined />}
              style={{ color: '#52c41a' }}
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
              style={{
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
              }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusOutlined style={{ color: '#1890ff' }} />
          <span>Add Prerequisite Subject Version</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{ top: 20 }}
      styles={{
        body: { padding: '24px', maxHeight: '70vh', overflow: 'hidden' }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Search and Filter Section */}
        <Card 
          size="small" 
          style={{ 
            marginBottom: '16px', 
            backgroundColor: '#fafafa',
            border: '1px solid #e8e8e8'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <SearchOutlined style={{ color: '#8c8c8c' }} />
              <Input
                placeholder="Search by subject code or name..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ flex: 1 }}
                allowClear
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <FilterOutlined style={{ color: '#8c8c8c' }} />
              <Select
                placeholder="Filter by subject..."
                value={selectedSubjectId}
                onChange={handleSubjectFilterChange}
                allowClear
                style={{ flex: 1 }}
                showSearch
                onSearch={handleSubjectDropdownSearch}
                filterOption={false}
                onPopupScroll={handleSubjectDropdownScroll}
                notFoundContent={subjectOptionsLoading ? <Spin size="small" /> : null}
              >
                {subjectOptions.map(subject => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </Option>
                ))}
                {subjectOptionsLoading && (
                  <Option disabled key="loading">
                    <Spin size="small" />
                  </Option>
                )}
              </Select>
            </div>
          </Space>
        </Card>

        {/* Results Section */}
        <div style={{ flex: 1, overflow: 'hidden', height: 350 }}>
          <div style={{ height: '100%', overflow: 'auto' }} onScroll={handleSubjectVersionListScroll}>
            <List
              dataSource={data}
              renderItem={renderItem}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Text type="secondary">No subject versions found</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Try adjusting your search or filter criteria
                    </Text>
                  </div>
                ),
              }}
              style={{ minHeight: 300 }}
            />
            {/* Infinite scroll spinner */}
            {hasMore && loading && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <Spin size="small" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddPrerequisiteSubjectVersionModal; 