import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Input, Select, Button, DatePicker, Card, ConfigProvider, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import styles from '../../css/admin/editAccount.module.css';
import { RegisterStudent } from '../../api/student/StudentAPI';
import { RegisterStaff } from '../../api/staff/StaffAPI';
import { AccountPropsCreate } from '../../interfaces/IAccount';

const { Option } = Select;

type ParamsProps = {
  role: string;
  id?: string;
};

type AxiosResult={
  data:any|null,
  error:any|null
}

const campusOptions = [
  { label: 'Ho Chi Minh', value: 'Ho Chi Minh' },
  { label: 'Ha Noi', value: 'Ha Noi' },
  { label: 'Da Nang', value: 'Da Nang' },
  { label: 'Can Tho', value: 'Can Tho' },
  { label: 'Quy Nhon', value: 'Quy Nhon' },
];

const EditAccount: React.FC = () => {
  const params = useParams<ParamsProps>();
  const { role } = params;
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Role checks
  const isStudent = role === 'student';
  const isStaff = role === 'staff' || role === 'manager' || role === 'advisor';

  // Default date for DatePicker
  const today = dayjs();

  // Submit handler
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // Prepare payload
      let payload: AccountPropsCreate = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        password: values.password,
      };
      let response:AxiosResult|null = null
      if (isStudent) {
        payload = {
          ...payload,
          studentProfileData:{
            enrolledAt: values.enrolledAt.format('YYYY-MM-DD'),
            careerGoal: values.careerGoal,
          },
          roleId : 5
        };
        console.log("student: ",payload)
        response = await RegisterStudent(payload);
      
      } else if (isStaff) {
        payload = {
          ...payload,
          roleId : 1,
          staffProfileData:{
            campus: values.campus,
            department: values.department,
            position: values.position,
            startWorkAt: values.startWorkAt.format('YYYY-MM-DD'),
            endWorkAt: values.endWorkAt ? values.endWorkAt.format('YYYY-MM-DD') : null,
          },
        };
        console.log("staff: ",payload)
        response = await RegisterStaff(payload);
      }
      if(response!=null){
        if(response.data){
          message.success('Account saved successfully!');
        }
        if(response.error){
          message.error('Something is wrong: ',response.error);
        }
      }else{
        message.error('Something is wrong')
      }
      message.success('Account saved successfully!');
      nav(-1);
    } catch (error) {
      message.error('Failed to save account.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider>
      <div className={styles.container}>
        <Row gutter={24} justify="center">
          <Col xs={24} md={12}>
            <Card className={styles.formCard} title="Account Information">
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  dateOfBirth: today,
                  enrolledAt: today,
                  startWorkAt: today,
                  endWorkAt: today,
                }}
                disabled={loading}
                onFinish={handleSubmit}
              >
                <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="Enter email" />
                </Form.Item>
                <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                  <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                  <Input placeholder="Enter first name" />
                </Form.Item>
                <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                  <Input placeholder="Enter last name" />
                </Form.Item>
                <Form.Item label="Date of Birth" name="dateOfBirth" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                  <Input placeholder="Enter address" />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters.' },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm password" />
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            {isStudent && (
              <Card className={styles.profileCard} title="Student Profile">
                <Form form={form} layout="vertical">
                  <Form.Item label="Enrolled At" name="enrolledAt" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Career Goal" name="careerGoal" rules={[{ required: true }]}>
                    <Input placeholder="Enter career goal" />
                  </Form.Item>
                </Form>
              </Card>
            )}
            {isStaff && (
              <Card className={styles.profileCard} title="Staff Profile">
                <Form form={form} layout="vertical">
                  <Form.Item label="Campus" name="campus" rules={[{ required: true }]}>
                    <Select placeholder="Select campus">
                      {campusOptions.map(opt => (
                        <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Department" name="department" rules={[{ required: true }]}>
                    <Input placeholder="Enter department" />
                  </Form.Item>
                  <Form.Item label="Position" name="position" rules={[{ required: true }]}>
                    <Input placeholder="Enter position" />
                  </Form.Item>
                  <Form.Item label="Start Work At" name="startWorkAt" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="End Work At" name="endWorkAt">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Form>
              </Card>
            )}
            <div className={styles.formActions} style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ marginRight: 8 }}
                onClick={() => handleSubmit()}
              >
                Save Account
              </Button>
              <Button onClick={() => nav(-1)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default EditAccount