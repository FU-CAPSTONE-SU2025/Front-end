import { motion } from 'framer-motion';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useMemo } from 'react';

interface Achievement {
  icon: string;
  label: string;
}
interface GpaBySemester {
  semester: string;
  gpa: number;
}
interface UserInfo {
  name: string;
  quote: string;
  avatar: string;
  achievements?: Achievement[];
  gpaHistory?: GpaBySemester[];
}

// Lightweight shape for API user
interface ApiUserInfo {
  id?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  avatarUrl?: string | null;
  roleName?: string;
  status?: number;
  studentDataDetailResponse?: {
    id?: number;
    enrolledAt?: string;
    careerGoal?: string;
    numberOfBan?: number;
    programId?: number;
    registeredComboCode?: string;
    curriculumCode?: string;
    gitAccountUsername?: string;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.01, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.25)', transition: { duration: 0.3 } },
};

const FALLBACK_AVATAR = 'https://i.pinimg.com/736x/86/af/d1/86afd13a3e5f13435b39c31a407bbaa9.jpg';

const UserInfoCard: React.FC<{ user: UserInfo; userInfor: ApiUserInfo | any }> = ({ user, userInfor }) => {
  const safeUser = useMemo(() => ({
    name: user?.name ?? 'Student',
    quote: user?.quote ?? '',
    avatar: user?.avatar || FALLBACK_AVATAR,
  }), [user]);

  const [avatarUrl, setAvatarUrl] = useState(safeUser.avatar);

  const hasApiData = useMemo(() => !!(userInfor && (userInfor.firstName || userInfor.lastName || userInfor.name)), [userInfor]);
  const displayName = useMemo(() => {
    if (userInfor?.firstName || userInfor?.lastName) {
      return `${userInfor.firstName ?? ''} ${userInfor.lastName ?? ''}`.trim() || 'Student';
    }
    return userInfor?.name || safeUser.name;
  }, [userInfor, safeUser.name]);
  const displayQuote = useMemo(() => {
    return userInfor?.studentDataDetailResponse?.careerGoal || safeUser.quote || '';
  }, [userInfor, safeUser.quote]);
  const displayDob = useMemo(() => {
    if (!userInfor?.dateOfBirth) return null;
    try { return new Date(userInfor.dateOfBirth).toLocaleDateString(); } catch { return null; }
  }, [userInfor]);

  // Debug logging - removed for production
  // console.log('=== UserInfoCard Debug Data ===');
  // console.log('user prop:', user);
  // console.log('userInfor prop:', userInfor);
  // console.log('hasApiData:', hasApiData);
  // console.log('displayName:', displayName);
  // console.log('displayQuote:', displayQuote);
  // console.log('displayDob:', displayDob);
  // console.log('gitAccountUsername:', userInfor?.studentDataDetailResponse?.gitAccountUsername);
  // console.log('studentDataDetailResponse:', userInfor?.studentDataDetailResponse);
  // console.log('================================');

  useEffect(() => {
    if (userInfor && 'avatarUrl' in userInfor) {
      setAvatarUrl(userInfor.avatarUrl || FALLBACK_AVATAR);
    }
  }, [userInfor?.avatarUrl]);

  return (
    <motion.div
      className="relative w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 lg:p-10 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
      {/* Decorative halo */}
      <div className="pointer-events-none select-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-400/10 to-sky-400/0 blur-3xl" />
      <div className="pointer-events-none select-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-sky-500/20 via-blue-400/10 to-indigo-400/0 blur-3xl" />

      <div className="flex flex-col items-center text-center relative z-10">
        {/* Avatar with subtle ring */}
        <div className="relative mb-6">
          <div className="absolute inset-0 -z-10 translate-y-2 blur-2xl rounded-full bg-gradient-to-br from-blue-500/20 to-sky-400/10" style={{ width: 180, height: 180 }} />
          <div className="p-1 rounded-full !bg-orange-500 hover:!bg-orange-600 !border-orange-500">
            <div className="rounded-full bg-black/30 p-1">
              <Avatar
                src={avatarUrl}
                size={{ xs: 104, sm: 120, md: 144, lg: 168, xl: 184, xxl: 184 }}
                icon={<UserOutlined />}
                
              />
            </div>
          </div>
        </div>

        {/* Name and quote */}
        <div className="text-white font-extrabold tracking-tight mb-2" style={{ fontSize: 30, lineHeight: 1.15 }}>
          {displayName}
        </div>
        {displayQuote && (
          <div className="text-gray-200/95 italic mb-5 px-3 max-w-2xl" style={{ fontSize: 16 }}>
            “{displayQuote}”
          </div>
        )}

        {/* Info list */}
        <div className="w-full max-w-xl text-left">
          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {userInfor?.email && (
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Email</span>
                <span className="text-white font-medium break-all text-sm">{userInfor.email}</span>
              </div>
            )}
            {displayDob && (
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Date of Birth</span>
                <span className="text-white font-medium text-sm">{displayDob}</span>
              </div>
            )}
            {userInfor?.studentDataDetailResponse?.curriculumCode && (
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Curriculum</span>
                <span className="text-white font-medium text-right text-sm">{userInfor.studentDataDetailResponse.curriculumCode}</span>
              </div>
            )}
            {userInfor?.studentDataDetailResponse?.enrolledAt && (
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-gray-300 text-sm">Enrolled</span>
                <span className="text-white font-medium text-sm">{new Date(userInfor.studentDataDetailResponse.enrolledAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="px-5 py-3 flex items-center justify-between">
              <span className="text-gray-300 text-sm">Github</span>
              <span className="text-white font-medium text-sm">
                {userInfor?.studentDataDetailResponse?.gitAccountUsername || 'No data'}
              </span>
            </div>
          </div>
        </div>

        {/* Loading/empty placeholder */}
        {!hasApiData && (
          <div className="w-full max-w-xl mt-4">
            <div className="bg-white/10 text-white/90 rounded-xl px-4 py-3 border border-white/20 text-center">
              Profile info is loading or unavailable at the moment.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserInfoCard; 