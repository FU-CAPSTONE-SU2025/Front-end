import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Table, 
  DatePicker,
  message,
  Modal,
  Form
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { SyllabusMaterial, CreateSyllabusMaterial } from '../../interfaces/ISchoolProgram';
import DataImport from '../common/dataImport';
import { getHeaderConfig } from '../../data/importConfigurations';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface MaterialTableProps {
  materials: SyllabusMaterial[];
  isEditing: boolean;
  onAddMaterial: (material: CreateSyllabusMaterial) => Promise<void>;
  onDeleteMaterial: (id: number) => void;
  onUpdateMaterial: (id: number, material: Partial<SyllabusMaterial>) => void;
}

const MaterialTable: React.FC<MaterialTableProps> = ({
  materials,
  isEditing,
  onAddMaterial,
  onDeleteMaterial,
  onUpdateMaterial
}) => {
  const [materialForm] = Form.useForm();
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [materialImportVisible, setMaterialImportVisible] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [materialEdit, setMaterialEdit] = useState<Partial<SyllabusMaterial>>({});

  const handleAddMaterial = async (values: any) => {
    try {
      await onAddMaterial(values);
      setMaterialModalVisible(false);
      materialForm.resetFields();
      message.success('Learning material added successfully');
    } catch (error) {
      message.error('Failed to add learning material');
    }
  };

  const handleDeleteItem = (id: number) => {
    onDeleteMaterial(id);
  };

  const startEditMaterial = (record: SyllabusMaterial) => {
    setEditingMaterialId(record.id);
    setMaterialEdit(record);
  };

  const saveEditMaterial = () => {
    if (editingMaterialId) {
      onUpdateMaterial(editingMaterialId, materialEdit);
      setEditingMaterialId(null);
      setMaterialEdit({});
    }
  };

  const cancelEditMaterial = () => {
    setEditingMaterialId(null);
    setMaterialEdit({});
  };

  const handleMaterialDataImported = async (data: { [key: string]: string }[]) => {
    try {
      for (const row of data) {
        const materialData: CreateSyllabusMaterial = {
          syllabusId: parseInt(row.syllabusId),
          materialName: row.materialName || '',
          authorName: row.authorName || '',
          publishedDate: row.publishedDate ? new Date(row.publishedDate) : new Date(),
          description: row.description || '',
          filepathOrUrl: row.filepathOrUrl || ''
        };
        await onAddMaterial(materialData);
      }
      message.success(`Successfully imported ${data.length} material(s)`);
      setMaterialImportVisible(false);
    } catch (error) {
      message.error('Failed to import material data');
    }
  };

  // Learning Materials columns with inline editing
  const materialColumns = [
    { title: 'Material Name', dataIndex: 'materialName', key: 'materialName',
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.materialName}
            onChange={e => setMaterialEdit({ ...materialEdit, materialName: e.target.value })}
          />
        ) : (
          record.materialName
        )
    },
    { title: 'Author', dataIndex: 'authorName', key: 'authorName',
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.authorName}
            onChange={e => setMaterialEdit({ ...materialEdit, authorName: e.target.value })}
          />
        ) : (
          record.authorName
        )
    },
    { title: 'Published Date', dataIndex: 'publishedDate', key: 'publishedDate',
      render: (date: Date, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <DatePicker
            value={materialEdit.publishedDate ? dayjs(materialEdit.publishedDate) : undefined}
            onChange={date => setMaterialEdit({ ...materialEdit, publishedDate: date ? date.toDate() : undefined })}
          />
        ) : (
          record.publishedDate ? new Date(record.publishedDate).toLocaleDateString() : ''
        )
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true,
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.description}
            onChange={e => setMaterialEdit({ ...materialEdit, description: e.target.value })}
          />
        ) : (
          record.description
        )
    },
    { title: 'File/URL', dataIndex: 'filepathOrUrl', key: 'filepathOrUrl', ellipsis: true,
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.filepathOrUrl}
            onChange={e => setMaterialEdit({ ...materialEdit, filepathOrUrl: e.target.value })}
          />
        ) : (
          record.filepathOrUrl
        )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button 
              icon={<SaveOutlined />} 
              onClick={saveEditMaterial}
              style={{ 
                background: '#10b981', 
                borderColor: '#10b981', 
                color: 'white',
                fontWeight: '600'
              }}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={cancelEditMaterial}
              style={{ 
                background: '#ef4444', 
                borderColor: '#ef4444', 
                color: 'white',
                fontWeight: '600'
              }}
            />
          </div>
        ) : isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => startEditMaterial(record)}
              style={{ 
                background: '#3b82f6', 
                borderColor: '#3b82f6', 
                color: 'white',
                fontWeight: '600'
              }}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteItem(record.id)}
              style={{ 
                background: '#ef4444', 
                borderColor: '#ef4444', 
                color: 'white',
                fontWeight: '600'
              }}
            />
          </div>
        ) : null
    },
  ];

  return (
    <>
      <div className={styles.syllabusSection}>
        <div className={styles.syllabusSectionHeader}>
          <h3 className={styles.syllabusSectionTitle}>
            📚 Learning Materials
          </h3>
          {isEditing && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setMaterialModalVisible(true)}
                style={{ background: '#f97316', borderColor: '#f97316' }}
              >
                Add Material
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={() => setMaterialImportVisible(true)}
                style={{ background: '#22c55e', borderColor: '#22c55e', color: 'white' }}
              >
                Import from Excel
              </Button>
            </div>
          )}
        </div>
        <div className={styles.syllabusSectionContent}>
          {materials.length ? (
            <Table
              columns={materialColumns}
              dataSource={materials}
              rowKey="id"
              className={styles.syllabusTable}
              pagination={false}
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📚</div>
              <div className={styles.emptyStateText}>No learning materials</div>
              <div className={styles.emptyStateSubtext}>
                {isEditing ? 'Click "Add Material" or "Import from Excel" to get started' : 'Contact your instructor to add materials'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Learning Material Modal */}
      <Modal
        title="Add Learning Material"
        open={materialModalVisible}
        onCancel={() => setMaterialModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={materialForm} onFinish={handleAddMaterial} layout="vertical">
          <Form.Item name="materialName" label="Material Name" rules={[{ required: true }]}>
            <Input placeholder="Enter material name" />
          </Form.Item>
          <div className={styles.formRow}>
            <Form.Item name="authorName" label="Author" rules={[{ required: true }]}>
              <Input placeholder="Enter author name" />
            </Form.Item>
            <Form.Item name="publishedDate" label="Published Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="filepathOrUrl" label="File Path or URL">
            <Input placeholder="Enter file path or URL" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description..." />
          </Form.Item>
          <div className={styles.syllabusActions}>
            <Button onClick={() => setMaterialModalVisible(false)} className={`${styles.syllabusButton} ${styles.cancelButton}`}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className={`${styles.syllabusButton} ${styles.primaryButton}`}>
              Add Material
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Material Excel Import Modal */}
      <Modal
        title="Import Materials from Excel"
        open={materialImportVisible}
        onCancel={() => setMaterialImportVisible(false)}
        footer={null}
        width={700}
      >
        <DataImport
          onClose={() => setMaterialImportVisible(false)}
          onDataImported={handleMaterialDataImported}
          headerConfig={{...getHeaderConfig('MATERIAL'), headers: [...getHeaderConfig('MATERIAL').headers] }}
          allowMultipleRows={true}
          dataType="material"
        />
      </Modal>
    </>
  );
};

export default MaterialTable; 