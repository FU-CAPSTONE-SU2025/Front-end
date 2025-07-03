import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Space, Typography, Spin, Card, Table, Checkbox, Modal } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Curriculum, Program, Subject, CreateSubjectToCurriculum } from '../../interfaces/ISchoolProgram';
import { programs } from '../../data/schoolData';
import dayjs from 'dayjs';
import {useCRUDCurriculum} from '../../hooks/useCRUDSchoolMaterial';
import { FetchSubjectList } from '../../api/SchoolAPI/subjectAPI';
import { AddSubjectToCurriculum, RemoveSubjectToCurriculum } from '../../api/SchoolAPI/curriculumAPI';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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
    getCurriculumById
  } = useCRUDCurriculum();

  const [loading, setLoading] = useState(false);

  // Subject management state
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [curriculumSubjects, setCurriculumSubjects] = useState<CreateSubjectToCurriculum[]>([]);
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
    if (id) {
      FetchSubjectList(1, 1000).then(res => setAllSubjects(res?.items || []));
      // Use curriculum API to fetch subjects in curriculum
      // Replace with actual API call if available
      // Example: FetchCurriculumSubjects(id).then(res => setCurriculumSubjects(res || []));
    }
  }, [id]);

  // Compute available subjects to add
  const availableSubjects = allSubjects.filter(
    subj => !curriculumSubjects.some(cs => cs.subjectId === subj.id)
  );

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
      // Example: FetchCurriculumSubjects(id!).then(res => setCurriculumSubjects(res || []));
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
          // Example: FetchCurriculumSubjects(id!).then(res => setCurriculumSubjects(res || []));
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
    <div style={{ padding: '1rem' }}>
      <Title level={4} style={{ color: '#1E40AF', marginBottom: '2rem', textAlign: 'center' }}>
        {isCreateMode ? 'Create New Curriculum' : 'Edit Curriculum'}
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label="Program"
          name="programId"
          rules={[{ required: true, message: 'Please select a program!' }]}
        >
          <Select
            placeholder="Select a program"
            style={{ borderRadius: 8 }}
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
            style={{ borderRadius: 8 }}
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
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="Effective Date"
          name="effectiveDate"
          rules={[{ required: true, message: 'Please select effective date!' }]}
        >
          <DatePicker 
            style={{ width: '100%', borderRadius: 8 }}
            placeholder="Select effective date"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              style={{
                borderRadius: 999,
                height: 48,
                paddingLeft: 32,
                paddingRight: 32,
                background: '#1E40AF',
                border: 'none',
                fontWeight: 600
              }}
            >
              {isCreateMode ? 'Create Curriculum' : 'Update Curriculum'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Card title="Manage Subjects in Curriculum" style={{ maxWidth: 600, margin: '2rem auto 0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Select
              showSearch
              style={{ minWidth: 180 }}
              placeholder="Select subject"
              value={addForm.subjectId}
              onChange={v => setAddForm(f => ({ ...f, subjectId: v }))}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableSubjects.map(subj => (
                <Option key={subj.id} value={subj.id}>
                  {subj.subjectName} ({subj.subjectCode})
                </Option>
              ))}
            </Select>
            <Input
              type="number"
              min={1}
              max={20}
              placeholder="Semester"
              style={{ width: 100 }}
              value={addForm.semesterNumber}
              onChange={e => setAddForm(f => ({ ...f, semesterNumber: Number(e.target.value) }))}
            />
            <Checkbox
              checked={!!addForm.isMandatory}
              onChange={e => setAddForm(f => ({ ...f, isMandatory: e.target.checked }))}
            >
              Mandatory
            </Checkbox>
            <Button
              type="primary"
              onClick={handleAddSubject}
              loading={addLoading}
              disabled={!addForm.subjectId || !addForm.semesterNumber}
            >
              Add
            </Button>
          </Space>
        </div>
        <Table
          dataSource={curriculumSubjects}
          rowKey={r => `${r.subjectId}-${r.semesterNumber}`}
          columns={[
            {
              title: 'Subject Code',
              dataIndex: 'subjectId',
              key: 'subjectId',
              render: (id: number) => {
                const subj = allSubjects.find(s => s.id === id);
                return subj ? subj.subjectCode : id;
              },
            },
            {
              title: 'Semester',
              dataIndex: 'semesterNumber',
              key: 'semesterNumber',
            },
            {
              title: 'Action',
              key: 'action',
              render: (_: any, record: CreateSubjectToCurriculum) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteLoading === record.subjectId}
                  onClick={() => handleDeleteSubject(record.subjectId)}
                />
              ),
            },
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default CurriculumEdit; 