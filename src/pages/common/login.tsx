import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleAccountAuthen, LoginAccount, LoginAccountWithGoogle } from '../../api/Account/AccountAPI';
import { DemoAccountProps, GoogleAccountRequestProps, LoginProps } from '../../interface/IAccount';
import { GoogleOutlined } from '@ant-design/icons';
import styles from '../../css/loginform.module.css';
import { Link, useNavigate } from 'react-router';
import { TokenProps } from '../../interface/IAuthen';
import { getAuthState, getTokenState, useAuths, useToken } from '../../hooks/useAuths';
import { jwtDecode } from 'jwt-decode';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const nav = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const {setAccessToken,setRefreshToken,accessToken} = getTokenState()
  const { login, setUserRole } = getAuthState();
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
  // Login with userName and password - with the added authentication check
  const onNormalLogin = async(values: LoginProps) => {
    //console.log('Login values:', values);
    setIsEmailLoading(true);
    const response:TokenProps|null = await LoginAccount(values)
    if (response!=null) {
      alert('Login successful');
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      const accountData:DemoAccountProps = jwtDecode(response.accessToken)
      // Check that user is authenticated
      // set user role
      login()
      setUserRole(accountData.Role)
      //console.log("Login Redirected to: ",accountData.Role)
      if(accountData.Role === "2"){
        nav('/admin')
      }
      else if(accountData.Role === "1"){
        nav('/admin')
      }
      else if(accountData.Role === "0"){
        nav('/guest')
      }
      else
        nav('/')
      // ADD ROUTE HERE
    }else{
      alert('Login failed. Please try again.');
    }
    setIsEmailLoading(false);
  };

  return (
  <div className={styles.background}>
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
          ---Or use your username and password---
        </Text>
        <Form
          name="username-login"
          onFinish={onNormalLogin}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="userName"
            rules={[
              { required: true, message: 'Please enter your username!' },
              { type: 'string', message: 'Please enter a valid username!' },
            ]}
          >
            <Input placeholder="userName" size="large" />
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
                * Note: Login using your FPTU account. Via '@fpt.edu.vn' or FEID email
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