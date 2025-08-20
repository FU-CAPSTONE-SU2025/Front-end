import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Spin, Card, Table, Checkbox, Modal } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Curriculum, SubjectVersion, SubjectVersionWithCurriculumInfo, Program } from '../../interfaces/ISchoolProgram';
import dayjs from 'dayjs';
import {useCRUDCurriculum, useCRUDSubjectVersion} from '../../hooks/useCRUDSchoolMaterial';
import styles from '../../css/staff/curriculumEdit.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useSchoolApi } from '../../hooks/useSchoolApi';

const { Option } = Select;

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
  const [programLoading, setProgramLoading] = useState(false);

  // Subject version management state
  const [allSubjectVersions, setAllSubjectVersions] = useState<SubjectVersion[]>([]);
  const [curriculumSubjectVersions, setCurriculumSubjectVersions] = useState<SubjectVersionWithCurriculumInfo[]>([]);
  const [addForm, setAddForm] = useState<{ subjectVersionId?: number; semesterNumber?: number; isMandatory?: boolean }>({});
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  
  // Pagination state for subject versions
  const [subjectVersionPage, setSubjectVersionPage] = useState(1);
  const [subjectVersionPageSize] = useState(10);
  const [hasMoreSubjectVersions, setHasMoreSubjectVersions] = useState(true);
  const [availableSubjectVersions, setAvailableSubjectVersions] = useState<SubjectVersion[]>([]);

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

  // Compute available subject versions to add
  useEffect(() => {
    GetAvailableSubjectVersions();
  }, [curriculumSubjectVersions, allSubjectVersions]);

  const GetAvailableSubjectVersions = () => {
    // Ensure both arrays are defined
    const safeCurriculumVersions = curriculumSubjectVersions || [];
    const safeAllVersions = allSubjectVersions || [];
    
    if (safeCurriculumVersions.length > 0) {
      // Filter out versions that are already in the curriculum
      setAvailableSubjectVersions(safeAllVersions.filter(
        version => !safeCurriculumVersions.some(csv => csv.subjectVersionId === version.id)
      ));
    } else {
      // If no curriculum subject versions, all subject versions are available
      setAvailableSubjectVersions(safeAllVersions);
    }
  };

  // Refresh curriculum subject versions after adding/removing
  const refreshCurriculumSubjectVersions = () => {
    if (id) {
      fetchCurriculumSubjectVersionsMutation.mutate(id);
    }
  };

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

  // Add subject version handler (using curriculum API)
  const handleAddSubjectVersion = async () => {
    if (!addForm.subjectVersionId || !addForm.semesterNumber ){
      handleError('Please select a subject version and semester.', 'Validation Error');
      return;
    }
    if(addForm.semesterNumber > 9 || addForm.semesterNumber < 1){
      handleError('Invalid semester number. Semester must be from 1 to 9', 'Validation Error');
      return;
    }
    setAddLoading(true);
    try {
      await addSubjectVersionToCurriculum({
        curriculumId: id!,
        subjectVersionId: addForm.subjectVersionId
      });
      handleSuccess('Subject version added successfully');
      
      setAddForm({});
      // Refresh curriculum subject versions
      refreshCurriculumSubjectVersions();
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
              📚 Manage Subject Versions in Curriculum
            </div>
          } 
          className={styles.subjectsCard}
          classNames={{
            header: styles.cardHeader,
            body: styles.cardBody
          }}
        >
          <div className={styles.addSubjectControls}>
            <Space wrap>
              <Select
                showSearch
                className={styles.subjectSelect}
                placeholder="Select subject version"
                value={addForm.subjectVersionId}
                onChange={v => setAddForm(f => ({ ...f, subjectVersionId: v }))}
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
                notFoundContent={
                  getSubjectVersionMutation.isPending ? (
                    <div className={styles.notFoundContentLoading}>
                      <Spin size="small" />
                    </div>
                  ) : (
                    <div className={styles.notFoundContentEmpty}>
                      No subject versions found
                    </div>
                  )
                }
              >
                {(availableSubjectVersions || []).map((version:SubjectVersion) => (
                  <Option key={`${version.subjectId}-${version.id}`} value={version.id} label={`${version.subject.subjectName} - ${version.versionName} (${version.subject.subjectCode})`}>
                    {version.subject.subjectName} - {version.versionName} ({version.subject.subjectCode})
                  </Option>
                ))}
                {hasMoreSubjectVersions && (
                  <Option key="load-more" value="load-more" disabled>
                    <div className={styles.loadMoreOption}>
                      {getSubjectVersionMutation.isPending ? 'Loading...' : 'Scroll to load more'}
                    </div>
                  </Option>
                )}
              </Select>
              <Input
                type="number"
                min={1}
                max={20}
                placeholder="Semester"
                className={styles.semesterInput}
                value={addForm.semesterNumber}
                onChange={e => setAddForm(f => ({ ...f, semesterNumber: Number(e.target.value) }))}
              />
              <Checkbox
                checked={!!addForm.isMandatory}
                onChange={e => setAddForm(f => ({ ...f, isMandatory: e.target.checked }))}
                className={styles.mandatoryCheckbox}
              >
                Mandatory
              </Checkbox>
              <Button
                type="primary"
                onClick={handleAddSubjectVersion}
                loading={addLoading}
                disabled={!addForm.subjectVersionId || !addForm.semesterNumber}
                className={styles.addSubjectButton}
              >
                Add Subject Version
              </Button>
            </Space>
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
    </div>
  );
};

export default CurriculumEdit; 