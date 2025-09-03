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
  UploadOutlined
} from '@ant-design/icons';
import { SyllabusMaterial, CreateSyllabusMaterial } from '../../interfaces/ISchoolProgram';
import BulkDataImport from '../common/bulkDataImport';
import styles from '../../css/staff/staffEditSyllabus.module.css';
import dayjs from 'dayjs';
import { useCRUDSyllabus } from '../../hooks/useCRUDSchoolMaterial';

const { TextArea } = Input;

interface MaterialTableProps {
  syllabusId:number;
  materials: SyllabusMaterial[];
  isEditing: boolean;
  onAddMaterial: (material: CreateSyllabusMaterial) => Promise<void>;
  onDeleteMaterial: (id: number) => void;
  onUpdateMaterial: (id: number, material: Partial<SyllabusMaterial>) => void;
  onRequestRefresh?: () => Promise<void> | void;
}

const MaterialTable: React.FC<MaterialTableProps> = ({
  materials,
  isEditing,
  onAddMaterial,
  onDeleteMaterial,
  onUpdateMaterial,
  syllabusId,
  onRequestRefresh
}) => {
  const [materialForm] = Form.useForm();
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [materialImportVisible, setMaterialImportVisible] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [materialEdit, setMaterialEdit] = useState<Partial<SyllabusMaterial>>({});
  const { addSyllabusMaterialsBulkMutation } = useCRUDSyllabus();

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

  const handleMaterialDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract material data from the imported data
      const materialData = importedData['MATERIAL'] || [];
      const materials = materialData.map(row => ({
        syllabusId: syllabusId,
        materialName: row.materialName || 'Untitled',
        authorName: row.authorName || 'Unknown',
        publishedDate: new Date(row.publishedDate || Date.now()),
        description: row.description || '',
        filepathOrUrl: row.filepathOrUrl || ''
      }));
      await addSyllabusMaterialsBulkMutation.mutateAsync(materials);
      message.success(`Successfully imported ${materials.length} material(s)`);
      setMaterialImportVisible(false);
      if (onRequestRefresh) await onRequestRefresh();
    } catch (error) {
      message.error('Failed to import material data');
    }
  };

  // Learning Materials columns with inline editing
  const materialColumns = [
    { 
      title: 'Material Name', 
      dataIndex: 'materialName', 
      key: 'materialName',
      width: 200,
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.materialName}
            onChange={e => setMaterialEdit({ ...materialEdit, materialName: e.target.value })}
          />
        ) : (
          <div className={styles.materialTableCell}>
            {record.materialName}
          </div>
        )
    },
    { 
      title: 'Author', 
      dataIndex: 'authorName', 
      key: 'authorName',
      width: 150,
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.authorName}
            onChange={e => setMaterialEdit({ ...materialEdit, authorName: e.target.value })}
          />
        ) : (
          <div className={styles.materialTableCellEmpty}>
            {record.authorName}
          </div>
        )
    },
    { 
      title: 'Published Date', 
      dataIndex: 'publishedDate', 
      key: 'publishedDate',
      width: 120,
      render: (date: Date, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <DatePicker
            value={materialEdit.publishedDate ? dayjs(materialEdit.publishedDate) : undefined}
            onChange={date => setMaterialEdit({ ...materialEdit, publishedDate: date ? date.toDate() : undefined })}
            className={styles.materialFormDatePicker}
          />
        ) : (
          <div className={styles.materialTableCellEmpty}>
            {record.publishedDate ? new Date(record.publishedDate).toLocaleDateString() : '-'}
          </div>
        )
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description', 
      ellipsis: false,
      width: 250,
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <TextArea
            value={materialEdit.description}
            onChange={e => setMaterialEdit({ ...materialEdit, description: e.target.value })}
            autoSize={{ minRows: 2, maxRows: 4 }}
            className={styles.materialTableCell}
          />
        ) : (
          <div className={styles.materialTableCell}>
            {record.description || '-'}
          </div>
        )
    },
    { 
      title: 'File/URL', 
      dataIndex: 'filepathOrUrl', 
      key: 'filepathOrUrl', 
      ellipsis: false,
      width: 200,
      render: (_: any, record: SyllabusMaterial) => {
        const isUrl = record.filepathOrUrl && (
          record.filepathOrUrl.startsWith('http://') || 
          record.filepathOrUrl.startsWith('https://') ||
          record.filepathOrUrl.startsWith('www.')
        );
        const isFile = record.filepathOrUrl && (
          record.filepathOrUrl.includes('.pdf') ||
          record.filepathOrUrl.includes('.doc') ||
          record.filepathOrUrl.includes('.ppt') ||
          record.filepathOrUrl.includes('.xls') ||
          record.filepathOrUrl.includes('.txt')
        );

        return isEditing && editingMaterialId === record.id ? (
          <Input
            value={materialEdit.filepathOrUrl}
            onChange={e => setMaterialEdit({ ...materialEdit, filepathOrUrl: e.target.value })}
            placeholder="Enter file path or URL"
          />
        ) : record.filepathOrUrl ? (
          <div className={styles.materialTableCellFlex}>
            <span className={styles.materialTableCellEmpty}>
              {isUrl ? '🔗' : isFile ? '📄' : '📁'}
            </span>
            {isUrl ? (
              <a
                href={record.filepathOrUrl.startsWith('www.') ? `https://${record.filepathOrUrl}` : record.filepathOrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.materialTableCell}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {record.filepathOrUrl}
              </a>
            ) : (
              <span className={styles.materialTableCellEmpty}>
                {record.filepathOrUrl}
              </span>
            )}
          </div>
        ) : (
          <span className={styles.materialTableCellEmpty}>-</span>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SyllabusMaterial) =>
        isEditing && editingMaterialId === record.id ? (
          <div className={styles.materialTableCellActions}>
            <Button 
              icon={<SaveOutlined />} 
              onClick={saveEditMaterial}
              className={styles.materialTableCellActionsButtonSave}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={cancelEditMaterial}
              className={styles.materialTableCellActionsButtonCancel}
            />
          </div>
        ) : isEditing ? (
          <div className={styles.materialTableCellActions}>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => startEditMaterial(record)}
              className={styles.materialTableCellActionsButtonEdit}
            />
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteItem(record.id)}
              className={styles.materialTableCellActionsButtonDelete}
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
                type="default"
                icon={<UploadOutlined />}
                onClick={() => setMaterialImportVisible(true)}
                style={{ borderRadius: 999, borderColor: '#10B981', color: '#10B981' }}
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
        <BulkDataImport
          onClose={() => setMaterialImportVisible(false)}
          onDataImported={handleMaterialDataImported}
          supportedTypes={['MATERIAL']}
        />
      </Modal>
    </>
  );
};

export default MaterialTable; 