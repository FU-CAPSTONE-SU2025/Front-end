import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Select, Tag, Card, Popconfirm, message } from 'antd';
import { SaveOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { Combo, CreateCombo, Subject } from '../../interfaces/ISchoolProgram';
import { useCRUDCombo, useCRUDSubject } from '../../hooks/useCRUDSchoolMaterial';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import cardStyles from '../../css/staff/curriculumEdit.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Normalize combo subjects coming from API (which may return either `id` or `subjectId`)
type ComboSubjectDisplay = { id: number; subjectName: string; subjectCode: string };

// Deterministic color palette for subject chips
const TAG_COLORS = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
] as const;
type TagColor = (typeof TAG_COLORS)[number];
const getTagColor = (key: string): TagColor => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TAG_COLORS[hash % TAG_COLORS.length];
};

interface ComboEditProps {
  id?: number;
}

const ComboEdit: React.FC<ComboEditProps> = ({ id }) => {
  const [form] = Form.useForm();
  const isCreateMode = !id;
  const isEditMode = !!id;
  const { handleError, handleSuccess } = useApiErrorHandler();
  const navigate = useNavigate();

  // API hooks
  const {
    addComboMutation,
    updateComboMutation,
    getComboById,
    addSubjectToComboMutation,
    removeSubjectFromComboMutation,
    fetchComboSubjectsMutation,
    disableComboMutation
  } = useCRUDCombo();

  const { getSubjectMutation } = useCRUDSubject();

  const [loading, setLoading] = useState(false);
  const [comboSubjects, setComboSubjects] = useState<ComboSubjectDisplay[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjectsPage, setSubjectsPage] = useState<number>(1);
  const [subjectsHasMore, setSubjectsHasMore] = useState<boolean>(true);
  const [subjectsLoading, setSubjectsLoading] = useState<boolean>(false);
  const [subjectSearch, setSubjectSearch] = useState<string>('');
  const [addSubjectId, setAddSubjectId] = useState<number | null>(null);

  // Fetch combo by ID on mount (edit mode)
  useEffect(() => {
    if (isEditMode && id) {
      getComboById.mutate(id);
    }
  }, [id, isEditMode]);

  // Set form fields when data is loaded
  useEffect(() => {
    if (isEditMode && getComboById.data) {
      const combo = getComboById.data;
      form.setFieldsValue({
        comboName: combo.comboName,
        comboDescription: combo.comboDescription
      });
      loadComboSubjects();
    }
  }, [getComboById.data, isEditMode, form]);

  // Helper to fetch subjects with pagination (for infinite scroll)
  const fetchSubjects = (page: number, searchText: string = '') => {
    setSubjectsLoading(true);
    getSubjectMutation.mutate(
      { pageNumber: page, pageSize: 20, search: searchText },
      {
        onSuccess: (data) => {
          const items = data?.items || [];
          setAllSubjects((prev) => {
            const map = new Map<number, Subject>();
            prev.forEach((s) => map.set(s.id, s));
            items.forEach((s) => map.set(s.id, s));
            return Array.from(map.values());
          });
          const total = data?.totalCount ?? 0;
          const pageSize = data?.pageSize ?? 20;
          setSubjectsHasMore(page * pageSize < total);
          setSubjectsPage(page);
          setSubjectsLoading(false);
        },
        onError: () => {
          setSubjectsLoading(false);
        },
      }
    );
  };

  // Initial subjects load
  useEffect(() => {
    fetchSubjects(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadComboSubjects = async () => {
    if (!id) return;
    setLoading(true);
    try {
      fetchComboSubjectsMutation.mutate(id, {
        onSuccess: (subjects) => {
          if(subjects === undefined||subjects.length === 0){
            setComboSubjects([]);
            setLoading(false);
            return;
          }
          else{
          const normalized: ComboSubjectDisplay[] = (subjects).map((s: any) => ({
            id: typeof s.id === 'number' ? s.id : Number(s.subjectId),
            subjectName: s.subjectName,
            subjectCode: s.subjectCode,
          }));
          setComboSubjects(normalized);
          setLoading(false);
        }
        },
        onError: () => {
          setLoading(false);
          handleError('Failed to fetch combo subjects.');
        }
      });
    } catch (error) {
      setLoading(false);
      handleError('Failed to fetch combo subjects.');
    }
  };

  const handleSubjectsPopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 32;
    if (nearBottom && subjectsHasMore && !subjectsLoading) {
      fetchSubjects(subjectsPage + 1, subjectSearch);
    }
  };

  const handleSubjectSearch = (value: string) => {
    setSubjectSearch(value);
    setAllSubjects([]);
    setSubjectsPage(1);
    setSubjectsHasMore(true);
    fetchSubjects(1, value);
  };

  if (loading || getComboById.isPending) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const comboData = {
        comboName: values.comboName,
        comboDescription: values.comboDescription,
        subjectIds: isCreateMode ? [] : comboSubjects.map(s => s.id),
      };
      if (isCreateMode) {
        await addComboMutation.mutateAsync(comboData);
        handleSuccess('Combo created successfully!');
        form.resetFields();
      } else {
        await updateComboMutation.mutateAsync({ id, data: comboData });
        handleSuccess('Combo updated successfully!');
      }
    } catch (error) {
      handleError(error, 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!id || !addSubjectId) return;
    setLoading(true);
    try {
      //console.log(id, addSubjectId);
      await addSubjectToComboMutation.mutateAsync({ comboId: id, subjectId: addSubjectId });
      handleSuccess('Subject added to combo!');
      await loadComboSubjects();
      setAddSubjectId(null);
    } catch(err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (subjectId: number) => {
    if (!id) return;
    setLoading(true);
    try {
      //console.log(id, subjectId);
      console.log("Deleteing Data",id, subjectId)
      await removeSubjectFromComboMutation.mutateAsync({ comboId: id, subjectId });
      handleSuccess('Subject removed from combo!');
      await loadComboSubjects();
    } catch(err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableCombo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await disableComboMutation.mutateAsync(id);
      handleSuccess('Combo disabled successfully!');
      navigate('/staff/combo-list'); // Redirect to combo list after disabling
    } catch(err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardStyles.curriculumContainer}>
      <Card
        title={<div className={cardStyles.cardTitle}>📝 Edit Combo</div>}
        className={cardStyles.curriculumInfoCard}
        classNames={{ header: cardStyles.cardHeader, body: cardStyles.cardBody }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.comboForm}
          initialValues={{ comboName: '', comboDescription: '' }}
        >
          <Form.Item
            label="Combo Name"
            name="comboName"
            rules={[
              { required: true, message: 'Please enter combo name!' },
              { min: 3, message: 'Combo name must be at least 3 characters!' }
            ]}
          >
            <Input placeholder="e.g., AI Electives" className={styles.comboFormInput} />
          </Form.Item>
          <Form.Item
            label="Combo Description"
            name="comboDescription"
            rules={[
              { required: true, message: 'Please enter combo description!' },
              { min: 10, message: 'Description must be at least 10 characters!' }
            ]}
          >
            <TextArea placeholder="Enter a detailed description of the combo..." rows={4} className={styles.comboFormTextArea} />
          </Form.Item>
          <Form.Item className={cardStyles.formActions}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className={styles.comboFormButton}
              >
                {isCreateMode ? 'Create Combo' : 'Update Combo'}
              </Button>
              {isEditMode && (
                <Popconfirm
                  title="Are you sure you want to disable this combo?"
                  description="This action will permanently disable the combo and cannot be undone."
                  onConfirm={handleDisableCombo}
                  okText="Yes, Disable"
                  cancelText="Cancel"
                  okType="danger"
                  disabled={loading}
                >
                  <Button
                    danger
                    icon={<StopOutlined />}
                    loading={loading}
                  >
                    Disable Combo
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {isEditMode && (
        <Card
          title={<div className={cardStyles.cardTitle}>📚 Subjects in this Combo</div>}
          className={cardStyles.subjectsCard}
          classNames={{ header: cardStyles.cardHeader, body: cardStyles.cardBody }}
        >
          <div className={styles.comboSubjects}>
            <div className={styles.comboSubjectsList}>
              {comboSubjects.map(subject => (
                <Tag
                  key={subject.id}
                  closable
                  color={getTagColor(subject.subjectCode || subject.subjectName)}
                  onClose={() => handleRemoveSubject(subject.id)}
                  className={styles.comboSubjectsItem}
                  style={{ borderRadius: 999, fontWeight: 600, padding: '4px 10px' }}
                >
                  {subject.subjectName} ({subject.subjectCode})
                </Tag>
              ))}
            </div>
            <div className={cardStyles.addSubjectControls}>
              <Space wrap>
                <Select
                  placeholder="Select a subject to add"
                  value={addSubjectId}
                  onChange={setAddSubjectId}
                  className={cardStyles.subjectSelect}
                  showSearch
                  filterOption={false}
                  onSearch={handleSubjectSearch}
                  onPopupScroll={handleSubjectsPopupScroll}
                  notFoundContent={subjectsLoading ? 'Loading...' : undefined}
                >
                  {allSubjects
                    .filter(subject => !comboSubjects.some(cs => cs.id === subject.id))
                    .map(subject => (
                      <Option key={subject.id} value={subject.id}>
                        {subject.subjectName} ({subject.subjectCode})
                      </Option>
                    ))}
                </Select>
                <Button
                  type="primary"
                  onClick={handleAddSubject}
                  disabled={!addSubjectId}
                  loading={loading}
                  className={styles.comboFormButton}
                >
                  Add Subject
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ComboEdit; 