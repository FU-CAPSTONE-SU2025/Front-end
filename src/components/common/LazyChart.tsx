import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';

// Lazy load chart components
const RechartsBarChart = lazy(() => import('recharts').then(module => ({ 
  default: module.BarChart 
})));

const RechartsLineChart = lazy(() => import('recharts').then(module => ({ 
  default: module.LineChart 
})));

const RechartsPieChart = lazy(() => import('recharts').then(module => ({ 
  default: module.PieChart 
})));

const RechartsAreaChart = lazy(() => import('recharts').then(module => ({ 
  default: module.AreaChart 
})));

// Chart loading fallback
const ChartLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 200,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    border: '1px dashed rgba(255, 255, 255, 0.2)'
  }}>
    <Spin size="large" />
    <span style={{ marginLeft: 12, color: '#666' }}>Loading chart...</span>
  </div>
);

// Lazy chart wrapper components
export const LazyBarChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <RechartsBarChart {...props} />
  </Suspense>
);

export const LazyLineChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <RechartsLineChart {...props} />
  </Suspense>
);

export const LazyPieChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <RechartsPieChart {...props} />
  </Suspense>
);

export const LazyAreaChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <RechartsAreaChart {...props} />
  </Suspense>
);

// Lazy load other chart components
export const LazyXAxis = lazy(() => import('recharts').then(module => ({ 
  default: module.XAxis 
})));

export const LazyYAxis = lazy(() => import('recharts').then(module => ({ 
  default: module.YAxis 
})));

export const LazyCartesianGrid = lazy(() => import('recharts').then(module => ({ 
  default: module.CartesianGrid 
})));

export const LazyTooltip = lazy(() => import('recharts').then(module => ({ 
  default: module.Tooltip 
})));

export const LazyLegend = lazy(() => import('recharts').then(module => ({ 
  default: module.Legend 
})));

export const LazyBar = lazy(() => import('recharts').then(module => ({ 
  default: module.Bar 
})));

export const LazyLine = lazy(() => import('recharts').then(module => ({ 
  default: module.Line 
})));

export const LazyPie = lazy(() => import('recharts').then(module => ({ 
  default: module.Pie 
})));

export const LazyArea = lazy(() => import('recharts').then(module => ({ 
  default: module.Area 
})));

export const LazyCell = lazy(() => import('recharts').then(module => ({ 
  default: module.Cell 
})));

export const LazyResponsiveContainer = lazy(() => import('recharts').then(module => ({ 
  default: module.ResponsiveContainer 
})));

// Wrapper for ResponsiveContainer with Suspense
export const LazyResponsiveChart: React.FC<any> = ({ children, ...props }) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyResponsiveContainer {...props}>
      {children}
    </LazyResponsiveContainer>
  </Suspense>
);
