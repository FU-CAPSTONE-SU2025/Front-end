import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Typography, Spin, Card, Table, Checkbox, Modal } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Curriculum, Subject, SubjectWithCurriculumInfo } from '../../interfaces/ISchoolProgram';
import { programs } from '../../data/schoolData';
import dayjs from 'dayjs';
import {useCRUDCurriculum} from '../../hooks/useCRUDSchoolMaterial';
import { AddSubjectToCurriculum, RemoveSubjectToCurriculum } from '../../api/SchoolAPI/curriculumAPI';
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
    fetchCurriculumSubjectsMutation,
    fetchSubjectsMutation
  } = useCRUDCurriculum();

  const [loading, setLoading] = useState(false);

  // Subject management state
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [curriculumSubjects, setCurriculumSubjects] = useState<SubjectWithCurriculumInfo[]>([]);
  const [addForm, setAddForm] = useState<{ subjectId?: number; semesterNumber?: number; isMandatory?: boolean }>({});
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

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

  // Fetch all subjects and curriculum subjects on mount or when id changes
  useEffect(() => {
    // Always fetch all subjects (needed for both create and edit modes)
    fetchSubjectsMutation.mutate();
    // If in edit mode, fetch subjects already in this curriculum
    if (id) {
      fetchCurriculumSubjectsMutation.mutate(id);
    }
  }, [id]);

  // Update all subjects when fetched
  useEffect(() => {
    if (fetchSubjectsMutation.data) {
      setAllSubjects(fetchSubjectsMutation.data.items || []);
    }
  }, [fetchSubjectsMutation.data]);

  // Update curriculum subjects when fetched
  useEffect(() => {
    if (fetchCurriculumSubjectsMutation.data) {
      setCurriculumSubjects(fetchCurriculumSubjectsMutation.data);
    }
  }, [fetchCurriculumSubjectsMutation.data]);

  // Compute available subjects to add
  const availableSubjects = allSubjects.filter(
    subj => !curriculumSubjects.some(cs => cs.id === subj.id)
  );

  // Refresh curriculum subjects after adding/removing
  const refreshCurriculumSubjects = () => {
    if (id) {
      fetchCurriculumSubjectsMutation.mutate(id);
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

  // Add subject handler (using curriculum API)
  const handleAddSubject = async () => {
    if (!addForm.subjectId || !addForm.semesterNumber) {
      message.error('Please select a subject and semester.');
      return;
    }
    setAddLoading(true);
    try {
      await AddSubjectToCurriculum(id!, {
        subjectId: addForm.subjectId,
        semesterNumber: addForm.semesterNumber,
        isMandatory: !!addForm.isMandatory,
      });
      message.success('Add successful');
      
      setAddForm({});
      // Refresh curriculum subjects
      refreshCurriculumSubjects();
    } catch (e) {
      message.error('Failed to add subject.');
    } finally {
      setAddLoading(false);
    }
  };

  // Delete subject handler (using curriculum API)
  const handleDeleteSubject = (subjectId: number) => {
    Modal.confirm({
      title: 'Remove Subject',
      content: 'Are you sure you want to remove this subject from the curriculum?',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setDeleteLoading(subjectId);
        try {
          await RemoveSubjectToCurriculum(subjectId, id!);
          message.success('Subject removed');
          
          // Refresh curriculum subjects
          refreshCurriculumSubjects();
        } catch (e) {
          message.error('Failed to remove subject.');
        } finally {
          setDeleteLoading(null);
        }
      },
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
            📚 Manage Subjects in Curriculum
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
              placeholder="Select subject"
              value={addForm.subjectId}
              onChange={v => setAddForm(f => ({ ...f, subjectId: v }))}
              optionFilterProp="label"
              filterOption={(input, option) => {
                const label = option?.label || '';
                return label.toString().toLowerCase().includes(input.toLowerCase());
              }}
            >
              {availableSubjects.map(subj => (
                <Option key={subj.id} value={subj.id} label={`${subj.subjectName} (${subj.subjectCode})`}>
                  {subj.subjectName} ({subj.subjectCode})
                </Option>
              ))}
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
              onClick={handleAddSubject}
              loading={addLoading}
              disabled={!addForm.subjectId || !addForm.semesterNumber}
              className={styles.addSubjectButton}
            >
              Add Subject
            </Button>
          </Space>
        </div>
        <Table
          dataSource={curriculumSubjects}
          rowKey="id"
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
              title: 'Credits',
              dataIndex: 'credits',
              key: 'credits',
            },
            {
              title: 'Semester',
              key: 'semester',
              render: (_: any, record: SubjectWithCurriculumInfo) => (
                <span className={styles.semesterCell}>
                  {record.semesterNumber}
                </span>
              ),
            },
            {
              title: 'isMandatory',
              key: 'isMandatory',
              render: (_: any, record: SubjectWithCurriculumInfo) => (
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
              render: (_: any, record: SubjectWithCurriculumInfo) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteLoading === record.id}
                  onClick={() => handleDeleteSubject(record.id)}
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