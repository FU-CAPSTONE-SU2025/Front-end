import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, ConfigProvider, Modal } from 'antd';
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../css/forgetPassword.module.css';
import glassStyles from '../../css/manager/appleGlassEffect.module.css';
import { ResetPassword, SendEmail } from '../../api/Account/AuthAPI';
import { getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';
import { InfoCircleOutlined } from '@ant-design/icons';
import BackgroundWrapper from '../../components/common/backgroundWrapper';

// Custom hook for managing cooldown
const useCooldown = (initialCooldown: number = 0) => {
  const [cooldown, setCooldown] = useState(initialCooldown);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
  }, []);

  return { cooldown, startCooldown };
};

// Enhanced animation variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: -20,
    transition: { duration: 0.3 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

const iconVariants = {
  hidden: { opacity: 0, rotate: -15, scale: 0.8 },
  visible: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: { 
      duration: 0.7, 
      delay: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const ForgetPassword: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState<string | null>(null);

  // Handle email submission
  const handleClickReset = async () => {
    try {
      const values = await form.validateFields();
      const props = {
         email: values.email,
      };
      const response = await SendEmail(props);
      if (response) {
        setCurrentPage(2);
        setEmailSent(values.email);
      } else {
        Modal.error({
          title: 'Error',
          content: 'Failed to send verification code. Please try again.',
          className: styles.customModal,
        });
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      console.error('Reset password failed:', error);
      Modal.error({
        title: 'Error',
        content: errorMessage,
        className: styles.customModal,
      });
    }
  };

  // Handle verification code and new password submission
  const handleConfirmReset = async () => {
    try {
      const values = await form.validateFields();
      const props = {
        email: values.email,
        verificationCode: values.verificationCode,
        newPassword: values.newPassword,
      };
      const response = await ResetPassword(props);
      if (response) {
        Modal.success({
          title: 'Password Reset Complete',
          content: 'Your password has been successfully reset. You will be redirected to the login page.',
          className: styles.customModal,
          onOk: () => navigate('/'),
        });
      } else {
        Modal.error({
          title: 'Error',
          content: 'Failed to reset password. Please try again.',
          className: styles.customModal,
        });
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      console.error('Reset password failed:', error);
      Modal.error({
        title: 'Error',
        content: errorMessage,
        className: styles.customModal,
      });
    }
  };

  // Handle resend email
  const handleResendEmail = async () => {
    try {
      const values = await form.validateFields(['email']);
      const props = {
        data: { email: values.email },
      };
      const response = await SendEmail(props);
      return response; // Return response for child component
    } catch (error) {
      console.error('Resend email failed:', error);
      Modal.error({
        title: 'Error',
        content: 'Failed to resend verification code. Please try again.',
        className: styles.customModal,
      });
      return false;
    }
  };

  const InputEmail = React.memo(() => {
    return (
      <motion.div 
        className={`${styles.card} ${glassStyles.appleGlassCard}`}
        variants={cardVariants} 
        initial="hidden" 
        animate="visible"
        exit="exit"
      >
        <motion.div className={styles.content} variants={itemVariants}>
          <motion.div className={styles.iconContainer} variants={iconVariants}>
            <Shield className={styles.mainIcon} />
          </motion.div>
          
          <motion.h2 className={styles.title} variants={itemVariants}>
            Reset Your Password
          </motion.h2>
          
          <motion.div className={styles.description} variants={itemVariants}>
            Enter your email address and we'll send you a verification code to reset your password.
          </motion.div>
          
          <Form form={form} layout="vertical" onFinish={handleClickReset}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                placeholder="Enter your email"
                className={glassStyles.appleGlassInput}
                prefix={<Mail size={16} />}
                onChange={(e) => {
                  form.setFieldsValue({ email: e.target.value });
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={glassStyles.appleGlassButton}
                block
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Verification Code
                </motion.span>
              </Button>
            </Form.Item>
          </Form>
          
          <motion.div className={styles.emailTip} variants={itemVariants}>
            <InfoCircleOutlined />
            <span>Make sure to check your spam or promotions folder if you don't see the email in your inbox.</span>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  });

  const InputVerificationCodeAndPassword = React.memo(() => {
    const { cooldown, startCooldown } = useCooldown(30);

    const wrappedHandleResendEmail = async () => {
      const response = await handleResendEmail();
      if (response) {
        startCooldown(30);
        Modal.success({
          title: 'Email Sent',
          content: 'A new verification code has been sent to your email.',
          className: styles.customModal,
        });
      }
    };

    return (
      <motion.div 
        className={`${styles.card} ${glassStyles.appleGlassCard}`}
        variants={cardVariants} 
        initial="hidden" 
        animate="visible"
        exit="exit"
      >
        <motion.div className={styles.content} variants={itemVariants}>
          <motion.div className={styles.infoBox} variants={itemVariants}>
            <CheckCircle size={20} />
            <div>
              <strong>Verification code sent!</strong><br />
              A verification code has been sent to <b>{emailSent}</b>.<br />
              Please check your inbox and spam folder.
            </div>
          </motion.div>
          
          <motion.div className={styles.mailIcon} variants={floatingVariants} animate="animate">
            <Mail size={120} strokeWidth={1.5} className={styles.mailIconSvg} />
          </motion.div>
          
          <motion.h2 className={styles.title} variants={itemVariants}>
            Enter Verification Code & New Password
          </motion.h2>
          
          <motion.div className={styles.description} variants={itemVariants}>
            Please enter the verification code you received via email, along with your new password.
          </motion.div>
          
          <Form form={form} layout="vertical" onFinish={handleConfirmReset}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                placeholder="Enter your email"
                className={glassStyles.appleGlassInput}
                prefix={<Mail size={16} />}
                onChange={(e) => {
                  form.setFieldsValue({ email: e.target.value });
                }}
              />
            </Form.Item>
            <Form.Item
              name="verificationCode"
              rules={[{ required: true, message: 'Please enter the verification code' }]}
            >
              <Input
                type="text"
                placeholder="Verification Code"
                className={glassStyles.appleGlassInput}
                prefix={<Shield size={16} />}
              />
            </Form.Item>
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                placeholder="New Password"
                className={glassStyles.appleGlassInput}
                prefix={<Shield size={16} />}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={glassStyles.appleGlassButton}
                block
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset Password
                </motion.span>
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                type="default"
                onClick={wrappedHandleResendEmail}
                className={styles.resendButton}
                disabled={cooldown > 0}
                block
              >
                <motion.span
                  whileHover={{ scale: cooldown > 0 ? 1 : 1.05 }}
                  whileTap={{ scale: cooldown > 0 ? 1 : 0.95 }}
                >
                  {cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Email'}
                </motion.span>
              </Button>
            </Form.Item>
          </Form>
        </motion.div>
      </motion.div>
    );
  });

  return (
    <ConfigProvider>
      <BackgroundWrapper variant="animated">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={styles.backButtonContainer}
        >
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/')}
            className={`${styles.backButton} ${glassStyles.appleGlassButton}`}
          >
            Back to Login
          </Button>
        </motion.div>

        <motion.div className={styles.stepIndicatorContainer}>
          <motion.span 
            className={`${styles.stepIndicator} ${glassStyles.appleGlassCard}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Step {currentPage} of 2: {currentPage === 1 ? 'Request Reset' : 'Verify & Set New Password'}
          </motion.span>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {currentPage === 1 ? (
            <InputEmail key="email" />
          ) : currentPage === 2 ? (
            <InputVerificationCodeAndPassword key="verification" />
          ) : (
            <div className={styles.card}>Invalid Page</div>
          )}
        </AnimatePresence>
      </BackgroundWrapper>
    </ConfigProvider>
  );
};

export default ForgetPassword;