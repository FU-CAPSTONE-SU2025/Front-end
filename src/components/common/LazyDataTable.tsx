import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';

// Lazy load table components
const LazyTable = lazy(() => import('antd').then(module => ({ 
  default: module.Table 
})));

const LazyPagination = lazy(() => import('antd').then(module => ({ 
  default: module.Pagination 
})));

// Table loading fallback
const TableLoader = () => (
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
    <span style={{ marginLeft: 12, color: '#666' }}>Loading table...</span>
  </div>
);

// Lazy table wrapper component
export const LazyDataTable: React.FC<any> = (props) => (
  <Suspense fallback={<TableLoader />}>
    <LazyTable {...props} />
  </Suspense>
);

// Lazy pagination wrapper component
export const LazyPaginationComponent: React.FC<any> = (props) => (
  <Suspense fallback={<div>Loading pagination...</div>}>
    <LazyPagination {...props} />
  </Suspense>
);

// Lazy load other heavy components
export const LazyModal = lazy(() => import('antd').then(module => ({ 
  default: module.Modal 
})));

export const LazyForm = lazy(() => import('antd').then(module => ({ 
  default: module.Form 
})));

export const LazySelect = lazy(() => import('antd').then(module => ({ 
  default: module.Select 
})));

export const LazyDatePicker = lazy(() => import('antd').then(module => ({ 
  default: module.DatePicker 
})));

export const LazyUpload = lazy(() => import('antd').then(module => ({ 
  default: module.Upload 
})));

// Wrapper for Modal with Suspense
export const LazyModalWrapper: React.FC<any> = (props) => (
  <Suspense fallback={<div>Loading modal...</div>}>
    <LazyModal {...props} />
  </Suspense>
);

// Wrapper for Form with Suspense
export const LazyFormWrapper: React.FC<any> = (props) => (
  <Suspense fallback={<div>Loading form...</div>}>
    <LazyForm {...props} />
  </Suspense>
);
