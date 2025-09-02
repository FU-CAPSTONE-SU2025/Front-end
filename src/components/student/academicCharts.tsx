import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, LineChart, Line, CartesianGrid, ComposedChart, AreaChart, Area } from 'recharts';
import { BarChartOutlined, RadarChartOutlined, FrownOutlined } from '@ant-design/icons';
import '../../css/academicCharts.css';

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

// New API-driven datasets (kept local to avoid cross-imports)
interface SemesterPerformance {
  semesterId: number;
  semesterName: string;
  subjectsAttempted: number;
  subjectsPassed: number;
  creditsAttempted: number;
  creditsEarned: number;
  averageFinalScore: number;
}

interface CategoryPerformance {
  category: string;
  averageScore: number;
  totalWeight: number;
}

interface CheckpointPoint {
  year: number;
  month: number;
  total: number;
  completed: number;
  overdue: number;
  yearMonthLabel: string;
}

const tooltipContainerStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(2,6,23,0.8)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(249,115,22,0.5)',
  boxShadow: '0 10px 20px rgba(0,0,0,0.25)'
};
const tooltipTitleStyle: React.CSSProperties = { color: '#fdba74', fontWeight: 700, fontSize: 12, margin: 0, marginBottom: 4 };
const tooltipTextStyle: React.CSSProperties = { color: '#ffffff', fontWeight: 500, margin: 0 };
const tooltipValueStyle: React.CSSProperties = { color: '#fdba74', fontWeight: 700 };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={tooltipContainerStyle}>
        <p style={tooltipTitleStyle}>{`${label}`}</p>
        <p style={tooltipTextStyle}>
          {`${data.name}: `}
          <span style={tooltipValueStyle}>{data.value}</span>
          {data.name === 'attendance' && '%'}
        </p>
      </div>
    );
  }
  return null;
};

const transparentStyles = { background: 'transparent' } as const;

const titleRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, color: '#ffffff' };
const titleTextStyle: React.CSSProperties = { fontWeight: 600, fontSize: 16, color: '#ffffff' };
const titleIconStyle: React.CSSProperties = { fontSize: 18, color: '#f97316' };

