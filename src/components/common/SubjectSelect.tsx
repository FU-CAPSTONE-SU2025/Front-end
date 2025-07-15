import React, { useEffect, useState, useRef } from 'react';
import { Select, Spin } from 'antd';
import { Subject } from '../../interfaces/ISchoolProgram';
import { useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';

interface SubjectSelectProps {
  value?: number | number[];
  onChange?: (value: number | number[]) => void;
  multiple?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  disabledIds?: number[];
}

const PAGE_SIZE = 20;

const SubjectSelect: React.FC<SubjectSelectProps> = ({
  value,
  onChange,
  multiple = false,
  placeholder = 'Select subject(s)',
  style,
  disabledIds = [],
}) => {
  const { getAllSubjects,subjectList } = useCRUDSubject();
  const [options, setOptions] = useState<Subject[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch subjects on search or page change
  useEffect(() => {
    setLoading(true);
    const params = {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      filterType: search ? 'search' : undefined,
      filterValue: search || undefined,
    };
    getAllSubjects(params);
  }, [search, page, getAllSubjects]);

  // Update options when subjectList changes
  useEffect(() => {
    setLoading(false);
    if (page === 1) {
      setOptions(subjectList);
    } else {
      setOptions(prev => [
        ...prev,
        ...subjectList.filter(s => !prev.some(p => p.id === s.id))
      ]);
    }
    setHasMore(subjectList.length === PAGE_SIZE);
  }, [subjectList, page]);

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Debounced search
  let searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
    }, 400);
  };

  // Fetch next page on scroll
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const target = e.target as HTMLDivElement;
    if (!loading && hasMore && target.scrollTop + target.offsetHeight >= target.scrollHeight - 32) {
      setPage(prev => prev + 1);
    }
  };

  // Option rendering
  const renderOption = (subject: Subject) => (
    <Select.Option key={subject.id} value={subject.id} disabled={disabledIds.includes(subject.id)}>
      <span style={{ fontWeight: 700, color: '#64748b', minWidth: 40, fontSize: 13 }}>#{subject.id}</span>
      <span style={{ fontWeight: 500, fontSize: 15, marginLeft: 8 }}>{subject.subjectName}</span>
      <span style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600, fontSize: 13, background: '#e0e7ff', borderRadius: 6, padding: '2px 8px', marginLeft: 8 }}>{subject.subjectCode}</span>
    </Select.Option>
  );

  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      onPopupScroll={handlePopupScroll}
      notFoundContent={loading ? <Spin size="small" /> : null}
      allowClear
      optionLabelProp="children"
    >
      {options.map(renderOption)}
    </Select>
  );
};

export default SubjectSelect; 