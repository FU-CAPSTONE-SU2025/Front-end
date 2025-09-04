import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Spin, Card, Table, Checkbox, Modal, List, Tag, Row, Col, Typography } from 'antd';
import { SaveOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Curriculum, SubjectVersion, SubjectVersionWithCurriculumInfo, Program, CreateSubjectToCurriculum } from '../../interfaces/ISchoolProgram';
import dayjs from 'dayjs';
import {useCRUDCurriculum, useCRUDSubjectVersion} from '../../hooks/useCRUDSchoolMaterial';
import styles from '../../css/staff/curriculumEdit.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useSchoolApi } from '../../hooks/useSchoolApi';

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

interface CurriculumEditProps {
  id?: number;
}

const CurriculumEdit: React.FC<CurriculumEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const isCreateMode = !id;
  const isEditMode = !!id;
  const { handleError, handleSuccess } = useApiErrorHandler();

  // API hooks
  const {
    addCurriculumMutation,
    updateCurriculumMutation,
    getCurriculumById,
    fetchCurriculumSubjectVersionsMutation,
  } = useCRUDCurriculum();

  const { getSubjectVersionMutation } = useCRUDSubjectVersion();
  const { usePagedProgramList, addSubjectVersionToCurriculum, removeSubjectVersionFromCurriculum } = useSchoolApi();

  const [loading, setLoading] = useState(false);

  // Program management state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programPage, setProgramPage] = useState(1);
  const [programPageSize] = useState(10);
  const [hasMorePrograms, setHasMorePrograms] = useState(true);
  const [programLoading] = useState(false);

  // Subject version management state
  const [allSubjectVersions, setAllSubjectVersions] = useState<SubjectVersion[]>([]);
  const [curriculumSubjectVersions, setCurriculumSubjectVersions] = useState<SubjectVersionWithCurriculumInfo[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Modal state for adding subject versions
  const [isAddSubjectModalVisible, setIsAddSubjectModalVisible] = useState(false);
  const [selectedSubjectVersion, setSelectedSubjectVersion] = useState<SubjectVersion | null>(null);
  const [searchSubjectVersion, setSearchSubjectVersion] = useState('');
  const [modalSemesterNumber, setModalSemesterNumber] = useState<number>(1);
  const [modalIsMandatory, setModalIsMandatory] = useState<boolean>(true);
  
  // Pagination state for subject versions
  const [subjectVersionPage, setSubjectVersionPage] = useState(1);
  const [subjectVersionPageSize] = useState(10);
  const [hasMoreSubjectVersions, setHasMoreSubjectVersions] = useState(true);
  const [isProgressiveFetching, setIsProgressiveFetching] = useState(false);
  const [maxPageReached, setMaxPageReached] = useState(false);

  // Use the hook to get programs
  const { data: programsData, isLoading: programsLoading } = usePagedProgramList(programPage, programPageSize);
  
  // Update programs when data is loaded
  useEffect(() => {
    if (programsData?.items) {
      const newPrograms = programsData.items;
      if (programPage === 1) {
        setPrograms(newPrograms);
      } else {
        setPrograms(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPrograms = newPrograms.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPrograms];
        });
      }
      
      // Check if there are more pages
      const totalPages = Math.ceil(programsData.totalCount / programPageSize);
      setHasMorePrograms(programPage < totalPages);
    }
  }, [programsData, programPage, programPageSize]);

  // Fetch programs function (legacy for compatibility)
  const fetchPrograms = async (page: number = 1) => {
    setProgramPage(page);
  };

  // Load more programs
  const loadMorePrograms = () => {
    if (hasMorePrograms && !programLoading) {
      const nextPage = programPage + 1;
      setProgramPage(nextPage);
      fetchPrograms(nextPage);
    }
  };

  // Fetch curriculum by ID on mount (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      getCurriculumById.mutate(id);
    }
  }, [id, isEditMode]);

  // Set form fields when data is loaded
  useEffect(() => {
    if (isEditMode && getCurriculumById.data) {
      const c = getCurriculumById.data;
      form.setFieldsValue({
        ...c,
        effectiveDate: dayjs(c.effectiveDate)
      });
    }
  }, [getCurriculumById.data, isEditMode, form]);

  // Fetch subject versions on mount or when page changes
  useEffect(() => {
    getSubjectVersionMutation.mutate({ 
      pageNumber: subjectVersionPage, 
      pageSize: subjectVersionPageSize 
    });
    // If in edit mode, fetch subject versions already in this curriculum
    if (id) {
      fetchCurriculumSubjectVersionsMutation.mutate(id);
    }
  }, [id, subjectVersionPage]);

  // Update all subject versions when fetched
  useEffect(() => {
    const data = getSubjectVersionMutation.data?.items;
    if (Array.isArray(data)) {
      if (subjectVersionPage === 1) {
        setAllSubjectVersions(data);
      } else {
        setAllSubjectVersions(prev => {
          const existingIds = new Set(prev.map(v => `${v.subjectId}-${v.id}`));
          const uniqueNewVersions = data.filter(v => !existingIds.has(`${v.subjectId}-${v.id}`));
          return [...prev, ...uniqueNewVersions];
        });
      }
      const totalPages = Math.ceil((getSubjectVersionMutation.data?.totalCount || 0) / subjectVersionPageSize);
      setHasMoreSubjectVersions(subjectVersionPage < totalPages);
    } else if (subjectVersionPage === 1) {
      setAllSubjectVersions([]);
    }
  }, [getSubjectVersionMutation.data, subjectVersionPage]);

  // Update curriculum subject versions when fetched
  useEffect(() => {
    const data = fetchCurriculumSubjectVersionsMutation.data;
    if (Array.isArray(data)) {
      setCurriculumSubjectVersions(data);
    } else {
      setCurriculumSubjectVersions([]);
    }
  }, [fetchCurriculumSubjectVersionsMutation.data]);

  // Load more subject versions
  const loadMoreSubjectVersions = () => {
    if (hasMoreSubjectVersions && !getSubjectVersionMutation.isPending) {
      setSubjectVersionPage(prev => prev + 1);
    }
  };

  // Compute available subject versions to add using useMemo for optimization
  const availableSubjectVersions = useMemo(() => {
    // Ensure both arrays are defined
    const safeCurriculumVersions = curriculumSubjectVersions || [];
    const safeAllVersions = allSubjectVersions || [];
    
    if (safeCurriculumVersions.length > 0) {
      // Filter out versions that are already in the curriculum
      return safeAllVersions.filter(
        version => !safeCurriculumVersions.some(csv => csv.subjectVersionId === version.id)
      );
    } else {
      // If no curriculum subject versions, all subject versions are available
      return safeAllVersions;
    }
  }, [curriculumSubjectVersions, allSubjectVersions]);

  // Memoize filtered subject versions for the modal to prevent unnecessary re-filtering
  const filteredSubjectVersions = useMemo(() => {
    if (!searchSubjectVersion.trim()) {
      return availableSubjectVersions;
    }
    
    const searchLower = searchSubjectVersion.toLowerCase();
    return availableSubjectVersions.filter(subjectVersion =>
      subjectVersion.subject.subjectName.toLowerCase().includes(searchLower) ||
      subjectVersion.subject.subjectCode.toLowerCase().includes(searchLower) ||
      subjectVersion.versionName.toLowerCase().includes(searchLower)
    );
  }, [availableSubjectVersions, searchSubjectVersion]);

  // Progressive pagination: fetch next page if filtered results are empty
  const checkAndFetchNextPage = useCallback(async () => {
    if (isProgressiveFetching || maxPageReached || !hasMoreSubjectVersions) return;

    // If filtered results are empty and we have more pages, fetch next page
    if (filteredSubjectVersions.length === 0 && hasMoreSubjectVersions && !getSubjectVersionMutation.isPending) {
      setIsProgressiveFetching(true);
      try {
        setSubjectVersionPage(prev => prev + 1);
      } catch (error) {
        console.error('Progressive fetch failed:', error);
        setMaxPageReached(true);
      } finally {
        setIsProgressiveFetching(false);
      }
    }
  }, [filteredSubjectVersions.length, isProgressiveFetching, maxPageReached, hasMoreSubjectVersions, getSubjectVersionMutation.isPending]);

  // Check if we need to auto-load more when list doesn't fill container
  const checkAutoLoad = useCallback(() => {
    if (!hasMoreSubjectVersions || getSubjectVersionMutation.isPending || isProgressiveFetching) return;
    
    // If we have fewer than 4 results and more pages available, auto-load
    if (filteredSubjectVersions.length < 4 && hasMoreSubjectVersions) {
      loadMoreSubjectVersions();
    }
  }, [filteredSubjectVersions.length, hasMoreSubjectVersions, getSubjectVersionMutation.isPending, isProgressiveFetching]);

  // Check for progressive fetching when available versions or search changes
  useEffect(() => {
    if (isAddSubjectModalVisible && availableSubjectVersions.length > 0) {
      checkAndFetchNextPage();
    }
  }, [isAddSubjectModalVisible, availableSubjectVersions.length, checkAndFetchNextPage]);

  // Auto-load more when list doesn't have enough items to fill container
  useEffect(() => {
    if (isAddSubjectModalVisible && availableSubjectVersions.length > 0) {
      // Use setTimeout to ensure DOM is updated before checking
      const timer = setTimeout(checkAutoLoad, 100);
      return () => clearTimeout(timer);
    }
  }, [isAddSubjectModalVisible, availableSubjectVersions.length, checkAutoLoad]);

  // Refresh curriculum subject versions after adding/removing
  const refreshCurriculumSubjectVersions = useCallback(() => {
    if (id) {
      fetchCurriculumSubjectVersionsMutation.mutate(id);
    }
  }, [id, fetchCurriculumSubjectVersionsMutation]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const curriculumData: Partial<Curriculum> = {
        ...values,
        effectiveDate: values.effectiveDate.toDate(),
        programId: values.programId
      };

      if (isCreateMode) {
        await addCurriculumMutation.mutateAsync(curriculumData as Curriculum);
        handleSuccess('Curriculum created successfully!');
        form.resetFields();
      } else if (id) {
        // Ensure all required fields are non-undefined for update
        const updateData = {
          ...curriculumData,
          programId: Number(curriculumData.programId),
          curriculumCode: curriculumData.curriculumCode ?? '',
          curriculumName: curriculumData.curriculumName ?? '',
          effectiveDate: curriculumData.effectiveDate as Date // ensure effectiveDate is always Date, not undefined
        };
        await updateCurriculumMutation.mutateAsync({ id, data: updateData });
        handleSuccess('Curriculum updated successfully!');
      }
    } catch (error) {
      handleError(error, 'Curriculum operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleAddSubjectClick = () => {
    setIsAddSubjectModalVisible(true);
    setSearchSubjectVersion('');
    setSelectedSubjectVersion(null);
    setModalSemesterNumber(1);
    setModalIsMandatory(true);
    // Reset progressive fetching state
    setIsProgressiveFetching(false);
    setMaxPageReached(false);
  };

  const handleAddSubjectModalClose = () => {
    setIsAddSubjectModalVisible(false);
    setSearchSubjectVersion('');
    setSelectedSubjectVersion(null);
    setModalSemesterNumber(1);
    setModalIsMandatory(true);
    // Reset progressive fetching state
    setIsProgressiveFetching(false);
    setMaxPageReached(false);
  };

  const handleSubjectVersionSelect = (subjectVersion: SubjectVersion) => {
    setSelectedSubjectVersion(subjectVersion);
  };

  // Add subject version handler (using curriculum API)
  const handleAddSubjectVersion = async () => {
    if (!selectedSubjectVersion || !modalSemesterNumber) {
      handleError('Please select a subject version and semester.', 'Validation Error');
      return;
    }
    if (modalSemesterNumber > 9 || modalSemesterNumber < 1) {
      handleError('Invalid semester number. Semester must be from 1 to 9', 'Validation Error');
      return;
    }
    const requestData: CreateSubjectToCurriculum = {
      subjectVersionId: selectedSubjectVersion.id,
      semesterNumber: modalSemesterNumber,
      isMandatory: modalIsMandatory
    };
    setAddLoading(true);
    try {
      await addSubjectVersionToCurriculum({
        curriculumId: id!,
        createSubjectToCurriculum: requestData
      });
      handleSuccess('Subject version added successfully');
      
      // Reset selection
      setSelectedSubjectVersion(null);
      setModalSemesterNumber(1);
      setModalIsMandatory(false);
      
      // Only refresh curriculum subject versions - no need to refetch all subject versions
      refreshCurriculumSubjectVersions();
      
      // Close modal after successful addition
      handleAddSubjectModalClose();
    } catch (e) {
      handleError(e, 'Failed to add subject version');
    } finally {
      setAddLoading(false);
    }
  };

  // Delete subject version handler (using curriculum API)
  const handleDeleteSubjectVersion = (subjectVersionId: number) => {
    Modal.confirm({
      title: 'Remove Subject Version',
      content: 'Are you sure you want to remove this subject version from the curriculum?',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      width: 400,
      footer: (
        <div className={styles.modalFooter}>
          <Button onClick={() => Modal.destroyAll()}>
            Cancel
          </Button>
          <Button 
            danger 
            onClick={async () => {
              setDeleteLoading(subjectVersionId);
              try {
                await removeSubjectVersionFromCurriculum({
                  subjectVersionId: subjectVersionId,
                  curriculumId: id!
                });
                handleSuccess('Subject version removed successfully');
                
                // Refresh curriculum subject versions
                refreshCurriculumSubjectVersions();
              } catch (e) {
                handleError(e, 'Failed to remove subject version');
              } finally {
                setDeleteLoading(null);
              }
              Modal.destroyAll();
            }}
          >
            Remove
          </Button>
        </div>
      ),
    });
  };

  // Show loading spinner if fetching data
  if (isEditMode && getCurriculumById.isPending) {
    return <Spin tip="Loading curriculum..." className={styles.loadingSpinner} />;
  }

  return (
    <div className={styles.curriculumContainer}>
      {/* Curriculum Information Card */}
      <Card 
        title={
          <div className={styles.cardTitle}>
            📋 Curriculum Information
          </div>
        } 
        className={styles.curriculumInfoCard}
        classNames={{
          header: styles.cardHeader,
          body: styles.cardBody
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.curriculumForm}
        >
          <Form.Item
            label="Program"
            name="programId"
            rules={[{ required: true, message: 'Please select a program!' }]}
          >
            <Select
              placeholder="Select a program"
              className={styles.formSelect}
              loading={programLoading}
              onPopupScroll={(e) => {
                const { target } = e;
                const { scrollTop, scrollHeight, clientHeight } = target as HTMLElement;
                if (scrollTop + clientHeight >= scrollHeight - 5) {
                  loadMorePrograms();
                }
              }}
              notFoundContent={
                programLoading ? (
                  <div className={styles.notFoundContentLoading}>
                    <Spin size="small" />
                  </div>
                ) : (
                  <div className={styles.notFoundContentEmpty}>
                    No programs found
                  </div>
                )
              }
            >
              {(programs || []).map(program => (
                <Option key={program.id} value={program.id}>
                  {program.programName} ({program.programCode})
                </Option>
              ))}
              {hasMorePrograms && (
                <Option key="load-more" value="load-more" disabled>
                  <div className={styles.loadMoreOption}>
                    {programLoading ? 'Loading...' : 'Scroll to load more'}
                  </div>
                </Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Curriculum Code"
            name="curriculumCode"
            rules={[
              { required: true, message: 'Please enter curriculum code!' },
              { min: 2, message: 'Curriculum code must be at least 2 characters!' }
            ]}
          >
            <Input 
              placeholder="e.g., CS2023" 
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item
            label="Curriculum Name"
            name="curriculumName"
            rules={[
              { required: true, message: 'Please enter curriculum name!' },
              { min: 3, message: 'Curriculum name must be at least 3 characters!' }
            ]}
          >
            <Input 
              placeholder="e.g., Computer Science 2023 Curriculum" 
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item
            label="Effective Date"
            name="effectiveDate"
            rules={[{ required: true, message: 'Please select effective date!' }]}
          >
            <DatePicker 
              className={styles.datePicker}
              placeholder="Select effective date"
            />
          </Form.Item>

          <Form.Item className={styles.formActions}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className={styles.saveButton}
              >
                {isCreateMode ? 'Create Curriculum' : 'Update Curriculum'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Subject Versions Management Card - Only show in edit mode */}
      {isEditMode && (
        <Card
        rootClassName={styles.subjectsCardContainer} 
          title={
            <div className={styles.cardTitle}>
              Manage Subject Versions in Curriculum
            </div>
          } 
          className={styles.subjectsCard}
          classNames={{
            header: styles.cardHeader,
            body: styles.cardBody
          }}
        >
          <div className={styles.addSubjectControls}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSubjectClick}
              className={styles.addSubjectButton}
            >
              Add Subject Version
            </Button>
          </div>
          <Table
            dataSource={curriculumSubjectVersions || []}
            rowKey="subjectVersionId"
            columns={[
              {
                title: 'Subject Code',
                dataIndex: 'subjectCode',
                key: 'subjectCode',
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
              },
              {
                title: 'Semester',
                key: 'semester',
                render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
                  <span className={styles.semesterCell}>
                    {record.semesterNumber}
                  </span>
                ),
              },
              {
                title: 'isMandatory',
                key: 'isMandatory',
                render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
                  <span style={{ 
                    color: record.isMandatory ? '#dc2626' : '#ea580c',
                    fontWeight: '600'
                  }}>
                    {record.isMandatory ? 'Mandatory' : 'Optional'}
                  </span>
                ),
              },
              {
                title: 'Action',
                key: 'action',
                render: (_: any, record: SubjectVersionWithCurriculumInfo) => (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleteLoading === record.subjectVersionId}
                    onClick={() => handleDeleteSubjectVersion(record.subjectVersionId)}
                    className={styles.deleteButton}
                  />
                ),
              },
            ]}
            pagination={false}
            size="small"
            className={styles.subjectsTable}
          />
        </Card>
      )}

      {/* Add Subject Version Modal */}
      <Modal
        open={isAddSubjectModalVisible}
        onCancel={handleAddSubjectModalClose}
        title="Add Subject Version to Curriculum"
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <Row gutter={[24, 24]}>
          {/* Left Side - Subject Version List */}
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Select Subject Version
              </Text>
              <Search
                placeholder="Search subject versions..."
                value={searchSubjectVersion}
                onChange={(e) => setSearchSubjectVersion(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {getSubjectVersionMutation.isPending && subjectVersionPage === 1 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading subject versions...</div>
              </div>
            ) : (
              <div 
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                onScroll={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 2 && hasMoreSubjectVersions && !getSubjectVersionMutation.isPending) {
                    loadMoreSubjectVersions();
                  }
                }}
              >
                <List
                  dataSource={filteredSubjectVersions}
                  renderItem={(subjectVersion) => (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedSubjectVersion?.id === subjectVersion.id ? '#f0f9ff' : 'transparent',
                        border: selectedSubjectVersion?.id === subjectVersion.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        padding: '16px'
                      }}
                      onClick={() => handleSubjectVersionSelect(subjectVersion)}
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <Text strong style={{ fontSize: '16px' }}>
                              {subjectVersion.subject.subjectName} ({subjectVersion.subject.subjectCode})
                            </Text>
                            <br />
                            <Text type="secondary">
                              Version: {subjectVersion.versionName} ({subjectVersion.versionCode})
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Tag color="blue">{subjectVersion.subject.credits} credits</Tag>
                            <Tag color={subjectVersion.isActive ? 'green' : 'red'}>
                              {subjectVersion.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                          </div>
                        </div>
                        {subjectVersion.description && (
                          <Text type="secondary" style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>
                            {subjectVersion.description}
                          </Text>
                        )}
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No subject versions found.' }}
                />
                {(getSubjectVersionMutation.isPending && hasMoreSubjectVersions && subjectVersionPage > 1) && (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Spin size="small" />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>Loading more...</div>
                  </div>
                )}
                {isProgressiveFetching && (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Spin size="small" />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>Searching for available subjects...</div>
                  </div>
                )}
              </div>
            )}
          </Col>

          {/* Right Side - Selection Preview and Controls */}
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                Current Selection
              </Text>
            </div>

            {selectedSubjectVersion ? (
              <Card style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6' }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Text strong style={{ fontSize: '18px', color: '#1e40af' }}>
                    {selectedSubjectVersion.subject.subjectName}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {selectedSubjectVersion.subject.subjectCode} - {selectedSubjectVersion.versionName}
                  </Text>
                  <br />
                  <Tag color="blue" style={{ marginTop: 8 }}>
                    {selectedSubjectVersion.subject.credits} credits
                  </Tag>
                </div>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Semester Number:</Text>
                    <Input
                      type="number"
                      min={1}
                      max={9}
                      value={modalSemesterNumber}
                      onChange={e => setModalSemesterNumber(Number(e.target.value))}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                  
                  <div>
                    <Checkbox
                      checked={modalIsMandatory}
                      onChange={e => setModalIsMandatory(e.target.checked)}
                    >
                      <Text strong>Mandatory Subject</Text>
                    </Checkbox>
                    <Tag
                      color={modalIsMandatory ? 'red' : 'orange'}
                      style={{ marginLeft: 8 }}
                    >
                      {modalIsMandatory ? 'Mandatory' : 'Optional'}
                    </Tag>
                  </div>
                </Space>
              </Card>
            ) : (
              <Card style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No subject version selected</Text>
                </div>
              </Card>
            )}

            <div style={{ marginTop: 24 }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Click on a subject version from the list to select it. Configure the semester and mandatory status, then add it to the curriculum.
              </Text>
            </div>
          </Col>
        </Row>

        {/* Modal Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button onClick={handleAddSubjectModalClose}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleAddSubjectVersion}
            disabled={!selectedSubjectVersion || !modalSemesterNumber}
            loading={addLoading}
          >
            Add Subject Version
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CurriculumEdit; 