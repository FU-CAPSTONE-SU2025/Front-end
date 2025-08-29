import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Input, Select, DatePicker, ConfigProvider, Modal } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import styles from '../../css/admin/editAccount.module.css';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { AccountProps, UpdateAccountProps } from '../../interfaces/IAccount';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { Program, Curriculum } from '../../interfaces/ISchoolProgram';
import { useSchoolApi } from '../../hooks/useSchoolApi';

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
  const [disableLoading, setDisableLoading] = useState(false);
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { getCurrentStudent, getCurrentStaff, updateCurrentStaff, updateCurrentStudent, registerUser, disableUser } = useAdminUsers();
  const { usePagedProgramList, usePagedCurriculumList } = useSchoolApi();

  // Program and Curriculum state for infinite scroll
  const [programs, setPrograms] = useState<Program[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [programPage, setProgramPage] = useState(1);
  const [curriculumPage, setCurriculumPage] = useState(1);
  const [hasMorePrograms, setHasMorePrograms] = useState(true);
  const [hasMoreCurriculums, setHasMoreCurriculums] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [isCurriculumModalVisible, setIsCurriculumModalVisible] = useState(false);
  const [curriculumSearchTerm, setCurriculumSearchTerm] = useState('');

  // Role checks
  const isStudent = role === 'student';
  const isStaff = role === 'staff' || role === 'manager' || role === 'advisor';

  // Use the hook to get programs
  const { data: programsData, isLoading: programsLoading } = usePagedProgramList(programPage, 10, '');
  
  // Update programs when data is loaded
  useEffect(() => {
    if (programsData?.items) {
      const newPrograms = programsData.items;
      if (programPage === 1) {
        setPrograms(newPrograms);
      } else {
        setPrograms(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPrograms = newPrograms.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPrograms];
        });
      }
      const totalPages = Math.ceil(programsData.totalCount / 10);
      setHasMorePrograms(programPage < totalPages);
    }
  }, [programsData, programPage]);

  // Fetch programs with infinite scroll (legacy function for compatibility)
  const fetchPrograms = async (page: number = 1, search: string = '') => {
    setProgramPage(page);
  };

  // Use the hook to get curriculums
  const { data: curriculumsData, isLoading: curriculumsLoading } = usePagedCurriculumList(curriculumPage, 10, curriculumSearchTerm, selectedProgramId || undefined);
  
  // Update curriculums when data is loaded
  useEffect(() => {
    if (curriculumsData?.items) {
      const newCurriculums = curriculumsData.items;
      if (curriculumPage === 1) {
        setCurriculums(newCurriculums);
      } else {
        setCurriculums(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNewCurriculums = newCurriculums.filter(c => !existingIds.has(c.id));
          return [...prev, ...uniqueNewCurriculums];
        });
      }
      const totalPages = Math.ceil(curriculumsData.totalCount / 10);
      setHasMoreCurriculums(curriculumPage < totalPages);
    }
  }, [curriculumsData, curriculumPage, selectedProgramId]);

  // Fetch curriculums with infinite scroll (legacy function for compatibility)
  const fetchCurriculums = async (page: number = 1, search: string = '', programId?: number) => {
    setCurriculumPage(page);
  };

  // Load initial data
  useEffect(() => {
    if (isStudent) {
      fetchPrograms(1);
    }
  }, [isStudent]);

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

    const loadUserData = async () => {
      setIsLoadingUser(true);
      try {
        const userId = parseInt(id);
        if (!userId) {
          handleError('Unable to identify user');
          nav(-1);
          return;
        }
        let userData: AccountProps | null = null;
        if (isStudent) {
          userData = await getCurrentStudent(userId);
        } else if (isStaff) {
          userData = await getCurrentStaff(userId);
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
            programId: userData.studentDataListResponse?.programId || null,
            curriculumCode: userData.studentDataListResponse?.curriculumCode || '',
            campus: userData.staffDataDetailResponse?.campus || '',
            department: userData.staffDataDetailResponse?.department || '',
            position: userData.staffDataDetailResponse?.position || '',
            startWorkAt: userData.staffDataDetailResponse?.startWorkAt ? dayjs(userData.staffDataDetailResponse.startWorkAt) : null,
            endWorkAt: userData.staffDataDetailResponse?.endWorkAt ? dayjs(userData.staffDataDetailResponse.endWorkAt) : null,
          });
          
          // Set selected program and fetch curriculums if editing student
          if (isStudent && userData.studentDataListResponse?.programId) {
            setSelectedProgramId(userData.studentDataListResponse.programId);
            fetchCurriculums(1, '', userData.studentDataListResponse.programId);
          }
        } else {
          handleError('Failed to load user data');
          nav(-1);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        handleError('Failed to load user data');
        nav(-1);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUserData();
  }, [id, role, form, nav, isStudent, isStaff]);

  // Handle program selection change
  const handleProgramChange = (programId: number) => {
    setSelectedProgramId(programId);
    setCurriculums([]); // Clear curriculums
    setCurriculumPage(1);
    setHasMoreCurriculums(true);
    form.setFieldValue('curriculumCode', ''); // Clear curriculum selection
    if (programId) {
      fetchCurriculums(1, '', programId);
      setIsCurriculumModalVisible(true);
    }
  };

  // Handle program dropdown scroll
  const handleProgramScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.target as HTMLDivElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
    if (nearBottom && hasMorePrograms) {
      fetchPrograms(programPage + 1);
    }
  };

  // Handle curriculum dropdown scroll
  const handleCurriculumScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.target as HTMLDivElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
    if (nearBottom && hasMoreCurriculums && selectedProgramId) {
      fetchCurriculums(curriculumPage + 1, curriculumSearchTerm, selectedProgramId);
    }
  };

  // Handle program search
  const handleProgramSearch = (value: string) => {
    setPrograms([]);
    setProgramPage(1);
    setHasMorePrograms(true);
    fetchPrograms(1, value);
  };

  // Handle curriculum search
  const handleCurriculumSearch = (value: string) => {
    setCurriculums([]);
    setCurriculumPage(1);
    setHasMoreCurriculums(true);
    setCurriculumSearchTerm(value);
    if (selectedProgramId) {
      fetchCurriculums(1, value, selectedProgramId);
    }
  };

  const openCurriculumModal = () => {
    if (!selectedProgramId) return;
    setIsCurriculumModalVisible(true);
    setCurriculumSearchTerm('');
    setCurriculumPage(1);
    setCurriculums([]);
    setHasMoreCurriculums(true);
    fetchCurriculums(1, '', selectedProgramId);
  };

  const closeCurriculumModal = () => {
    setIsCurriculumModalVisible(false);
  };

  const handleSelectCurriculum = (curriculum: Curriculum) => {
    form.setFieldValue('curriculumCode', curriculum.curriculumCode);
    setIsCurriculumModalVisible(false);
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (!id) {
        // CREATE MODE: Check password match
        if (values.password !== values.confirmPassword) {
          handleError('Passwords do not match');
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
            doGraduate: false,
            careerGoal: values.careerGoal || '',
            programId: values.programId || 1,
            curriculumCode: values.curriculumCode || '',
            registeredComboCode: values.registeredComboCode || '',
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
          await registerUser(createData);
          handleSuccess('Account created successfully!');
          nav(-1);
        } catch (err) {
          // Use the improved error handling
          console.error('Account creation error:', err);
          handleError(err, 'Failed to create account');
        }
        setLoading(false);
        return;
      }

      // EDIT MODE: Update logic as before
      const userId = parseInt(id);
      if (!userId) {
        handleError('Unable to identify user');
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
        status: currentUser?.status || 0,
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
          programId: values.programId || 1,
          curriculumCode: values.curriculumCode || '',
          registeredComboCode: values.registeredComboCode || '',
          numberOfBan: values.numberOfBan || 0,
        } : null,
      };
      let response:any
      if (isStudent) {
        response = await updateCurrentStudent({ userId, data: updateData as any });
      } else {
        response = await updateCurrentStaff({ userId, data: updateData });
      }
      if (response) {
        handleSuccess('Account updated successfully!');
        nav(-1);
      } else {
        handleError('Failed to update account', 'Failed to update account');
      }
      setLoading(false);
    } catch (error) {
      console.error('Submit error:', error);
      handleError('Failed to submit account', 'Failed to submit account');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    nav(-1);
  };

  const handleDisableAccount = () => {
    if (!id || !currentUser) {
      handleError('Unable to identify user');
      return;
    }

    const userId = parseInt(id);
    const userName = `${currentUser.firstName} ${currentUser.lastName}`;
    const userRole = currentUser.roleName || 'User';

    Modal.confirm({
      title: 'Disable Account',
      content: `Are you sure you want to disable ${userName}'s account? This action will prevent them from accessing the system.`,
      okText: 'Disable Account',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setDisableLoading(true);
        try {
          await disableUser(userId);
          handleSuccess(`${userRole} account disabled successfully`);
          nav(-1);
        } catch (error) {
          console.error('Disable account error:', error);
          handleError('Failed to disable account');
        } finally {
          setDisableLoading(false);
        }
      },
      maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
      centered: true,
      zIndex: 10000,
    });
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
              disabled={loading || disableLoading}
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

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldColumn}>
                                             <Form.Item 
                         label="Program" 
                         name="programId" 
                         rules={[{ required: true, message: 'Please select program' }]}
                       >
                         <Select
                           placeholder="Select program"
                           onSearch={handleProgramSearch}
                           onPopupScroll={handleProgramScroll}
                           onChange={handleProgramChange}
                           onClear={() => {
                             setPrograms([]);
                             setProgramPage(1);
                             setHasMorePrograms(true);
                             setSelectedProgramId(null);
                             setCurriculums([]);
                             setCurriculumPage(1);
                             setHasMoreCurriculums(true);
                             form.setFieldValue('curriculumCode', '');
                           }}
                           showSearch
                           optionFilterProp="children"
                           filterOption={(input, option) =>
                             String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                           }
                           notFoundContent={'No programs found'}
                           disabled={!!id}
                         >
                           {programs.map(program => (
                             <Option key={program.id} value={program.id} label={program.programName}>
                               {program.programName}
                             </Option>
                           ))}
                         </Select>
                       </Form.Item>
                    </div>
                    <div className={styles.fieldColumn}>
                      <Form.Item 
                        label="Curriculum Code" 
                        name="curriculumCode" 
                        rules={[{ required: true, message: 'Please select curriculum' }]}
                      >
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Input placeholder="Select a curriculum" readOnly value={form.getFieldValue('curriculumCode')} />
                          <motion.button
                            className={styles.saveButton}
                            variants={buttonVariants}
                            whileHover="hover"
                            type="button"
                            onClick={openCurriculumModal}
                            disabled={!selectedProgramId || loading || disableLoading}
                          >
                            <div className={styles.buttonContent}>Choose</div>
                          </motion.button>
                        </div>
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
                  disabled={loading || disableLoading}
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
                  disabled={loading || disableLoading}
                  type="button"
                >
                  <div className={styles.buttonContent}>Cancel</div>
                </motion.button>
                {id && (
                  <motion.button
                    className={styles.disableButton}
                    variants={buttonVariants}
                    whileHover="hover"
                    onClick={handleDisableAccount}
                    disabled={loading || disableLoading}
                    type="button"
                  >
                    <div className={styles.buttonContent}>
                      {disableLoading ? 'Disabling...' : 'Disable Account'}
                    </div>
                  </motion.button>
                )}
              </motion.div>
            </Form>
          </div>

          {/* Curriculum Selection Modal */}
          <Modal
            open={isCurriculumModalVisible}
            onCancel={closeCurriculumModal}
            footer={null}
            title="Select Curriculum"
            width="80%"
            style={{ top: 20 }}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            centered
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input
                placeholder="Search curriculum"
                value={curriculumSearchTerm}
                onChange={(e) => handleCurriculumSearch(e.target.value)}
              />
              <div
                style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}
                onScroll={handleCurriculumScroll}
              >
                {curriculums.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>
                    {curriculumsLoading ? 'Loading...' : 'No curriculums found'}
                  </div>
                )}
                {curriculums.map((c) => (
                  <div
                    key={c.id ?? c.curriculumCode}
                    style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                    onClick={() => handleSelectCurriculum(c)}
                  >
                    <div style={{ fontWeight: 600 }}>{c.curriculumName}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{c.curriculumCode}</div>
                  </div>
                ))}
                {!hasMoreCurriculums && curriculums.length > 0 && (
                  <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>End of list</div>
                )}
              </div>
            </div>
          </Modal>
        </motion.div>
      </div>
    </ConfigProvider>
  );
};

export default EditAccount;