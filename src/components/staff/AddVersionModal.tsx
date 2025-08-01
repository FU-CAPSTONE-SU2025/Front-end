import React from 'react';
import { Modal, Form, Input, DatePicker, Switch } from 'antd';
import { CreateSubjectVersion } from '../../interfaces/ISchoolProgram';
import styles from '../../css/staff/staffEditSyllabus.module.css';

interface AddVersionModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (values: CreateSubjectVersion) => void;
  confirmLoading?: boolean;
  subjectId: number;
}

const AddVersionModal: React.FC<AddVersionModalProps> = ({ 
  visible, 
  onCancel, 
  onAdd, 
  confirmLoading,
  subjectId 
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const versionData: CreateSubjectVersion = {
        subjectId: subjectId,
        versionCode: values.versionCode,
        versionName: values.versionName,
        description: values.description,
        isActive: values.isActive,
        isDefault: values.isDefault,
        effectiveFrom: values.effectiveFrom.format('YYYY-MM-DD'),
        effectiveTo: values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DD') : null
      };
      onAdd(versionData);
      form.resetFields();
    } catch (err) {
      // Validation error
    }
  };

  return (
    <Modal
      title="Add Subject Version"
      open={visible}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      okText="Add"
      cancelText="Cancel"
      destroyOnClose
      width={600}
      className={styles.versionModal}
    >
      <Form form={form} layout="vertical" className={styles.versionForm}>
        <Form.Item
          label="Version Code"
          name="versionCode"
          rules={[{ required: true, message: 'Please input the version code!' }]}
          className={styles.versionFormItem}
        >
          <Input placeholder="e.g., v1.0, 2024.1" className={styles.versionFormInput} />
        </Form.Item>
        
        <Form.Item
          label="Version Name"
          name="versionName"
          rules={[{ required: true, message: 'Please input the version name!' }]}
          className={styles.versionFormItem}
        >
          <Input placeholder="e.g., Spring 2024, Updated Curriculum" className={styles.versionFormInput} />
        </Form.Item>
        
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
          className={styles.versionFormItem}
        >
          <Input.TextArea rows={3} placeholder="Describe the changes in this version..." className={styles.versionFormTextArea} />
        </Form.Item>
        
        <Form.Item
          label="Effective From"
          name="effectiveFrom"
          rules={[{ required: true, message: 'Please select the effective from date!' }]}
          className={styles.versionFormItem}
        >
          <DatePicker className={styles.versionFormDatePicker} format="YYYY-MM-DD" />
        </Form.Item>
        
        <Form.Item
          label="Effective To"
          name="effectiveTo"
          className={styles.versionFormItem}
        >
          <DatePicker className={styles.versionFormDatePicker} format="YYYY-MM-DD" />
        </Form.Item>
        
        <Form.Item 
          label="Active" 
          name="isActive" 
          valuePropName="checked" 
          initialValue={true}
          className={styles.versionFormItem}
        >
          <Switch />
        </Form.Item>
        
        <Form.Item 
          label="Default Version" 
          name="isDefault" 
          valuePropName="checked" 
          initialValue={false}
          className={styles.versionFormItem}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddVersionModal; 