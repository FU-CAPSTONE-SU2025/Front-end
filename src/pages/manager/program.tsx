import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Affix, message, Pagination, Spin, Modal, Form, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useNavigate } from 'react-router';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useCRUDProgram } from '../../hooks/useCRUDSchoolMaterial';
import { CreateProgram, Program } from '../../interfaces/ISchoolProgram';
import { isErrorResponse } from '../../api/AxiosCRUD';

const ManagerProgramPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Use the Program CRUD hook
  const {
    getAllPrograms,
    programList,
    paginationProgram,
    isLoading,
    addMultipleProgramsMutation,
    addProgramMutation,
    updateProgramMutation,
    disableProgramMutation,
    isSuccessCreateProgram,
    isSuccessUpdateProgram
  } = useCRUDProgram();

  // Fetch programs on component mount and when search/page changes
  useEffect(() => {
    getAllPrograms({
      pageNumber: page,
      pageSize: pageSize,
      searchQuery: search
    });
  }, [page, pageSize, search]); // Removed getAllPrograms from dependencies

  // Remove the automatic bulk import success handling effect to prevent false positives
  // Bulk import success handling is now only done in the mutation's onSuccess callback

  useEffect(() => {
    if (isSuccessCreateProgram) {
      message.success('Program created successfully!');
      setEditModalOpen(false);
      form.resetFields();
      refreshData();
    }
  }, [isSuccessCreateProgram]);

  useEffect(() => {
    if (isSuccessUpdateProgram) {
      message.success('Program updated successfully!');
      setEditModalOpen(false);
      setEditingProgram(null);
      form.resetFields();
      refreshData();
    }
  }, [isSuccessUpdateProgram]);

  const refreshData = () => {
    getAllPrograms({
      pageNumber: page,
      pageSize: pageSize,
      searchQuery: search
    });
  };

  const handleAddProgram = () => {
    setEditingProgram(null);
    form.resetFields();
    setEditModalOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    form.setFieldsValue({
      programName: program.programName,
      programCode: program.programCode
    });
    setEditModalOpen(true);
  };

  const handleDeleteProgram = (program: Program) => {
    Modal.confirm({
      title: 'Delete Program',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${program.programName}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        disableProgramMutation.mutate(program.id, {
          onSuccess: () => {
            message.success('Program deleted successfully!');
            refreshData();
          },
          onError: (error) => {
            console.error('Delete error:', error);
            message.error('Failed to delete program. Please try again.');
          }
        });
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields()
      .then((values: CreateProgram) => {
        if (editingProgram) {
          // Update existing program
          updateProgramMutation.mutate({
            id: editingProgram.id,
            data: values
          });
        } else {
          // Create new program
          addProgramMutation.mutate(values);
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      const programData = importedData['PROGRAM'] || [];
      
      if (programData.length === 0) {
        message.warning('No program data found in the imported file');
        return;
      }

      // Transform the imported data to match CreateProgram interface
      const transformedData: CreateProgram[] = programData.map(item => ({
        programName: item.programName || item['Program Name'] || item.ProgramName || '',
        programCode: item.programCode || item['Program Code'] || item.ProgramCode || ''
      }));

      // Validate the data
      const validData = transformedData.filter(item => 
        item.programName.trim() !== '' && item.programCode.trim() !== ''
      );

      if (validData.length === 0) {
        message.error('No valid program data found. Please check your data format.');
        return;
      }

      if (validData.length !== transformedData.length) {
        message.warning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk import mutation
      addMultipleProgramsMutation.mutate(validData, {
        onSuccess: () => {
          message.success(`Successfully imported ${validData.length} programs`);
          setIsImportOpen(false);
          refreshData();
        },
        onError: (error: any) => {
          console.error('Import error:', error);
          
          // Extract ErrorResponse details if available
          let errorMessage = 'Unknown error occurred';
          let errorStatus = '';
          
          // Check if the error has an attached ErrorResponse
          if (error.errorResponse && isErrorResponse(error.errorResponse)) {
            errorMessage = error.errorResponse.message;
            errorStatus = ` (Status: ${error.errorResponse.status})`;
          } 
          // Check if the error itself is an ErrorResponse
          else if (isErrorResponse(error)) {
            errorMessage = error.message;
            errorStatus = ` (Status: ${error.status})`;
          }
          // Fallback to error message
          else if (error?.message) {
            errorMessage = error.message;
          }
          
          message.error(`Error importing programs: ${errorMessage}${errorStatus}`);
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      message.error('Error processing imported data. Please check your data format.');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Program Code',
      dataIndex: 'programCode',
      key: 'programCode',
      width: 140,
      render: (code: string) => (
        <Tag color="blue" style={{ fontWeight: '600' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Program Name',
      dataIndex: 'programName',
      key: 'programName',
      render: (name: string) => (
        <span style={{ fontWeight: '600', color: '#1E40AF' }}>
          {name}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      width: 150,
      render: (_: any, record: Program) => (
        <Space size="small">
          <Tooltip title="Edit Program">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditProgram(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Delete Program">
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProgram(record)}
              style={{ color: '#ff4d4f' }}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div className={styles.sttToolbar}>
          <Input.Search
            placeholder="Search by Program Name or Code"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
            style={{maxWidth: 280, borderRadius: 999}}
            size="large"
            allowClear
          />
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large" 
              style={{borderRadius: 999}}
              onClick={handleAddProgram}
            >
              Add Program
            </Button>
            <Button 
              type="default" 
              icon={<UploadOutlined />} 
              size="large" 
              style={{borderRadius: 999, borderColor: '#10B981', color: '#10B981'}} 
              onClick={() => setIsImportOpen(true)}
              loading={addMultipleProgramsMutation.isPending}
            >
              Import Programs
            </Button>
          </Space>
        </div>
      </Affix>

      {/* Programs Table */}
      <div style={{ background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)', padding: '24px' }}>
        <Table
          columns={columns}
          dataSource={programList}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: search ? `No programs found matching "${search}"` : 'No programs available'
          }}
        />
        
        {/* Pagination */}
        {paginationProgram && paginationProgram.total > 0 && (
          <div style={{marginTop: 24, display: 'flex', justifyContent: 'center'}}>
            <Pagination
              current={paginationProgram.current}
              pageSize={paginationProgram.pageSize}
              total={paginationProgram.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} programs`
              }
              pageSizeOptions={['10', '20', '50', '100']}
              onChange={handlePageChange}
              style={{borderRadius: 8}}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Program Modal */}
      <Modal
        title={editingProgram ? 'Edit Program' : 'Add New Program'}
        open={editModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingProgram(null);
          form.resetFields();
        }}
        okText={editingProgram ? 'Update' : 'Create'}
        cancelText="Cancel"
        confirmLoading={addProgramMutation.isPending || updateProgramMutation.isPending}
        destroyOnClose
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="programCode"
            label="Program Code"
            rules={[
              { required: true, message: 'Please enter program code!' },
              { pattern: /^[A-Z0-9]+$/, message: 'Program code should contain only uppercase letters and numbers!' }
            ]}
          >
            <Input 
              placeholder="e.g., SE, IT, BA" 
              style={{ borderRadius: 8 }}
              disabled={!!editingProgram} // Disable code editing when updating
            />
          </Form.Item>
          
          <Form.Item
            name="programName"
            label="Program Name"
            rules={[
              { required: true, message: 'Please enter program name!' },
              { min: 3, message: 'Program name must be at least 3 characters!' }
            ]}
          >
            <Input 
              placeholder="e.g., Software Engineering, Information Technology" 
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Data Import Modal */}
      {isImportOpen && (
        <BulkDataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
          supportedTypes={['PROGRAM']}
        />
      )}
    </div>
  );
};

export default ManagerProgramPage; 