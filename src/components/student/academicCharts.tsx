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
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Bar Chart */}
    <div className="w-full">
      <Card 
        className="rounded-xl glassmorphism border-0 max-w-full h-full bg-white/10 backdrop-blur-lg border border-white/20" 
        title={
          <span className="font-semibold text-lg text-white">
            Academic Scores
          </span>
        }
      >
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={academicData}>
            <XAxis dataKey="name" stroke="#fff" fontSize={12} />
            <YAxis fontSize={12} stroke="#fff" />
            <ReTooltip 
              wrapperStyle={{ zIndex: 1000 }} 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
    
    {/* Line Chart */}
    <div className="w-full">
      <Card 
        className="rounded-xl glassmorphism border-0 max-w-full h-full bg-white/10 backdrop-blur-lg border border-white/20" 
        title={
          <span className="font-semibold text-lg text-white">
            Score Trend
          </span>
        }
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={academicData}>
            <XAxis dataKey="name" stroke="#fff" fontSize={12} />
            <YAxis fontSize={12} stroke="#fff" />
            <ReTooltip 
              wrapperStyle={{ zIndex: 1000 }} 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line type="monotone" dataKey="score" stroke="#F97316" strokeWidth={3} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
    
    {/* Pie Chart */}
    <div className="col-span-1 lg:col-span-2 w-full">
      <Card 
        className="rounded-xl glassmorphism border-0 max-w-full bg-white/10 backdrop-blur-lg border border-white/20" 
        title={
          <span className="font-semibold text-lg text-white">
            Pass/Fail Ratio
          </span>
        }
      >
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              data={pieData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={80}
              fill="#8884d8" 
              label 
              animationDuration={1000}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend 
              wrapperStyle={{ 
                fontSize: 12,
                color: '#fff'
              }} 
            />
            <ReTooltip 
              wrapperStyle={{ zIndex: 1000 }} 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  </div>
);

export default AcademicCharts; 