import { NavLink, useNavigate } from 'react-router';
import {Avatar, Badge, Tooltip, Tag } from 'antd';
import { motion } from 'framer-motion';
import Notification from '../common/Notification';

const navLinks = [
  { name: 'Programs', path: '/manager/program' },
  { name: 'Curriculum', path: '/manager/curriculum' },
  { name: 'Combos', path: '/manager/combo' },
  { name: 'Subjects', path: '/manager/subject' },
  { name: 'Student Monitoring', path: '/manager/student-monitoring' },
];

const ManagerHeader = () => {
  const navigate = useNavigate();
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
              <img  src="/Logo.svg" alt="AI SEA Logo" className="h-10" />
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
            <Tag color="orange" style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '4px 12px',
              borderRadius: '16px',
              border: '2px solid #fa8c16',
              backgroundColor: 'rgba(250, 140, 22, 0.1)',
              color: '#fa8c16',
              marginLeft: '16px',
              boxShadow: '0 2px 4px rgba(250, 140, 22, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              alignSelf: 'center'
            }}>
              Manager
            </Tag>
          </div>
          <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.97 }}>
                <Tooltip title="Profile">
                  <span
                    style={{
                      fontSize: 16,
                      cursor: 'pointer',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: 'rgba(30, 64, 175, 0.08)',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => navigate('/manager')}
                  >
                    View Profile
                  </span>
                </Tooltip>
              </motion.div>
            </div>
          <Notification/>
        </div>
      </div>
    </motion.header>
  );
};

export default ManagerHeader;
