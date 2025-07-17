import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Input, Select, DatePicker, ConfigProvider, message } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import styles from '../../css/admin/editAccount.module.css';
import { GetCurrentStudentUser, GetCurrentStaffUser, UpdateCurrentStaffUser, UpdateCurrentStudentUser, RegisterUser } from '../../api/Account/UserAPI';
import { AccountProps, UpdateAccountProps } from '../../interfaces/IAccount';

import AvatarUpload from '../../components/common/AvatarUpload';

const { Option } = Select;

type ParamsProps = {
  role: string;
  id?: string;
};

const campusOptions = [
  { label: 'Ho Chi Minh', value: 'Ho Chi Minh' },
  { label: 'Ha Noi', value: 'Ha Noi' },
  { label: 'Da Nang', value: 'Da Nang' },
  { label: 'Can Tho', value: 'Can Tho' },
  { label: 'Quy Nhon', value: 'Quy Nhon' },
];

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05, opacity: 0.9, transition: { duration: 0.2 } },
};

// Map role string to roleId
const getRoleId = (role: string) => {
  switch (role) {
    case 'admin': return 1;
    case 'staff': return 2;
    case 'advisor': return 3;
    case 'manager': return 4;
    case 'student': return 5;
    default: return 2; // default to staff if unknown
  }
};

