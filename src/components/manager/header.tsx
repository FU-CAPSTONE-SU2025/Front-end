import { NavLink } from 'react-router';
import { SearchOutlined, BellOutlined } from '@ant-design/icons';
import { Input, Button, Avatar, Badge, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Overview', path: '/manager/overview' },
  { name: 'Combos', path: '/manager/combos' },
  { name: 'Programs', path: '/manager/programs' },
  { name: 'Curricula', path: '/manager/curricula' },
  { name: 'Students', path: '/manager/students' },
];

const ManagerHeader = () => {
  return (
    <motion.header
      className="bg-blue-800 text-white shadow-md"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <div className="container mx-auto px-4">
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
            <motion.div
              className="hidden sm:block"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined className="text-blue-400" />}
                className="rounded-full w-48 focus:w-64 transition-all duration-300"
                style={{ background: '#3056d3', color: 'white' }}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
              <Button type="primary" style={{ background: '#f59e42', border: 'none' }} size="middle">
                FPTU - Ho Chi Minh
              </Button>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
                <Tooltip title="Notifications">
                  <Badge count={3} size="small" offset={[-2, 2]}>
                    <Button shape="circle" icon={<BellOutlined />} size="large" />
                  </Badge>
                </Tooltip>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.97 }}>
                <Tooltip title="Profile">
                  <Badge dot color="#52c41a" offset={[-2, 2]}>
                    <Avatar
                      size={40}
                      src="https://via.placeholder.com/150"
                      style={{ border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
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
