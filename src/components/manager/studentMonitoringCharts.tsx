import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  ComboComparisonData, 
  CurriculumData, 
  SemesterData, 
  GrowthTrendData 
} from '../../data/mockStudentMonitoring';

// Chart components using Recharts
interface ChartProps {
  data: any;
  loading?: boolean;
}

// Color palette for charts
const COLORS = ['#1E40AF', '#f97316', '#059669', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#a16207'];

export const ComboComparisonChart: React.FC<ChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div style={{ 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(248, 250, 252, 0.5)',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(248, 250, 252, 0.5)',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>No data available</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="combo" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151' } }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: any, name: any) => [value, 'Students']}
        />
        <Legend />
        <Bar 
          dataKey="studentCount" 
          fill="#1E40AF" 
          radius={[4, 4, 0, 0]}
          name="Students"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CurriculumDistributionChart: React.FC<ChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div style={{ 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(248, 250, 252, 0.5)',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(248, 250, 252, 0.5)',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🥧</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>No data available</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ curriculum, studentCount, percent }) => `${curriculum}: ${studentCount}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="studentCount"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: any, name: any) => [value, 'Students']}
        />
        <Legend 
          layout="vertical" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const SemesterDistributionChart: React.FC<ChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div style={{ 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(248, 250, 252, 0.5)',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(248, 250, 252, 0.5)',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📉</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>No data available</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="semester" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          label={{ value: 'Semester', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#374151' } }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151' } }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: any, name: any) => [value, 'Students']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="studentCount" 
          stroke="#059669" 
          strokeWidth={3}
          dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#059669', strokeWidth: 2, fill: '#fff' }}
          name="Students"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}; 