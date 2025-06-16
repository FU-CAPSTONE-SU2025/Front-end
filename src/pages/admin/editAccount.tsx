import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Input, Select, Button, ConfigProvider, Modal } from 'antd';
import styles from '../../css/editAccount.module.css';
import DataImport from '../../components/admin/dataImport';
import { students } from '../../../data/mockStudent';
import { staffs } from '../../../data/mockStaff';
import { managers } from '../../../data/mockManager';
import { advisors } from '../../../data/mockAdvisor';
import { StudentBase } from '../../interfaces/IStudent';

const { Option } = Select;

type ParamsProps = {
  role: string;
  id?: string;
};

const EditAccount: React.FC = () => {
  const params = useParams<ParamsProps>();
  const { role, id } = params;
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Mock data sources by role
  const dataSources: Record<string, StudentBase[]> = {
    student: students,
    advisor: advisors,
    manager: managers,
    staff: staffs,
  };

  // Fetch initial data for edit mode
  useEffect(() => {
    if (role && id && dataSources[role.toLowerCase()]) {
      const record = dataSources[role.toLowerCase()].find(item => item.Id === id);
      if (record) {
        form.setFieldsValue(record);
      }
    }
  }, [role, id, form]);

  // Mock API calls
  const mockApiCall = async (method: string, url: string, data: any): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock ${method} request to ${url} with data:`, data);
        resolve();
      }, 1000); // Simulate 1s network delay
    });
  };

  const handleAddAccount = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: 'Confirm Create Account',
        content: `Are you sure you want to create a new ${role} account?`,
        okText: 'Create',
        cancelText: 'Cancel',
        maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        centered: true,
        zIndex: 10000,
        className: styles.customModal,
        onOk: async () => {
          setLoading(true);
          try {
            const newAccount = {
              ...values,
            
              AddDated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/'),
            };
            await mockApiCall('POST', `/api/${role}/create`, newAccount);
          
            nav(-1); // Navigate back
          } catch (error) {
            console.error('Create failed:', error);
          } finally {
            setLoading(false);
          }
        },
      });
    });
  };

  const handleUpdateAccount = () => {
    form.validateFields().then((values) => {
      Modal.confirm({
        title: 'Confirm Update Account',
        content: `Are you sure you want to update this ${role} account?`,
        okText: 'Update',
        cancelText: 'Cancel',
        maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        centered: true,
        zIndex: 10000,
        className: styles.customModal,
        onOk: async () => {
          setLoading(true);
          try {
            const updatedAccount = { ...values, Id: id };
            await mockApiCall('PUT', `/api/${role}/${id}`, updatedAccount);
           
            nav(-1); // Navigate back
          } catch (error) {
            console.error('Update failed:', error);
          } finally {
            setLoading(false);
          }
        },
      });
    });
  };

  const handleDeleteAccount = () => {
    if (!id) return;
    Modal.confirm({
      title: 'Confirm Delete Account',
      content: `Are you sure you want to delete this ${role} account?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
      centered: true,
      zIndex: 10000,
      className: styles.customModal,
      onOk: async () => {
        setLoading(true);
        try {
          await mockApiCall('DELETE', `/api/${role}/${id}`, null);
         
          nav(-1); // Navigate back
        } catch (error) {
          console.error('Delete failed:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleImport = () => {
    setIsImportOpen(true);
  };

  const handleDataImported = (data: { [key: string]: string }) => {
    const newAccount = {
      Id: `${role?.toUpperCase().slice(0, 2)}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      Email: data.email || '',
      Name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      PhoneNumber: data.phone || '',
      Address: data.address || '',
      Campus: ['HCMC Campus', 'Ha Noi Campus', 'Da Nang Campus'][Math.floor(Math.random() * 3)],
      AddDated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/'),
    };
    if (role && dataSources[role.toLowerCase()]) {
      dataSources[role.toLowerCase()].push(newAccount);
    }
    setIsImportOpen(false);
    nav(-1); // Navigate back after import
  };

  return (
    <ConfigProvider>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h2>{role && id ? `Edit ${role} Account` : `Add New ${role || 'Account'}`}</h2>
          <Form
            form={form}
            layout="vertical"
            className={styles.form}
            disabled={loading}
          >
            <Form.Item
              label="Email"
              name="Email"
              rules={[
                { required: true, message: 'Please enter an email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item
              label="Name"
              name="Name"
              rules={[{ required: true, message: 'Please enter a name' }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="PhoneNumber"
              rules={[{ required: true, message: 'Please enter a phone number' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item
              label="Address"
              name="Address"
              rules={[{ required: true, message: 'Please enter an address' }]}
            >
              <Input placeholder="Enter address" />
            </Form.Item>
            <Form.Item
              label="Campus"
              name="Campus"
              rules={[{ required: true, message: 'Please select a campus' }]}
            >
              <Select placeholder="Select campus">
                <Option value="HCMC Campus">HCMC Campus</Option>
                <Option value="Ha Noi Campus">Ha Noi Campus</Option>
                <Option value="Da Nang Campus">Da Nang Campus</Option>
              </Select>
            </Form.Item>
            <div className={styles.formActions}>
              <Button
                type="primary"
                onClick={role && id ? handleUpdateAccount : handleAddAccount}
                loading={loading}
              >
                {role && id ? 'Update Account' : 'Add Account'}
              </Button>
              {role && id && (
                <Button
                  type="primary"
                  danger
                  onClick={handleDeleteAccount}
                  loading={loading}
                >
                  Delete Account
                </Button>
              )}
              <Button
                type="default"
                onClick={handleImport}
                loading={loading}
              >
                Import from XLSX
              </Button>
              <Button
                onClick={() => nav(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
        {isImportOpen && (
          <div className={styles.modalOverlay}>
            <DataImport onClose={() => setIsImportOpen(false)} onDataImported={handleDataImported} />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default EditAccount;