import { motion } from 'framer-motion';
import { Card, Avatar, Tooltip } from 'antd';
import { UserOutlined, StarFilled } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const user = {
  name: 'Andy',
  quote: 'Time to rise',
  avatar: '/avatar.jpg', // Update with actual path or URL
  achievements: [
    { icon: '🏆', label: 'Top 3' },
    { icon: '🎉', label: 'YOLO' },
    { icon: '😺', label: 'Cat King' },
  ],
  contributions: [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 30 },
    { month: 'Mar', value: 20 },
    { month: 'Apr', value: 40 },
    { month: 'May', value: 25 },
    { month: 'Jun', value: 35 },
  ],
};

const courses = [
  { name: 'Math', code: 'MATH101', teacher: 'Mr. A', progress: 80 },
  { name: 'Physics', code: 'PHY102', teacher: 'Ms. B', progress: 65 },
  { name: 'Chemistry', code: 'CHEM103', teacher: 'Dr. C', progress: 90 },
  { name: 'English', code: 'ENG104', teacher: 'Mrs. D', progress: 75 },
  { name: 'Programming', code: 'CS105', teacher: 'Mr. E', progress: 60 },
];

const academicData = [
  { name: 'Math', score: 8.5 },
  { name: 'Physics', score: 7.2 },
  { name: 'Chemistry', score: 9.1 },
  { name: 'English', score: 8.0 },
  { name: 'Programming', score: 7.8 },
];

const pieData = [
  { name: 'Passed', value: 4 },
  { name: 'Failed', value: 1 },
];

const COLORS = ['#3B82F6', '#F97316'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.02, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
};

const Dashboard = () => (
  <div className="min-h-screen mt-150 flex flex-col lg:flex-row ">
    {/* Left: User Info */}
    <motion.div
      className="w-full lg:w-1/3 flex flex-col items-center glassmorphism rounded-2xl p-8"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
      <motion.div whileHover={{ scale: 1.05, rotate: 2 }} transition={{ duration: 0.3 }}>
        <Avatar
          src={user.avatar}
          size={180}
          icon={<UserOutlined />}
          className="border-4 border-white shadow-2xl mb-6"
        />
      </motion.div>
      <div className="text-3xl font-bold text-white mb-2">{user.name}</div>
      <div className="text-gray-300 text-lg italic mb-6">{user.quote}</div>
      <div className="flex gap-4 mb-8">
        {user.achievements.map((ach, idx) => (
          <Tooltip title={ach.label} key={idx}>
            <motion.span
              className="text-4xl cursor-pointer"
              whileHover={{ scale: 1.3, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              {ach.icon}
            </motion.span>
          </Tooltip>
        ))}
      </div>
      <div className="w-full">
        <div className="text-white font-semibold text-lg mb-4">Contributions</div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={user.contributions}>
            <XAxis dataKey="month" stroke="#fff" fontSize={12} />
            <YAxis hide />
            <Bar dataKey="value" fill="#F97316" radius={[10, 10, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>

    {/* Right: Courses and Charts */}
    <div className="w-full lg:w-2/3 flex flex-col gap-6">
      {/* Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <motion.div
            key={course.code}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Card
              className="rounded-xl glassmorphism border-0"
              title={
                <div className="flex items-center gap-2">
                  <StarFilled className="text-yellow-400" />
                  <span className="font-semibold text-lg">{course.name}</span>
                </div>
              }
              extra={<span className="text-xs text-gray-400">{course.code}</span>}
            >
              <div className="mb-3 text-gray-600 font-medium">Teacher: {course.teacher}</div>
              <motion.div
                className="w-full bg-gray-200 rounded-full h-3 mb-3"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1 }}
              >
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </motion.div>
              <div className="text-right text-sm text-gray-500">{course.progress}% completed</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Academic Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Bar Chart */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card
            className="rounded-xl glassmorphism border-0"
            title={<span className="font-semibold text-lg">Academic Scores</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={academicData}>
                <XAxis dataKey="name" stroke="#333" fontSize={12} />
                <YAxis fontSize={12} />
                <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
                <Bar dataKey="score" fill="#3B82F6" radius={[10, 10, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        {/* Line Chart */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card
            className="rounded-xl glassmorphism border-0"
            title={<span className="font-semibold text-lg">Score Trend</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={academicData}>
                <XAxis dataKey="name" stroke="#333" fontSize={12} />
                <YAxis fontSize={12} />
                <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#F97316"
                  strokeWidth={3}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        {/* Pie Chart */}
        <motion.div
          className="col-span-1 md:col-span-2"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card
            className="rounded-xl glassmorphism border-0"
            title={<span className="font-semibold text-lg">Pass/Fail Ratio</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  label
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  </div>
);

export default Dashboard;