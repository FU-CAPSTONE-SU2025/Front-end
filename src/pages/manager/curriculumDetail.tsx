import React, { useState } from 'react';
import {  Input, Button, Affix, Collapse, Modal, Typography, Progress, Select, Card, Space, Row, Col, Table, Empty } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CheckOutlined, ImportOutlined, EyeOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { useNavigate } from 'react-router';
import { useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';
import { CreateCurriculum } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../../components/common/bulkDataImport';
import { subjects, combos, comboSubjects, curriculums } from '../../data/schoolData';
import { AddSubjectVersionToCurriculum } from '../../api/SchoolAPI/curriculumAPI';
import { isErrorResponse, getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import ApprovalModal from '../../components/manager/approvalModal';
import { useApprovalActions } from '../../hooks/useApprovalActions';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const nodeColor = 'rgba(30,64,175,1)';
const nodeBorder = '2.5px solid #fff';
const nodeSize = 18;
const lineWidth = 4;
const lineColor = 'rgba(30,64,175,0.18)';

const CurriculumManagerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();
  const [addSubjectVersionModal, setAddSubjectVersionModal] = useState<{ open: boolean, curriculumId: number | null, semester: number | null }>({ open: false, curriculumId: null, semester: null });
  const [selectedSubjectVersionId, setSelectedSubjectVersionId] = useState<number | null>(null);
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { showWarning } = useMessagePopupContext();

  // Add CRUD hooks
  const {
    addMultipleCurriculumsMutation
  } = useCRUDCurriculum();

  // Approval hook
  const { handleApproval, isApproving } = useApprovalActions();

  const filteredCurriculums = curriculums.filter(
    c => c.curriculumName.toLowerCase().includes(search.toLowerCase()) || 
         c.curriculumCode.toLowerCase().includes(search.toLowerCase()) ||
         c.id.toString().includes(search)
  );

  const handleAddCurriculum = () => {
    navigate('/manager/addCurriculum');
  };

  const handleEditCurriculum = (curriculumId: number) => {
    navigate(`/manager/editCurriculum/${curriculumId}`);
  };

  const handleImportCurriculum = () => {
    setIsImportOpen(true);
  };

  const handleViewSubjectVersions = (curriculumId: number) => {
    navigate(`/manager/curriculum/${curriculumId}/subjects`);
  };

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      const curriculumData = importedData['CURRICULUM'] || [];
      
      if (curriculumData.length === 0) {
        showWarning('No curriculum data found in the imported file');
        return;
      }

      const transformedData: CreateCurriculum[] = curriculumData.map(item => {
        let effectiveDate: Date;
        if (item.effectiveDate) {
          effectiveDate = new Date(item.effectiveDate);
          if (isNaN(effectiveDate.getTime())) {
            effectiveDate = new Date();
          }
        } else {
          effectiveDate = new Date();
        }

        return {
          programId: parseInt(item.programId) || 0,
          curriculumCode: item.curriculumCode || '',
          curriculumName: item.curriculumName || '',
          effectiveDate: effectiveDate
        };
      });

      const validData = transformedData.filter(item => 
        item.curriculumCode.trim() !== '' && 
        item.curriculumName.trim() !== '' && 
        item.programId > 0
      );

      if (validData.length === 0) {
        handleError('No valid curriculum data found. Please check your data format and ensure all required fields are filled.');
        return;
      }

      if (validData.length !== transformedData.length) {
        showWarning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      try {
        await addMultipleCurriculumsMutation.mutateAsync(validData);
        handleSuccess(`Successfully imported ${validData.length} curriculums`);
        setIsImportOpen(false);
      } catch (error) {
        const errorMessage = getUserFriendlyErrorMessage(error);
        handleError(errorMessage);
      }

    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      handleError(errorMessage);
    }
  };

  const handleApprove = (id: number, name: string) => {
    setSelectedItem({ id, name });
    setApprovalModalVisible(true);
  };

  const handleApprovalConfirm = async (approvalStatus: number, rejectionReason?: string) => {
    if (!selectedItem) return;
    
    try {
      await handleApproval('curriculum', selectedItem.id, approvalStatus, rejectionReason);
      setApprovalModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleAddSubjectVersionConfirm = async () => {
    if (!addSubjectVersionModal.curriculumId || !addSubjectVersionModal.semester || !selectedSubjectVersionId) return;
    
    try {
      await AddSubjectVersionToCurriculum(addSubjectVersionModal.curriculumId,
        {
        semesterNumber: addSubjectVersionModal.semester,
        subjectVersionId: selectedSubjectVersionId,
        isMandatory: true
      });
      handleSuccess('Subject version added to curriculum!');
      setAddSubjectVersionModal({ open: false, curriculumId: null, semester: null });
      setSelectedSubjectVersionId(null);
    } catch (error) {
      handleError('Failed to add subject version to curriculum.');
    }
  };

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
      width: 160,
      align: 'left' as const,
    },
    {
      title: 'Name',
      dataIndex: 'curriculumName',
      key: 'curriculumName',
      width: 400,
      align: 'left' as const,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1E40AF' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <span style={{ 
          color: record.approvalStatus === 1 ? '#52c41a' : '#faad14', 
          fontWeight: 600 
        }}>
          {record.approvalStatus === 1 ? 'Approved' : 'Pending Approval'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewSubjectVersions(record.id)}
            style={{
              borderRadius: 6,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
            }}
          >
            View Subject Versions
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Title Card */}
      <Card 
        className={glassStyles.appleGlassCard}
        style={{ 
          marginBottom: 24,
          padding: '2rem 3rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(30, 64, 175, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E293B', fontSize: '2.5rem', fontWeight: 800 }}>
              Curriculum Management
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Manage and approve curriculum submissions
            </Text>
          </div>
        </div>
      </Card>

      {/* Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <Card 
          className={glassStyles.appleGlassCard}
          style={{ 
            marginBottom: 24,
            padding: '1.5rem 2rem',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Search Curriculums</Text>
                <Input
                  placeholder="Search by code, name, or ID"
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{borderRadius: 12, width: '100%'}}
                  size="large"
                  className={glassStyles.appleGlassInput}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Actions</Text>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddCurriculum}
                    style={{
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                    }}
                  >
                    Add Curriculum
                  </Button>
                  <Button
                    icon={<ImportOutlined />}
                    onClick={handleImportCurriculum}
                    style={{borderRadius: 12}}
                  >
                    Import
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>
      </Affix>

      {/* Curriculum List Table Container */}
      <Card 
        className={glassStyles.appleGlassCard}
        style={{ 
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredCurriculums}
          rowKey="id"
          className={styles.sttFreshTable}
          locale={{ emptyText: <Empty description="No curriculums available." /> }}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} curriculums`,
            pageSizeOptions: ['5', '10', '20', '50'],
            style: {borderRadius: 8}
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            overflow: 'hidden'
          }}
        />
      </Card>

      {/* Data Import Modal */}
      {isImportOpen && (
        <BulkDataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
          supportedTypes={['CURRICULUM']}
        />
      )}

      {/* Add Subject Version Modal */}
      <Modal
        title="Add Subject Version to Semester"
        open={addSubjectVersionModal.open}
        onOk={handleAddSubjectVersionConfirm}
        onCancel={() => setAddSubjectVersionModal({ open: false, curriculumId: null, semester: null })}
        okText="Add"
        cancelText="Cancel"
        confirmLoading={false}
      >
        <div style={{ marginBottom: 16 }}>
          <strong>Curriculum:</strong> {curriculums.find(c => c.id === addSubjectVersionModal.curriculumId)?.curriculumName}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Semester:</strong> {addSubjectVersionModal.semester}
        </div>
        <div>
          <strong>Subject Version:</strong>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Select a subject version"
            value={selectedSubjectVersionId}
            onChange={setSelectedSubjectVersionId}
          >
            {subjects.map(subject => (
              <Select.Option key={subject.id} value={subject.id}>
                {subject.subjectName} ({subject.subjectCode})
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>

      {/* Approval Modal */}
      <ApprovalModal
        visible={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedItem(null);
        }}
        onConfirm={handleApprovalConfirm}
        type="curriculum"
        itemId={selectedItem?.id || 0}
        itemName={selectedItem?.name || ''}
        loading={isApproving}
      />
    </div>
  );
};

export default CurriculumManagerPage; 