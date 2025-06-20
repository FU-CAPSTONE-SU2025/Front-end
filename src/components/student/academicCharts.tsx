import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { BarChartOutlined, RadarChartOutlined, FrownOutlined } from '@ant-design/icons';

interface AttendanceData {
  subject: string;
  attendance: number;
}
interface ScoreData {
  category: string; // e.g. 'FE', 'Practice', 'Assignment', ...
  score: number;
}
interface SemesterData {
  semester: string;
  attendance: AttendanceData[];
  scores: ScoreData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-orange-500/50 shadow-lg">
        <p className="label text-sm text-orange-300 font-bold">{`${label}`}</p>
        <p className="intro text-white font-medium">
          {`${data.name}: `}
          <span className="text-orange-300 font-bold">{data.value}</span>
          {data.name === 'attendance' && '%'}
        </p>
      </div>
    );
  }
  return null;
};

const AcademicCharts: React.FC<{
  semesters: SemesterData[];
  selectedSemester: string;
}> = ({ semesters, selectedSemester }) => {
  const current = semesters.find(s => s.semester === selectedSemester) || semesters[0];
  const prevIdx = semesters.findIndex(s => s.semester === selectedSemester) - 1;
  const prev = prevIdx >= 0 ? semesters[prevIdx] : null;

  const cardClassName = "rounded-2xl bg-gradient-to-br from-[#2a1d1a] to-[#12102E] border border-orange-800/30 shadow-2xl shadow-orange-900/10 transition-all duration-300 hover:!border-orange-500/80 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Attendance Bar Chart */}
      <Card
        className={cardClassName}
        bordered={false}
        title={
          <div className="flex items-center gap-3 text-white">
            <BarChartOutlined className="text-xl text-orange-400" />
            <span className="font-semibold text-lg">Attendance</span>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={current.attendance} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <XAxis dataKey="subject" stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis unit="%" fontSize={12} stroke="#f6ad7c" tickLine={false} axisLine={false} />
            <ReTooltip cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} content={<CustomTooltip />} />
            <Bar name="attendance" dataKey="attendance" fill="url(#colorAttendance)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fdba74" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Radar Chart for previous semester's scores */}
      <Card
        className={cardClassName}
        bordered={false}
        title={
          <div className="flex items-center gap-3 text-white">
            <RadarChartOutlined className="text-xl text-orange-400" />
            <span className="font-semibold text-lg">Previous Semester Evaluation</span>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={250}>
          {prev ? (
            <RadarChart cx="50%" cy="50%" outerRadius={90} data={prev.scores}>
              <PolarGrid stroke="#f6ad7c" strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="category" stroke="#d1d5db" fontSize={13} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: 'transparent' }} />
              <Radar name="Score" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
              <Legend wrapperStyle={{ color: '#d1d5db', fontSize: 13, paddingTop: '10px' }} />
              <ReTooltip cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} content={<CustomTooltip />} />
            </RadarChart>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400/80">
              <FrownOutlined className="text-4xl mb-3 text-orange-400/50" />
              <p className="font-semibold">No previous semester data available</p>
            </div>
          )}
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AcademicCharts; 