const AcademicCharts: React.FC<{
  // Legacy props (for backward compatibility)
  semesters?: SemesterData[];
  selectedSemester?: string;
  // New API-driven props
  semesterPerformance?: SemesterPerformance[] | null;
  categoryPerformance?: CategoryPerformance[] | null;
  checkpointTimeline?: CheckpointPoint[] | null;
}> = ({ semesters = [], selectedSemester = '', semesterPerformance, categoryPerformance, checkpointTimeline }) => {
  const hasApiData = !!(semesterPerformance || categoryPerformance || checkpointTimeline);

  const cardClassName = "rounded-2xl bg-gradient-to-br from-[#2a1d1a] to-[#12102E] border !border-orange-800/30 shadow-2xl shadow-orange-900/10 transition-all duration-300 hover:!border-orange-500/80 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]";

  // Legacy behavior fallback
  const current = semesters && semesters.length > 0 && (semesters.find(s => s.semester === selectedSemester) || semesters[0]);
  const prevIdx = semesters ? (semesters.findIndex(s => s.semester === selectedSemester) - 1) : -1;
  const prev = prevIdx >= 0 ? semesters[prevIdx] : null;

  // Derived/transformed data for new charts
  const semesterPerfForCharts = (semesterPerformance || []).map(s => ({
    name: s.semesterName,
    subjectsAttempted: s.subjectsAttempted,
    subjectsPassed: s.subjectsPassed,
    avgScore: Number((s.averageFinalScore ?? 0).toFixed(2)),
  }));

  const creditsPerfForCharts = (semesterPerformance || []).map(s => ({
    name: s.semesterName,
    creditsAttempted: s.creditsAttempted,
    creditsEarned: s.creditsEarned,
  }));

  const categoryPerfForCharts = (categoryPerformance || []).map(c => ({
    category: c.category,
    averageScore: c.averageScore,
  }));

  const checkpointForCharts = (checkpointTimeline || []).map(p => ({
    label: p.yearMonthLabel,
    completed: p.completed,
    overdue: p.overdue,
    remaining: Math.max(0, (p.total || 0) - (p.completed || 0) - (p.overdue || 0)),
  }));

  if (!hasApiData && (!semesters || semesters.length === 0)) {
    return (
      <div className="charts-scope grid grid-cols-1 !gap-8">
        <Card className={cardClassName} variant="borderless" bodyStyle={transparentStyles} headStyle={transparentStyles}>
          <div className="charts-empty">
            <div>
              <FrownOutlined style={{ fontSize: 32, color: 'rgba(249,115,22,0.5)', marginBottom: 12 }} />
              <p className="font-semibold">No data available</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // If API data exists, render the new multi-chart layout
  if (hasApiData) {
    return (
      <div className="charts-scope grid grid-cols-1 lg:grid-cols-2 !gap-8">
        {/* 1) Subjects Attempted vs Passed with Avg Score line (ComposedChart) */}
        <Card
          className={cardClassName}
          variant="borderless"
          bodyStyle={transparentStyles}
          headStyle={transparentStyles}
          title={
            <div style={titleRowStyle}>
              <BarChartOutlined style={titleIconStyle} />
              <span style={titleTextStyle}>Semester Performance</span>
            </div>
          }
        >
          <div style={{ padding: '0 16px 8px', color: '#d1d5db', fontSize: 12 }}>
            <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>
              Track your subject enrollment and success rate across semesters. Bars show attempted vs passed subjects, line shows your average final score.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={semesterPerfForCharts} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#f6ad7c22" />
              <XAxis dataKey="name" stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 10]} stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
              <ReTooltip 
                cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={tooltipContainerStyle}>
                        <p style={tooltipTitleStyle}>{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} style={tooltipTextStyle}>
                            {entry.name}: <span style={tooltipValueStyle}>{entry.value}</span>
                            {entry.name === 'Avg Score' && ' /10'}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="left" name="Attempted" dataKey="subjectsAttempted" fill="url(#colorAttempted)" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="left" name="Passed" dataKey="subjectsPassed" fill="url(#colorPassed)" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" name="Avg Score" type="monotone" dataKey="avgScore" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <defs>
                <linearGradient id="colorAttempted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fdba74" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#86efac" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* 2) Credits Attempted vs Earned (BarChart) */}
        <Card
          className={cardClassName}
          variant="borderless"
          bodyStyle={transparentStyles}
          headStyle={transparentStyles}
          title={
            <div style={titleRowStyle}>
              <BarChartOutlined style={titleIconStyle} />
              <span style={titleTextStyle}>Credits Progress</span>
            </div>
          }
        >
          <div style={{ padding: '0 16px 8px', color: '#d1d5db', fontSize: 12 }}>
            <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>
              Monitor your credit accumulation progress. Compare credits attempted vs successfully earned each semester.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={creditsPerfForCharts} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#f6ad7c22" />
              <XAxis dataKey="name" stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
              <ReTooltip 
                cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={tooltipContainerStyle}>
                        <p style={tooltipTitleStyle}>{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} style={tooltipTextStyle}>
                            {entry.name}: <span style={tooltipValueStyle}>{entry.value} credits</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar name="Credits Attempted" dataKey="creditsAttempted" fill="url(#colorCreditsAttempted)" radius={[8, 8, 0, 0]} />
              <Bar name="Credits Earned" dataKey="creditsEarned" fill="url(#colorCreditsEarned)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorCreditsAttempted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="colorCreditsEarned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fde68a" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 3) Category Average Scores (RadarChart) */}
        <Card
          className={cardClassName}
          variant="borderless"
          bodyStyle={transparentStyles}
          headStyle={transparentStyles}
          title={
            <div style={titleRowStyle}>
              <RadarChartOutlined style={titleIconStyle} />
              <span style={titleTextStyle}>Category Performance</span>
            </div>
          }
        >
          <div style={{ padding: '0 16px 8px', color: '#d1d5db', fontSize: 12 }}>
            <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>
              View your performance across different assessment categories. Each point represents your average score in that category (scale: 0-10).
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart cx="50%" cy="50%" outerRadius={90} data={categoryPerfForCharts}>
              <PolarGrid stroke="#f6ad7c" strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="category" stroke="#d1d5db" fontSize={13} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#d1d5db', fontSize: 11 }} />
              <Radar name="Avg Score" dataKey="averageScore" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
              <Legend wrapperStyle={{ color: '#d1d5db', fontSize: 13, paddingTop: '10px' }} />
              <ReTooltip 
                cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={tooltipContainerStyle}>
                        <p style={tooltipTitleStyle}>{label}</p>
                        <p style={tooltipTextStyle}>
                          Average Score: <span style={tooltipValueStyle}>{payload[0].value}/10</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* 4) Checkpoint Timeline (Stacked AreaChart) */}
        <Card
          className={cardClassName}
          variant="borderless"
          bodyStyle={transparentStyles}
          headStyle={transparentStyles}
          title={
            <div style={titleRowStyle}>
              <BarChartOutlined style={titleIconStyle} />
              <span style={titleTextStyle}>Checkpoint Timeline</span>
            </div>
          }
        >
          <div style={{ padding: '0 16px 8px', color: '#d1d5db', fontSize: 12 }}>
            <p style={{ margin: '0 0 8px 0', opacity: 0.8 }}>
              Track your checkpoint completion progress over time. Shows completed, overdue, and remaining tasks by month.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={checkpointForCharts} stackOffset="expand" margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#f6ad7c22" />
              <XAxis dataKey="label" stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `${Math.round((v as number) * 100)}%`} stroke="#f6ad7c" fontSize={12} tickLine={false} axisLine={false} />
              <ReTooltip 
                cursor={{ stroke: '#f97316', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={tooltipContainerStyle}>
                        <p style={tooltipTitleStyle}>{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} style={tooltipTextStyle}>
                            {entry.name}: <span style={tooltipValueStyle}>{entry.value} tasks</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <defs>
                <linearGradient id="completedArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.65}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.15}/>
                </linearGradient>
                <linearGradient id="overdueArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.65}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15}/>
                </linearGradient>
                <linearGradient id="remainingArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.65}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.15}/>
                </linearGradient>
              </defs>
              <Area type="monotone" name="Completed" dataKey="completed" stackId="a" stroke="#22c55e" fill="url(#completedArea)" />
              <Area type="monotone" name="Overdue" dataKey="overdue" stackId="a" stroke="#ef4444" fill="url(#overdueArea)" />
              <Area type="monotone" name="Remaining" dataKey="remaining" stackId="a" stroke="#f59e0b" fill="url(#remainingArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    );
  }

  // Legacy two-card layout
  return (
    <div className="charts-scope grid grid-cols-1 lg:grid-cols-2 !gap-8">
      {/* Attendance Bar Chart */}
      <Card
        className={cardClassName}
        variant="borderless"
        bodyStyle={transparentStyles}
        headStyle={transparentStyles}
        title={
          <div style={titleRowStyle}>
            <BarChartOutlined style={titleIconStyle} />
            <span style={titleTextStyle}>Attendance</span>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={current?.attendance || []} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
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
        variant="borderless"
        bodyStyle={transparentStyles}
        headStyle={transparentStyles}
        title={
          <div style={titleRowStyle}>
            <RadarChartOutlined style={titleIconStyle} />
            <span style={titleTextStyle}>Previous Semester Evaluation</span>
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
            <div className="charts-empty">
              <div>
                <FrownOutlined style={{ fontSize: 32, color: 'rgba(249,115,22,0.5)', marginBottom: 12 }} />
              <p className="font-semibold">No previous semester data available</p>
              </div>
            </div>
          )}
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AcademicCharts; 