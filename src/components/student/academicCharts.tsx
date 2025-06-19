import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

interface AcademicData {
  name: string;
  score: number;
}
interface PieData {
  name: string;
  value: number;
}

const AcademicCharts: React.FC<{
  academicData: AcademicData[];
  pieData: PieData[];
  COLORS: string[];
}> = ({ academicData, pieData, COLORS }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    {/* Bar Chart */}
    <div>
      <Card className="rounded-xl glassmorphism border-0 max-w-full" title={<span className="font-semibold text-lg">Academic Scores</span>}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={academicData}>
            <XAxis dataKey="name" stroke="#333" fontSize={12} />
            <YAxis fontSize={12} />
            <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
            <Bar dataKey="score" fill="#3B82F6" radius={[10, 10, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
    {/* Line Chart */}
    <div>
      <Card className="rounded-xl glassmorphism border-0 max-w-full" title={<span className="font-semibold text-lg">Score Trend</span>}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={academicData}>
            <XAxis dataKey="name" stroke="#333" fontSize={12} />
            <YAxis fontSize={12} />
            <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
            <Line type="monotone" dataKey="score" stroke="#F97316" strokeWidth={3} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
    {/* Pie Chart */}
    <div className="col-span-1 md:col-span-2">
      <Card className="rounded-xl glassmorphism border-0 max-w-full" title={<span className="font-semibold text-lg">Pass/Fail Ratio</span>}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label animationDuration={1000}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReTooltip wrapperStyle={{ zIndex: 1000 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  </div>
);

export default AcademicCharts; 