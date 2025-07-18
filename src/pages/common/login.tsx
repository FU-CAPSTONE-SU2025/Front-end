import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { LoginGoogleAccount, LoginAccount } from '../../api/Account/AuthAPI';
import { GoogleAccountRequestProps, LoginProps } from '../../interfaces/IAccount';
import { GoogleOutlined } from '@ant-design/icons';
import styles from '../../css/loginform.module.css';
import { Link, useNavigate } from 'react-router';
import { getAuthState } from '../../hooks/useAuths';

const { Title, Text } = Typography;



const Login: React.FC = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const { login,setAccessToken,setRefreshToken } = getAuthState();
  const nav = useNavigate();
  // Login navigation based on roleId
  // 1: Admin, 0: Student, others: Guest -> TOBEADDED
  function RoleNavigation (roleId:number){
     if(roleId === 1){
        nav('/admin')
      }
      else if(roleId === 5){
        nav('/student')
      }
      else if(roleId === 2){
        nav('/staff')
      }
      else if(roleId === 3){
        nav('/advisor')
      }
      else if (roleId === 4){
        nav('/manager')
      }else{
         nav('/404')
      }
}
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        
        const { access_token } = tokenResponse;
    
        const userAccount: GoogleAccountRequestProps = await LoginGoogleAccount(access_token);
        if (userAccount!=null) {
          message.success('Login successful');

          setAccessToken(userAccount.accessToken);
          setRefreshToken(userAccount.refreshToken);
          login(userAccount.roleId)
          RoleNavigation(userAccount.roleId)
         
        }else{
          message.error('Login failed. Please try again.');
        }

      } catch (error) {
        console.error('Google Login Error:', error);
        message.error('Google Login failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      message.error('Google Login failed. Please try again.');
    },
  });
  // Login with username and password - with the added authentication check
  const onNormalLogin = async(values: LoginProps) => {
    setIsEmailLoading(true);
    const userAccount:GoogleAccountRequestProps = await LoginAccount(values)
    if (userAccount) {
      message.success('Login successful');
          setAccessToken(userAccount.accessToken);
          setRefreshToken(userAccount.refreshToken);
          login(userAccount.roleId)
          RoleNavigation(userAccount.roleId)
    }else{
      message.error('Login failed. Please try again.');
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
    </div>
  </div>
  );
};

export default Login;