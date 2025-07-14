import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Input, Select, Button, DatePicker, ConfigProvider, message } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import styles from '../../css/admin/editAccount.module.css';
import { GetCurrentStudentUser, GetCurrentStaffUser, UpdateCurrentStaffUser, UpdateCurrentStudentUser } from '../../api/Account/UserAPI';
import { AccountProps, UpdateAccountProps } from '../../interfaces/IAccount';
import { jwtDecode } from 'jwt-decode';
import { getAuthState } from '../../hooks/useAuths';
import { JWTAccountProps } from '../../interfaces/IAccount';
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

const EditAccount: React.FC = () => {
  const params = useParams<ParamsProps>();
  const { role, id } = params;
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AccountProps | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');
  const { accessToken } = getAuthState();

  // Role checks
  const isStudent = role === 'student';
  const isStaff = role === 'staff' || role === 'manager' || role === 'advisor';

  // Get current user ID from JWT token
  const getCurrentUserId = () => {
    try {
      const data: JWTAccountProps = jwtDecode(accessToken ?? "N/A");
      return data?.UserId ?? null;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  // Get the user ID being edited
  const getEditUserId = () => {
    return id ? parseInt(id) : getCurrentUserId();
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingUser(true);
      try {
        const userId = getEditUserId();
        if (!userId) {
          message.error('Unable to identify user');
          nav(-1);
          return;
        }

        // Use role-specific API calls
        let userData: AccountProps | null = null;
        if (isStudent) {
          userData = await GetCurrentStudentUser(userId);
        } else if (isStaff) {
          userData = await GetCurrentStaffUser(userId);
        }

        if (userData) {
          setCurrentUser(userData);
          setCurrentAvatarUrl(userData.avatarUrl || '');
          // Set form values
          form.setFieldsValue({
            email: userData.email,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
            // Student specific fields
            enrolledAt: userData.studentDataDetailResponse?.enrolledAt ? dayjs(userData.studentDataDetailResponse.enrolledAt) : null,
            careerGoal: userData.studentDataDetailResponse?.careerGoal || '',
            // Staff specific fields
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
  }, [id, role, form, nav, accessToken, isStudent, isStaff]);

  // Submit handler
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const userId = getEditUserId();
      if (!userId) {
        message.error('Unable to identify user');
        return;
      }

      // Prepare update data
      const updateData: UpdateAccountProps = {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : new Date(),
        avatarUrl: currentAvatarUrl, // Use the updated avatar URL
        roleId: isStudent ? 5 : 1, // Student roleId is 5, Staff roleId is 1
        status: currentUser?.status || 1,
        staffDataUpdateRequest: null,
        studentDataUpdateRequest: null,
      };

      // Add role-specific data
      if (isStudent) {
        updateData.studentDataUpdateRequest = {
          enrolledAt: values.enrolledAt ? values.enrolledAt.toDate() : new Date(),
          doGraduate: true, // Required by interface, set to true as default
          careerGoal: values.careerGoal || '',
        };
      } else if (isStaff) {
        updateData.staffDataUpdateRequest = {
          campus: values.campus || '',
          department: values.department || '',
          position: values.position || '',
          startWorkAt: values.startWorkAt ? values.startWorkAt.toDate() : new Date(),
          endWorkAt: values.endWorkAt ? values.endWorkAt.toDate() : new Date(),
        };
      }

      // Call appropriate update API
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
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update account');
    } finally {
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
                userId={getEditUserId() || 0}
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
                <div className={styles.fieldColumn}>
                  <Form.Item label="Phone" name="phone">
                    <Input placeholder="Enter phone number" />
                  </Form.Item>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldColumn}>
                  <Form.Item label="Address" name="address">
                    <Input placeholder="Enter address" />
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