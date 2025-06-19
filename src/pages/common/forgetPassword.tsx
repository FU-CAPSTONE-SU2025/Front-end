import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, ConfigProvider, Modal } from 'antd';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../../css/forgetPassword.module.css';
import { ResetPassword, SendEmail } from '../../api/Account/AuthAPI';

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

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } },
};

const iconVariants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: { opacity: 0.1, rotate: 0, transition: { duration: 0.5, delay: 0.4 } },
};

const ForgetPassword: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Debug render
  //console.log('ForgetPassword rendered:', { currentPage });

  // Handle email submission
  const handleClickReset = async () => {
    try {
      const values = await form.validateFields();
      const props = {
        data: { email: values.email },
      };
    //   const response = await SendEmail(props);
        const response = 1
      if (response) {
        setCurrentPage(2);
      } else {
        Modal.error({
          title: 'Error',
          content: 'Failed to send verification code. Please try again.',
          className: styles.customModal,
        });
      }
    } catch (error) {
      console.error('Reset password failed:', error);
      Modal.error({
        title: 'Error',
        content: 'Invalid email address.',
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
      console.log('Confirm reset props:', props); // Debug log
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
          content: 'Invalid verification code or password. Please try again.',
          className: styles.customModal,
        });
      }
    } catch (error) {
      console.error('Confirm reset failed:', error);
      Modal.error({
        title: 'Error',
        content: 'Failed to reset password. Please try again.',
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
    console.log('InputEmail rendered'); // Debug log
    return (
      <motion.div className={styles.card} variants={cardVariants} initial="hidden" animate="visible">
        <motion.h2 className={styles.title} variants={itemVariants}>
          Reset Password
        </motion.h2>
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
              className={styles.input}
              onChange={(e) => {
                console.log('Email input changed:', e.target.value); // Debug log
                form.setFieldsValue({ email: e.target.value });
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
              block
            >
              Send Verification Code
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    );
  });

  const InputVerificationCodeAndPassword = React.memo(() => {
    //console.log('InputVerificationCodeAndPassword rendered'); // Debug log
    const { cooldown, startCooldown } = useCooldown(30); // Start cooldown on mount

    const wrappedHandleResendEmail = async () => {
      const response = await handleResendEmail();
      if (response) {
        startCooldown(30); // Reset cooldown
        Modal.success({
          title: 'Email Sent',
          content: 'A new verification code has been sent to your email.',
          className: styles.customModal,
        });
      }
    };

    return (
      <motion.div className={styles.card} variants={cardVariants} initial="hidden" animate="visible">
        <motion.div className={styles.mailIcon} variants={iconVariants}>
          <Mail size={120} strokeWidth={1} />
        </motion.div>
        <motion.h2 className={styles.title} variants={itemVariants}>
          Enter Verification Code and New Password
        </motion.h2>
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
              className={styles.input}
              onChange={(e) => {
                console.log('Email input changed:', e.target.value); // Debug log
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
              className={styles.input}
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
              className={styles.input}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
              block
            >
              Reset Password
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
              {cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Email'}
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    );
  });

  return (
    <ConfigProvider>
      <div className={styles.background}>
        <div className={styles.container}>
          {currentPage === 1 ? (
            <InputEmail />
          ) : currentPage === 2 ? (
            <InputVerificationCodeAndPassword />
          ) : (
            <div className={styles.card}>Invalid Page</div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ForgetPassword;