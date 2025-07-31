import React, { useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, message, Affix, Table, Flex, Pagination, Tag, Spin, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../../components/manager/statusBadge';
import { useNavigate } from 'react-router';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useCRUDCurriculum, useCRUDSubjectVersion } from '../../hooks/useCRUDSchoolMaterial';
import { SubjectVersionWithCurriculumInfo, Subject, SubjectVersion } from '../../interfaces/ISchoolProgram';
import { AddSubjectVersionToCurriculum } from '../../api/SchoolAPI/curriculumAPI';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
const { Option } = Select;

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'in-active', label: 'Inactive' },
];

const HomePage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState<any>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  // API integration
  const {
    getCurriculumMutation,
    addCurriculumMutation,
    updateCurriculumMutation,
    fetchCurriculumSubjectVersionsMutation,
    fetchSubjectsMutation,
    curriculumList,
    paginationCurriculum,
    isLoading
  } = useCRUDCurriculum();

  const { getSubjectVersionMutation } = useCRUDSubjectVersion();

  // State for subject versions in the selected curriculum
  const [curriculumSubjectVersions, setCurriculumSubjectVersions] = useState<SubjectVersionWithCurriculumInfo[]>([]);
  const [isLoadingSubjectVersions, setIsLoadingSubjectVersions] = useState(false);
  
  // State for add subject version functionality
  const [addSubjectVersionModalOpen, setAddSubjectVersionModalOpen] = useState(false);
  const [allSubjectVersions, setAllSubjectVersions] = useState<SubjectVersion[]>([]);
  const [addSubjectVersionForm, setAddSubjectVersionForm] = useState<{
    subjectVersionId?: number;
    semesterNumber?: number;
    isMandatory?: boolean;
  }>({});
  const [isAddingSubjectVersion, setIsAddingSubjectVersion] = useState(false);
  
  // Pagination state for subject versions
  const [subjectVersionPage, setSubjectVersionPage] = useState(1);
  const [subjectVersionPageSize] = useState(10);
  const [hasMoreSubjectVersions, setHasMoreSubjectVersions] = useState(true);

  // Fetch curriculums on mount and when search/page changes
  React.useEffect(() => {
    getCurriculumMutation.mutate({
      pageNumber: currentPage,
      pageSize,
      filterValue: search
    });
  }, [currentPage, pageSize, search]);

  // Fetch subject versions when subjects modal opens
  React.useEffect(() => {
    if (subjectsModalOpen) {
      getSubjectVersionMutation.mutate({ 
        pageNumber: subjectVersionPage, 
        pageSize: subjectVersionPageSize 
      });
    }
  }, [subjectsModalOpen, subjectVersionPage]);

  // Update all subject versions when fetched
  React.useEffect(() => {
    if (getSubjectVersionMutation.data) {
      const newVersions = getSubjectVersionMutation.data.items || [];
      if (subjectVersionPage === 1) {
        setAllSubjectVersions(newVersions);
      } else {
        setAllSubjectVersions(prev => {
          // Create a Set of existing IDs to avoid duplicates
          const existingIds = new Set(prev.map(v => `${v.subjectId}-${v.id}`));
          const uniqueNewVersions = newVersions.filter(v => !existingIds.has(`${v.subjectId}-${v.id}`));
          return [...prev, ...uniqueNewVersions];
        });
      }
      
      // Check if there are more pages
      const totalPages = Math.ceil(getSubjectVersionMutation.data.totalCount / subjectVersionPageSize);
      setHasMoreSubjectVersions(subjectVersionPage < totalPages);
    }
  }, [getSubjectVersionMutation.data, subjectVersionPage]);

  // Load more subject versions
  const loadMoreSubjectVersions = () => {
    if (hasMoreSubjectVersions && !getSubjectVersionMutation.isPending) {
      setSubjectVersionPage(prev => prev + 1);
    }
  };

  // Compute available subject versions to add (subject versions not already in curriculum)
  const availableSubjectVersions = allSubjectVersions.filter(
    version => !curriculumSubjectVersions.some(csv => csv.id === version.id)
  );

  // Table columns - simplified structure
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Code',
      dataIndex: 'curriculumCode',
      key: 'curriculumCode',
      width: 140,
      align: 'center' as const,
    },
    {
      title: 'Name',
      dataIndex: 'curriculumName',
      key: 'curriculumName',
      width: 250,
      align: 'left' as const,
    },
    {
      title: 'View Subject Versions',
      key: 'addSubjects',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={() => onManageSubjects(record)}
          style={{ 
            backgroundColor: '#f97316',
            borderColor: '#f97316',
            borderRadius: 6
          }}
          size="small"
        >
          View Subject Versions
        </Button>
      ),
    },
  ];

  // Subject version table columns for the subjects modal
  const subjectVersionColumns = [
    {
      title: 'Subject Code',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (text: string) => (
        <span style={{ fontWeight: '600', color: '#1E40AF' }}>{text}</span>
      ),
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Version',
      dataIndex: 'versionName',
      key: 'versionName',
      render: (text: string, record: SubjectVersionWithCurriculumInfo) => (
        <span style={{ fontWeight: '600', color: '#059669' }}>
          {record.versionName} ({record.versionCode})
        </span>
      ),
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits: number) => (
        <Tag color="blue" style={{ fontWeight: '600' }}>
          {credits} credits
        </Tag>
      ),
    },
    {
      title: 'Semester',
      key: 'semester',
      render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
        <Tag color="green" style={{ fontWeight: '600' }}>
          Semester {record.semesterNumber}
        </Tag>
      ),
    },
    {
      title: 'Mandatory',
      key: 'isMandatory',
      render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
        <Tag color={record.isMandatory ? 'red' : 'orange'} style={{ fontWeight: '600' }}>
          {record.isMandatory ? 'Mandatory' : 'Optional'}
        </Tag>
      ),
    },
  ];

  // Handlers
  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const onEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const onDelete = (id: number) => {
    // TODO: Implement delete API call
    message.info('Delete API not implemented yet.');
  };

  const onManageSubjects = async (curriculum: any) => {
    setSelectedCurriculum(curriculum);
    setSubjectsModalOpen(true);
    setIsLoadingSubjectVersions(true);
    
    try {
      const versions = await fetchCurriculumSubjectVersionsMutation.mutateAsync(curriculum.id);
      setCurriculumSubjectVersions(versions || []);
    } catch (error) {
      console.error('Failed to fetch curriculum subjects:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
      setCurriculumSubjectVersions([]);
    } finally {
      setIsLoadingSubjectVersions(false);
    }
  };

  const onAddSubjectVersion = () => {
    setAddSubjectVersionForm({});
    setAddSubjectVersionModalOpen(true);
  };

  const handleAddSubjectVersion = async () => {
    if (!addSubjectVersionForm.subjectVersionId || !addSubjectVersionForm.semesterNumber) {
      message.error('Please select a subject version and semester.');
      return;
    }
    
    setIsAddingSubjectVersion(true);
    try {
      // Import the API function
     
      
      await AddSubjectVersionToCurriculum(selectedCurriculum.id, {
        subjectVersionId: addSubjectVersionForm.subjectVersionId,
        semesterNumber: addSubjectVersionForm.semesterNumber,
        isMandatory: !!addSubjectVersionForm.isMandatory,
      });
      
      message.success('Subject version added successfully!');
      setAddSubjectVersionModalOpen(false);
      setAddSubjectVersionForm({});
      
      // Refresh curriculum subjects
      const versions = await fetchCurriculumSubjectVersionsMutation.mutateAsync(selectedCurriculum.id);
      setCurriculumSubjectVersions(versions || []);
    } catch (error) {
      console.error('Failed to add subject version:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
    } finally {
      setIsAddingSubjectVersion(false);
    }
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        updateCurriculumMutation.mutate({
          id: editing.id,
          data: values
        }, {
          onSuccess: () => {
            message.success('Updated successfully!');
            setModalOpen(false);
            getCurriculumMutation.mutate({ pageNumber: currentPage, pageSize, filterValue: search });
          },
          onError: (error) => {
            const errorMessage = getUserFriendlyErrorMessage(error);
            message.error(errorMessage);
          }
        });
      } else {
        addCurriculumMutation.mutate(values, {
          onSuccess: () => {
            message.success('Added successfully!');
            setModalOpen(false);
            getCurriculumMutation.mutate({ pageNumber: currentPage, pageSize, filterValue: search });
          },
          onError: (error) => {
            const errorMessage = getUserFriendlyErrorMessage(error);
            message.error(errorMessage);
          }
        });
      }
    });
  };

  // Use API-driven data
  const pagedData = curriculumList;

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div className={`${styles.sttToolbar} ${glassStyles.appleGlassCard}`}>
          <Input
            placeholder="Search by code, name, or description..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
            className={glassStyles.appleGlassInput}
          />
        </div>
      </Affix>
      {/* Curriculum Table */}
      <div>
        <Table
          columns={columns}
          dataSource={pagedData}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </div>
      {/* Pagination */}
      {paginationCurriculum && paginationCurriculum.total > 0 && (
        <div style={{marginTop: 32, display: 'flex', justifyContent: 'center'}}>
          <Pagination
            current={paginationCurriculum.current}
            pageSize={paginationCurriculum.pageSize}
            total={paginationCurriculum.total}
            showSizeChanger
            pageSizeOptions={[5, 10, 20, 50]}
            onChange={(p, ps) => { setCurrentPage(p); setPageSize(ps); }}
            style={{borderRadius: 8}}
          />
        </div>
      )}

      {/* Curriculum Edit/Add Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal
            open={modalOpen}
            title={editing ? 'Update Curriculum' : 'Add Curriculum'}
            onCancel={() => setModalOpen(false)}
            onOk={handleOk}
            okText={editing ? 'Update' : 'Add'}
            cancelText="Cancel"
            centered
            footer={null}
            width={480}
            destroyOnClose
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'pending', totalCredit: 120 }}
                onFinish={handleOk}
              >
                <Form.Item
                  name="curriculumCode"
                  label="Curriculum Code"
                  rules={[{ required: true, message: 'Please enter curriculum code!' }]}
                >
                  <Input placeholder="Enter curriculum code" />
                </Form.Item>
                <Form.Item
                  name="curriculumName"
                  label="Name"
                  rules={[{ required: true, message: 'Please enter name!' }]}
                >
                  <Input placeholder="Enter curriculum name" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Please enter description!' }]}
                >
                  <Input.TextArea placeholder="Enter description" rows={2} />
                </Form.Item>
                <Form.Item
                  name="decisionNo"
                  label="Decision No"
                  rules={[{ required: true, message: 'Please enter decision number!' }]}
                >
                  <Input placeholder="Enter decision number" />
                </Form.Item>
                <Form.Item
                  name="decisionDate"
                  label="Decision Date (MM/dd/yyyy)"
                  rules={[{ required: true, message: 'Please enter decision date!' }]}
                >
                  <Input placeholder="MM/dd/yyyy" />
                </Form.Item>
                <Form.Item
                  name="totalCredit"
                  label="Total Credit"
                  rules={[{ required: true, message: 'Please enter total credit!' }]}
                >
                  <InputNumber min={1} max={300} placeholder="Enter total credit" style={{width: '100%'}} />
                </Form.Item>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select>
                    {statusOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16}}>
                  <Button onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editing ? 'Update' : 'Add'}
                  </Button>
                </div>
              </Form>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Subjects Management Modal */}
      <Modal
        open={subjectsModalOpen}
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            color: '#1E40AF',
            fontWeight: '600'
          }}>
            <BookOutlined style={{ fontSize: '18px' }} />
            View Subject Versions - {selectedCurriculum?.curriculumName || 'Curriculum'}
          </div>
        }
        onCancel={() => setSubjectsModalOpen(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setSubjectsModalOpen(false)}
            style={{ borderRadius: 6 }}
          >
            Close
          </Button>
        ]}
        width={900}
        destroyOnClose
        centered
        style={{
          borderRadius: 16
        }}
        bodyStyle={{
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8 
            }}>
              <BookOutlined style={{ color: '#1E40AF', fontSize: '18px' }} />
              <span style={{ fontWeight: '600', color: '#1E40AF' }}>
                Curriculum Subject Versions ({curriculumSubjectVersions.length})
              </span>
            </div>
          </div>
          {/* Filtering Information */}
          <div style={{ 
            background: 'rgba(59,130,246,0.05)', 
            border: '1px solid rgba(59,130,246,0.1)', 
            borderRadius: 8, 
            padding: '12px', 
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ 
                background: '#dbeafe', 
                color: '#1e40af', 
                padding: '2px 6px', 
                borderRadius: 4,
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {curriculumSubjectVersions.length}
              </span>
              subject versions in curriculum
            </div>
          </div>
          {isLoadingSubjectVersions ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin tip="Loading subjects..." />
            </div>
          ) : curriculumSubjectVersions.length > 0 ? (
            <Table
              dataSource={curriculumSubjectVersions}
              columns={subjectVersionColumns}
              rowKey="id"
              pagination={false}
              size="small"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(30,64,175,0.1)',
                border: '1px solid rgba(30,64,175,0.1)'
              }}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#64748b',
              background: 'rgba(30,64,175,0.05)',
              borderRadius: 16,
              border: '1px solid rgba(30,64,175,0.1)'
            }}>
              <BookOutlined style={{ fontSize: '48px', marginBottom: 16, opacity: 0.5, color: '#1E40AF' }} />
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                No subject versions assigned to this curriculum yet.
              </div>
              <div style={{ fontSize: '14px', opacity: 0.7, color: '#64748b' }}>
                No subject versions to display.
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        open={addSubjectVersionModalOpen}
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            color: '#1E40AF',
            fontWeight: '600'
          }}>
            <PlusOutlined style={{ fontSize: '18px' }} />
            Add Subject Version to Curriculum
          </div>
        }
        onCancel={() => setAddSubjectVersionModalOpen(false)}
        onOk={handleAddSubjectVersion}
        okText="Add Subject Version"
        cancelText="Cancel"
        confirmLoading={isAddingSubjectVersion}
        okButtonProps={{ 
          disabled: !addSubjectVersionForm.subjectVersionId || !addSubjectVersionForm.semesterNumber,
          style: {
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderRadius: 6
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 6
          }
        }}
        width={520}
        destroyOnClose
        centered
        style={{
          borderRadius: 16
        }}
        bodyStyle={{
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ 
            background: 'rgba(30,64,175,0.05)', 
            borderRadius: 12, 
            padding: '16px', 
            marginBottom: '20px',
            border: '1px solid rgba(30,64,175,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginBottom: '8px',
              color: '#1E40AF',
              fontWeight: '600'
            }}>
              <BookOutlined style={{ fontSize: '16px' }} />
              Available Subject Versions: {availableSubjectVersions.length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Select a subject version to add to {selectedCurriculum?.curriculumName || 'this curriculum'}
            </div>
          </div>

          <Form layout="vertical" size="large">
            <Form.Item
              label={
                <span style={{ fontWeight: '600', color: '#374151' }}>
                  Select Subject Version <span style={{ color: '#ef4444' }}>*</span>
                </span>
              }
              required
            >
              <Select
                showSearch
                placeholder="Search and choose a subject version to add..."
                value={addSubjectVersionForm.subjectVersionId}
                onChange={(value) => setAddSubjectVersionForm(prev => ({ ...prev, subjectVersionId: value }))}
                optionFilterProp="label"
                filterOption={(input, option) => {
                  const label = option?.label || '';
                  return label.toString().toLowerCase().includes(input.toLowerCase());
                }}
                onPopupScroll={(e) => {
                  const { target } = e;
                  const { scrollTop, scrollHeight, clientHeight } = target as HTMLElement;
                  if (scrollTop + clientHeight >= scrollHeight - 5) {
                    loadMoreSubjectVersions();
                  }
                }}
                loading={getSubjectVersionMutation.isPending}
                style={{ 
                  width: '100%',
                  borderRadius: 8
                }}
                size="large"
                notFoundContent={
                  getSubjectVersionMutation.isPending ? (
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                      <Spin size="small" />
                    </div>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                      <BookOutlined style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }} />
                      <div>No subject versions found</div>
                    </div>
                  )
                }
              >
                {availableSubjectVersions.map(version => (
                  <Option 
                    key={`${version.subjectId}-${version.id}`} 
                    value={version.id} 
                    label={`${version.subject.subjectName} (${version.subject.subjectCode}) - ${version.versionName}`}
                  >
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#1E40AF',
                        fontSize: '14px'
                      }}>
                        {version.subject.subjectName}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span style={{ 
                          background: '#e0e7ff', 
                          color: '#3730a3', 
                          padding: '2px 6px', 
                          borderRadius: 4,
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {version.subject.subjectCode}
                        </span>
                        <span>•</span>
                        <span style={{ 
                          color: '#059669',
                          fontWeight: '500'
                        }}>
                          {version.versionName} ({version.versionCode})
                        </span>
                        <span>•</span>
                        <span style={{ 
                          color: '#f59e0b',
                          fontWeight: '500'
                        }}>
                          {version.subject.credits} credits
                        </span>
                      </div>
                    </div>
                  </Option>
                ))}
                {hasMoreSubjectVersions && (
                  <Option key="load-more" value="load-more" disabled>
                    <div style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                      {getSubjectVersionMutation.isPending ? 'Loading...' : 'Scroll to load more'}
                    </div>
                  </Option>
                )}
              </Select>
              {availableSubjectVersions.length === 0 && (
                <div style={{ 
                  background: 'rgba(34,197,94,0.1)', 
                  border: '1px solid rgba(34,197,94,0.2)', 
                  borderRadius: 8, 
                  padding: '12px', 
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>
                    🎉 All subject versions are already added to this curriculum!
                  </div>
                  <div style={{ color: '#047857', fontSize: '12px', marginTop: 4 }}>
                    No more subject versions available to add.
                  </div>
                </div>
              )}
            </Form.Item>

            <Form.Item
              label={
                <span style={{ fontWeight: '600', color: '#374151' }}>
                  Semester <span style={{ color: '#ef4444' }}>*</span>
                </span>
              }
              required
            >
              <Input
                type="number"
                min={1}
                max={20}
                placeholder="Enter semester number (1-9)"
                value={addSubjectVersionForm.semesterNumber}
                onChange={(e) => setAddSubjectVersionForm(prev => ({ 
                  ...prev, 
                  semesterNumber: Number(e.target.value) 
                }))}
                style={{ 
                  width: '100%',
                  borderRadius: 8
                }}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ 
                background: 'rgba(59,130,246,0.05)', 
                border: '1px solid rgba(59,130,246,0.1)', 
                borderRadius: 8, 
                padding: '12px'
              }}>
                <Checkbox
                  checked={!!addSubjectVersionForm.isMandatory}
                  onChange={(e: any) => setAddSubjectVersionForm(prev => ({ 
                    ...prev, 
                    isMandatory: e.target.checked 
                  }))}
                  style={{ 
                    color: '#1e40af',
                    fontWeight: '500'
                  }}
                >
                  <span style={{ marginLeft: 8 }}>
                    Mark as <strong>Mandatory Subject Version</strong>
                  </span>
                </Checkbox>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#64748b', 
                  marginTop: 4, 
                  marginLeft: 24 
                }}>
                  Mandatory subject versions are required for all students in this curriculum
                </div>
              </div>
            </Form.Item>
          </Form>
        </motion.div>
      </Modal>
    </div>
  );
};

export default HomePage;