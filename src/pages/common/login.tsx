import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleAccountAuthen, LoginAccount, LoginAccountWithGoogle } from '../../api/Account/AccountAPI';
import { GoogleAccountRequestProps, LoginProps } from '../../interface/IAccount';
import { GoogleOutlined } from '@ant-design/icons';
import loginImage from '/img/login.png';
import styles from '../../css/loginform.module.css';
import { Link } from 'react-router';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const { access_token } = tokenResponse;
        const userAccount: GoogleAccountRequestProps = await GoogleAccountAuthen(access_token);
        const response = await LoginAccountWithGoogle(userAccount.email);
        if (response!=null) {
          alert('Login successful');
        }else{
          alert('Login failed. Please try again.');
        }

      } catch (error) {
        console.error('Google Login Error:', error);
        alert('Google Login failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      alert('Google Login failed. Please try again.');
    },
  });

  const onEmailLogin = async(values: LoginProps) => {
    setIsEmailLoading(true);
    const response = await LoginAccount(values)
    if (response!=null) {
      alert('Login successful');
    }else{
      alert('Login failed. Please try again.');
    }
    setIsEmailLoading(false);
  };

  return (
    <div className={styles.background}>
      <img
        src={loginImage}
        alt="AISEA Background"
        className={styles.backgroundImage}
      />
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <Title level={2} className={styles.title}>
          Login to AISEA
        </Title>
        <Button
          type="primary"
          size="large"
          icon={<GoogleOutlined />}
          className={styles.googleButton}
          onClick={() => googleLogin()}
          loading={isGoogleLoading}
        >
          Login with Google
        </Button>
        <Text className={styles.description}>
          ---Or use your email and password---
        </Text>
        <Form
          name="email-login"
          onFinish={onEmailLogin}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className={styles.googleButton}
              loading={isEmailLoading}
            >
              Login
            </Button>
            <Typography className={styles.comment}>
                * Note: Login using your FPTU email account. Via '@fpt.edu.vn' or FEID email
              </Typography>
          </Form.Item>
          <Form.Item>
              <Typography.Link className={styles.registerLink}>
                <Link to="/register">Don't have an account? Register here</Link>
              </Typography.Link>
            </Form.Item>
        </Form>
      </Card>
    </div>
    </div>
  );
};

export default Login;