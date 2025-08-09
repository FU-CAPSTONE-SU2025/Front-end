import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { LoginGoogleAccount, LoginAccount } from '../../api/Account/AuthAPI';
import { GoogleAccountRequestProps, LoginProps } from '../../interfaces/IAccount';
import { GoogleOutlined } from '@ant-design/icons';
import styles from '../../css/loginform.module.css';
import { Link, useNavigate } from 'react-router';
import { getAuthState } from '../../hooks/useAuths';
import { showForNavigation, hideLoading, showForAuth } from '../../hooks/useLoading';
import BackgroundWrapper from '../../components/common/backgroundWrapper';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';

const { Title, Text } = Typography;



const Login: React.FC = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const { login,setAccessToken,setRefreshToken } = getAuthState();
  const nav = useNavigate();
  const { showError, showSuccess } = useMessagePopupContext();
  const { handleError } = useApiErrorHandler();
  
  // Login navigation based on roleId
  // 1: Admin, 0: Student, others: Guest -> TOBEADDED
  function RoleNavigation (roleId:number){
     if(roleId === 1){
        showForNavigation('Navigating to Admin Dashboard...');
        setTimeout(() => {
          nav('/admin');
          hideLoading();
        }, 5000);
      }
      else if(roleId === 5){
        showForNavigation('Welcome to AISEA...');
        setTimeout(() => {
          nav('/student');
          hideLoading();
        }, 1500);
      }
      else if(roleId === 2){
        showForNavigation('Navigating to Staff Page...');
        setTimeout(() => {
          nav('/staff');
          hideLoading();
        }, 1500);
      }
      else if(roleId === 3){
        showForNavigation('Navigating to Advisor Page...');
        setTimeout(() => {
          nav('/advisor');
          hideLoading();
        }, 1500);
      }
      else if (roleId === 4){
        showForNavigation('Navigating to Manager Page...');
        setTimeout(() => {
          nav('/manager');
          hideLoading();
        }, 1500);
      }else{
         showForNavigation('Navigating...');
         setTimeout(() => {
           nav('/404');
           hideLoading();
         }, 1500);
      }
}
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      showForAuth('Authenticating with Google...');
      try {
        
        const { access_token } = tokenResponse;
    
        const userAccount: GoogleAccountRequestProps = await LoginGoogleAccount(access_token);
        if (userAccount!=null) {
          showSuccess('Login successful');

          setAccessToken(userAccount.accessToken);
          setRefreshToken(userAccount.refreshToken);
          login(userAccount.roleId)
          RoleNavigation(userAccount.roleId)
         
        }else{
          showError('Login failed. Please try again.');
          hideLoading();
        }

      } catch (error) {
        console.error('Google Login Error:', error);
        handleError(error, 'Login failed');
        hideLoading();
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      handleError(error, 'Login failed');
      hideLoading();
    },
  });
  // Login with username and password - with the added authentication check
  const onNormalLogin = async(values: LoginProps) => {
    setIsEmailLoading(true);
    showForAuth('Authenticating...');
    try {
      const userAccount:GoogleAccountRequestProps = await LoginAccount(values)
      if (userAccount) {
        showSuccess('Login successful');
        setAccessToken(userAccount.accessToken);
        setRefreshToken(userAccount.refreshToken);
        login(userAccount.roleId)
        RoleNavigation(userAccount.roleId)
      }else{
        showError('Login failed. Please try again.');
        hideLoading();
      }
    } catch (error) {
      console.error('Login Error:', error);
      handleError(error, 'Login failed');
      hideLoading();
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <BackgroundWrapper variant="animated">
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
            name="username"
            rules={[
              { required: true, message: 'Please enter your username!' },
              { type: 'string', message: 'Please enter a valid username!' },
            ]}
          >
            <Input placeholder="username" size="large" />
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
                * Note: Login using your FPTU account. Via '@fpt.edu.vn' or FEID account
              </Typography>
          </Form.Item>
          <Form.Item>
              <Typography className={styles.registerLink}>
                <Link to="/forgetpassword">Forgot your password? Go here</Link>
              </Typography>
            </Form.Item>
        </Form>
      </Card>
    </BackgroundWrapper>
  );
};

export default Login;