const EditAccount: React.FC = () => {
  const params = useParams<ParamsProps>();
  const { role, id } = params;
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AccountProps | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(!!id); // Only loading if editing
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');

  // Role checks
  const isStudent = role === 'student';
  const isStaff = role === 'staff' || role === 'manager' || role === 'advisor';

  // Only fetch user data if editing (id is present)
  useEffect(() => {
    if (!id) {
      // Create mode: clear form and state
      setCurrentUser(null);
      setCurrentAvatarUrl('');
      form.resetFields();
      setIsLoadingUser(false);
      return;
    }
    // Edit mode: fetch user data
    const loadUserData = async () => {
      setIsLoadingUser(true);
      try {
        const userId = parseInt(id);
        if (!userId) {
          message.error('Unable to identify user');
          nav(-1);
          return;
        }
        let userData: AccountProps | null = null;
        if (isStudent) {
          userData = await GetCurrentStudentUser(userId);
        } else if (isStaff) {
          userData = await GetCurrentStaffUser(userId);
        }
        if (userData) {
          setCurrentUser(userData);
          setCurrentAvatarUrl(userData.avatarUrl || '');
          form.setFieldsValue({
            email: userData.email,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
            enrolledAt: userData.studentDataDetailResponse?.enrolledAt ? dayjs(userData.studentDataDetailResponse.enrolledAt) : null,
            careerGoal: userData.studentDataDetailResponse?.careerGoal || '',
            campus: userData.staffDataDetailResponse?.campus || '',
            department: userData.staffDataDetailResponse?.department || '',
            position: userData.staffDataDetailResponse?.position || '',
            startWorkAt: userData.staffDataDetailResponse?.startWorkAt ? dayjs(userData.staffDataDetailResponse.startWorkAt) : null,
            endWorkAt: userData.staffDataDetailResponse?.endWorkAt ? dayjs(userData.staffDataDetailResponse.endWorkAt) : null,
          });
        } else {
          message.error('Failed to load user data');
          nav(-1);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        message.error('Failed to load user data');
        nav(-1);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUserData();
  }, [id, role, form, nav, isStudent, isStaff]);

  // Submit handler
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!id) {
        // CREATE MODE: Check password match
        if (values.password !== values.confirmPassword) {
          message.error('Passwords do not match');
          setLoading(false);
          return;
        }
        // Build AccountPropsCreate payload
        const createData = {
          email: values.email,
          username: values.username,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : new Date(),
          roleId: getRoleId(role || 'staff'),
          studentProfileData: isStudent ? {
            numberOfBan: 0,
            enrolledAt: values.enrolledAt ? values.enrolledAt.toDate() : new Date(),
            doGraduate: true,
            careerGoal: values.careerGoal || '',
          } : null,
          staffProfileData: isStaff ? {
            campus: values.campus || '',
            department: values.department || '',
            position: values.position || '',
            startWorkAt: values.startWorkAt ? values.startWorkAt.toDate() : new Date(),
            endWorkAt: values.endWorkAt ? values.endWorkAt.toDate() : new Date(),
          } : null,
        };
        try {
          await RegisterUser(createData);
          message.success('Account created successfully!');
          nav(-1);
        } catch (err) {
          message.error('Failed to create account');
        }
        setLoading(false);
        return;
      }

      // EDIT MODE: Update logic as before
      const userId = parseInt(id);
      if (!userId) {
        message.error('Unable to identify user');
        setLoading(false);
        return;
      }
      const updateData: UpdateAccountProps = {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : new Date(),
        avatarUrl: currentAvatarUrl,
        roleId: isStudent ? 5 : 1,
        status: currentUser?.status || 1,
        staffDataUpdateRequest: isStaff ? {
          campus: values.campus || '',
          department: values.department || '',
          position: values.position || '',
          startWorkAt: values.startWorkAt ? values.startWorkAt.toDate() : new Date(),
          endWorkAt: values.endWorkAt ? values.endWorkAt.toDate() : new Date(),
        } : null,
        studentDataUpdateRequest: isStudent ? {
          enrolledAt: values.enrolledAt ? values.enrolledAt.toDate() : new Date(),
          doGraduate: true,
          careerGoal: values.careerGoal || '',
        } : null,
      };
      let response;
      if (isStudent) {
        response = await UpdateCurrentStudentUser(userId, updateData as any);
      } else {
        response = await UpdateCurrentStaffUser(userId, updateData);
      }
      if (response) {
        message.success('Account updated successfully!');
        nav(-1);
      } else {
        message.error('Failed to update account');
      }
      setLoading(false);
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Failed to submit account');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    nav(-1);
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setCurrentAvatarUrl(newAvatarUrl);
  };

  const getUserRole = () => {
    if (isStudent) return 'student';
    if (role === 'manager') return 'manager';
    if (role === 'advisor') return 'advisor';
    return 'staff';
  };

  if (isLoadingUser) {
    return (
      <div className={styles.container}>
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>Loading user data...</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBgContainer: 'rgba(255,255,255,0.95)',
            colorBorder: 'rgba(30, 64, 175, 0.25)',
            colorText: '#0F172A',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          Select: {
            colorBgContainer: 'rgba(255,255,255,0.95)',
            colorBorder: 'rgba(30, 64, 175, 0.25)',
            colorText: '#0F172A',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          DatePicker: {
            colorBgContainer: 'rgba(255,255,255,0.95)',
            colorBorder: 'rgba(30, 64, 175, 0.25)',
            colorText: '#0F172A',
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
          },
          Button: {
            colorPrimary: '#1E40AF',
            colorPrimaryHover: '#1d4ed8',
            colorText: '#fff',
            colorTextLightSolid: '#fff',
            colorTextDisabled: '#bdbdbd',
          },
        },
      }}
    >
      <div className={styles.container}>
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <div className={styles.avatarSection}>
              <AvatarUpload
                userId={parseInt(id || '0')}
                currentAvatarUrl={currentAvatarUrl}
                userRole={getUserRole()}
                size={120}
                onAvatarUpdate={handleAvatarUpdate}
                disabled={isLoadingUser}
                className={styles.avatar}
              />
            </div>
            <h1 className={styles.name}>
              {isStudent ? 'Edit Student Account' : 'Edit Staff Account'}
            </h1>
            <div className={styles.profileInfo}>
              <div className={styles.role}>{currentUser?.roleName || 'User'}</div>
              <div className={styles.divider}>•</div>
              <div className={styles.email}>{currentUser?.email || 'No email'}</div>
            </div>
          </div>

          <div className={styles.formFields}>
            <Form
              form={form}
              layout="vertical"
              disabled={loading}
              onFinish={handleSubmit}
              className={styles.form}
            >
              {/* Basic Information */}
              <div className={styles.sectionTitle}>Basic Information</div>
              
              <div className={styles.fieldRow}>
                <div className={styles.fieldColumn}>
                  <Form.Item 
                    label="First Name" 
                    name="firstName" 
                    rules={[{ required: true, message: 'Please enter first name' }]}
                  >
                    <Input placeholder="Enter first name" />
                  </Form.Item>
                </div>
                <div className={styles.fieldColumn}>
                  <Form.Item 
                    label="Last Name" 
                    name="lastName" 
                    rules={[{ required: true, message: 'Please enter last name' }]}
                  >
                    <Input placeholder="Enter last name" />
                  </Form.Item>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldColumn}>
                  <Form.Item 
                    label="Username" 
                    name="username" 
                    rules={[{ required: true, message: 'Please enter username' }]}
                  >
                    <Input placeholder="Enter username" />
                  </Form.Item>
                </div>
                <div className={styles.fieldColumn}>
                  <Form.Item 
                    label="Email Address" 
                    name="email" 
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Enter email address" />
                  </Form.Item>
                </div>
              </div>

              {!id && (
                <div className={styles.fieldRow}>
                  <div className={styles.fieldColumn}>
                    <Form.Item 
                      label="Password" 
                      name="password" 
                      rules={[{ required: true, message: 'Please enter password' }]}
                      hasFeedback
                    >
                      <Input.Password placeholder="Enter password"  autoComplete="new-password" />
                    </Form.Item>
                  </div>
                  <div className={styles.fieldColumn}>
                    <Form.Item
                      label="Confirm Password"
                      name="confirmPassword"
                      dependencies={["password"]}
                      hasFeedback
                      rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match'));
                          },
                        })
                      ]}
                    >
                      <Input.Password placeholder="Confirm password" autoComplete="new-password" />
                    </Form.Item>
                  </div>
                </div>
              )}

              <div className={styles.fieldRow}>
                <div className={styles.fieldColumn}>
                  <Form.Item 
                    label="Date of Birth" 
                    name="dateOfBirth" 
                    rules={[{ required: true, message: 'Please select date of birth' }]}
                  >
                    <DatePicker 
                      placeholder="Select date of birth"
                      format="YYYY-MM-DD"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Role-specific Information */}
              {isStudent && (
                <>
                  <div className={styles.sectionTitle}>Student Information</div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldColumn}>
                      <Form.Item 
                        label="Enrollment Date" 
                        name="enrolledAt" 
                        rules={[{ required: true, message: 'Please select enrollment date' }]}
                      >
                        <DatePicker 
                          placeholder="Select enrollment date"
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>
                    <div className={styles.fieldColumn}>
                      <Form.Item 
                        label="Career Goal" 
                        name="careerGoal" 
                        rules={[{ required: true, message: 'Please enter career goal' }]}
                      >
                        <Input placeholder="Enter career goal" />
                      </Form.Item>
                    </div>
                  </div>
                </>
              )}

              {isStaff && (
                <>
                  <div className={styles.sectionTitle}>Staff Information</div>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldColumn}>
                      <Form.Item 
                        label="Campus" 
                        name="campus" 
                        rules={[{ required: true, message: 'Please select campus' }]}
                      >
                        <Select placeholder="Select campus">
                          {campusOptions.map(opt => (
                            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    <div className={styles.fieldColumn}>
                      <Form.Item 
                        label="Department" 
                        name="department" 
                        rules={[{ required: true, message: 'Please enter department' }]}
                      >
                        <Input placeholder="Enter department" />
                      </Form.Item>
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldColumn}>
                      <Form.Item 
                        label="Position" 
                        name="position" 
                        rules={[{ required: true, message: 'Please enter position' }]}
                      >
                        <Input placeholder="Enter position" />
                      </Form.Item>
                    </div>
                    <div className={styles.fieldColumn}>
                      <Form.Item 
                        label="Start Work Date" 
                        name="startWorkAt" 
                        rules={[{ required: true, message: 'Please select start work date' }]}
                      >
                        <DatePicker 
                          placeholder="Select start work date"
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldColumn}>
                      <Form.Item label="End Work Date" name="endWorkAt">
                        <DatePicker 
                          placeholder="Select end work date (optional)"
                          format="YYYY-MM-DD"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <motion.div 
                className={styles.editActions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.button
                  className={styles.saveButton}
                  variants={buttonVariants}
                  whileHover="hover"
                  onClick={handleSubmit}
                  disabled={loading}
                  type="button"
                >
                  <div className={styles.buttonContent}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </div>
                </motion.button>
                <motion.button
                  className={styles.cancelButton}
                  variants={buttonVariants}
                  whileHover="hover"
                  onClick={handleCancel}
                  disabled={loading}
                  type="button"
                >
                  <div className={styles.buttonContent}>Cancel</div>
                </motion.button>
              </motion.div>
            </Form>
          </div>
        </motion.div>
      </div>
    </ConfigProvider>
  );
};

export default EditAccount;