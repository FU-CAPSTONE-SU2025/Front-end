import { NavLink, useNavigate } from 'react-router';
import { SearchOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons';
import { Input, Button, Avatar, Badge, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { getAuthState } from '../../hooks/useAuths';

const navLinks = [
  { name: 'Programs', path: '/manager/program' },
  { name: 'Curriculum', path: '/manager/curriculum' },
  { name: 'Combos', path: '/manager/combo' },
  { name: 'Subjects', path: '/manager/subject' },
  { name: 'Student Monitoring', path: '/manager/student-monitoring' },
];

const ManagerHeader = () => {
  const navigate = useNavigate();
  const { logout } = getAuthState();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      className="fixed w-full bg-blue-800 text-white shadow-md z-50"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <div className="container mx-auto px-4 z-50">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Nav Links */}
          <div className="flex items-center space-x-8">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center"
            >
              <img src="/img/Logo.svg" alt="AI SEA Logo" className="h-10" />
            </motion.div>
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <NavLink
                    to={link.path}
                    end={link.path === '/manager'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-white text-blue-800 shadow'
                          : 'hover:bg-blue-700'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* Search, User Info */}
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
              <Button 
                type="primary" 
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ background: '#f59e42', border: 'none' }} 
                size="middle"
              >
                Logout
              </Button>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.97 }}>
                <Tooltip title="Profile">
                  <Badge dot color="#52c41a" offset={[-2, 2]}>
                    <Avatar
                      size={40}
                      src="https://via.placeholder.com/150"
                      style={{ border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                      onClick={() => navigate('/manager')}
                    />
                  </Badge>
                </Tooltip>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ManagerHeader;
