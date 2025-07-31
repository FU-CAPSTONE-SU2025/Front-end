import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Typography, Spin, Card, Table, Checkbox, Modal } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Curriculum, Subject, SubjectVersion, SubjectVersionWithCurriculumInfo } from '../../interfaces/ISchoolProgram';
import { programs } from '../../data/schoolData';
import dayjs from 'dayjs';
import {useCRUDCurriculum, useCRUDSubjectVersion} from '../../hooks/useCRUDSchoolMaterial';
import { AddSubjectVersionToCurriculum, RemoveSubjectVersionFromCurriculum } from '../../api/SchoolAPI/curriculumAPI';
import styles from '../../css/staff/curriculumEdit.module.css';

const { Title } = Typography;
const { Option } = Select;

interface CurriculumEditProps {
  id?: number;
}

const CurriculumEdit: React.FC<CurriculumEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const isCreateMode = !id;
  const isEditMode = !!id;

  // API hooks
  const {
    addCurriculumMutation,
    updateCurriculumMutation,
    getCurriculumById,
    fetchCurriculumSubjectVersionsMutation,
  } = useCRUDCurriculum();

  const { getSubjectVersionMutation } = useCRUDSubjectVersion();

  const [loading, setLoading] = useState(false);

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

  // Update curriculum subject versions when fetched
  useEffect(() => {
    if (fetchCurriculumSubjectVersionsMutation.data) {
      setCurriculumSubjectVersions(fetchCurriculumSubjectVersionsMutation.data);
    }
  }, [fetchCurriculumSubjectVersionsMutation.data]);

  // Load more subject versions
  const loadMoreSubjectVersions = () => {
    if (hasMoreSubjectVersions && !getSubjectVersionMutation.isPending) {
      setSubjectVersionPage(prev => prev + 1);
    }
  };

  // Compute available subject versions to add
  const availableSubjectVersions = allSubjectVersions.filter(
    version => !curriculumSubjectVersions.some(csv => csv.subjectVersionId === version.id)
  );

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
        programId: 2 // FOR NOW
      };

      if (isCreateMode) {
        await addCurriculumMutation.mutateAsync(curriculumData as Curriculum);
        message.success('Curriculum created successfully!');
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
        message.success('Curriculum updated successfully!');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add subject version handler (using curriculum API)
  const handleAddSubjectVersion = async () => {
    if (!addForm.subjectVersionId || !addForm.semesterNumber ){
      message.error('Please select a subject version and semester.');
      return;
    }
    if(addForm.semesterNumber > 9 || addForm.semesterNumber < 1){
      message.error('Invalid semester number. Semester must be from 1 to 9');
      return;
    }
    setAddLoading(true);
    try {
      await AddSubjectVersionToCurriculum(id!, {
        subjectVersionId: addForm.subjectVersionId,
        semesterNumber: addForm.semesterNumber,
        isMandatory: !!addForm.isMandatory,
      });
      message.success('Add successful');
      
      setAddForm({});
      // Refresh curriculum subject versions
      refreshCurriculumSubjectVersions();
    } catch (e) {
      message.error('Failed to add subject version.');
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <Button onClick={() => Modal.destroyAll()}>
            Cancel
          </Button>
          <Button 
            danger 
            onClick={async () => {
              setDeleteLoading(subjectVersionId);
              try {
                await RemoveSubjectVersionFromCurriculum(subjectVersionId, id!);
                message.success('Subject version removed');
                
                // Refresh curriculum subject versions
                refreshCurriculumSubjectVersions();
              } catch (e) {
                message.error('Failed to remove subject version.');
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
    return <Spin tip="Loading curriculum..." style={{ width: '100%', margin: '2rem 0' }} />;
  }

  return (
    <div className={styles.curriculumContainer}>
      <Title level={4} className={styles.curriculumTitle}>
        {isCreateMode ? 'Create New Curriculum' : 'Edit Curriculum'}
      </Title>
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
            disabled={isEditMode} // Program shouldn't be changed after creation
          >
            {programs.map(program => (
              <Option key={program.id} value={program.id}>
                {program.programName} ({program.programCode})
              </Option>
            ))}
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
      <Card 
        title={
          <div className={styles.cardTitle}>
            📚 Manage Subject Versions in Curriculum
          </div>
        } 
        className={styles.subjectsCard}
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          borderBottom: 'none'
        }}
        bodyStyle={{
          padding: '24px'
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
                  <div style={{ padding: '8px', textAlign: 'center' }}>
                    <Spin size="small" />
                  </div>
                ) : (
                  <div style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>
                    No subject versions found
                  </div>
                )
              }
            >
              {availableSubjectVersions.map(version => (
                <Option key={`${version.subjectId}-${version.id}`} value={version.id} label={`${version.subject.subjectName} - ${version.versionName} (${version.subject.subjectCode})`}>
                  {version.subject.subjectName} - {version.versionName} ({version.subject.subjectCode})
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
          dataSource={curriculumSubjectVersions}
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
    </div>
  );
};

export default CurriculumEdit; 