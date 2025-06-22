import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, DatePicker, Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface TimelineItem {
  id: number;
  date: string;
  type: string;
  description: string;
}

interface CourseTimelineProps {
  initialTimeline: Omit<TimelineItem, 'id'>[];
}

const CourseTimeline: React.FC<CourseTimelineProps> = ({ initialTimeline }) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>(
    initialTimeline.map((item, index) => ({ ...item, id: index }))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<TimelineItem>>({});
  
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValues(timeline[index]);
  };

  const handleSave = (index: number) => {
    const updatedTimeline = [...timeline];
    updatedTimeline[index] = { ...updatedTimeline[index], ...editingValues } as TimelineItem;
    setTimeline(updatedTimeline);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingValues({});
  };

  const handleValueChange = (field: keyof TimelineItem, value: string) => {
    setEditingValues(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    const newItem: TimelineItem = {
      id: timeline.length > 0 ? Math.max(...timeline.map(t => t.id)) + 1 : 0,
      date: dayjs().format('MMMM D, YYYY'),
      type: 'New Item',
      description: 'Enter description...'
    };
    setTimeline(prev => [...prev, newItem]);
  };

  const handleDelete = (id: number) => {
    setTimeline(timeline.filter(item => item.id !== id));
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Assignment': 'blue',
      'Exam': 'red',
      'Project': 'purple',
      'Quiz': 'orange',
      'Presentation': 'green',
      'default': 'geekblue'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  const inputStyles = `
    .ant-picker, .ant-input, .ant-input-affix-wrapper {
        padding: 12px 16px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px !important;
        color: #fff !important;
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
    }
    .ant-picker:hover, .ant-input:hover, .ant-input-affix-wrapper:hover {
        border-color: rgba(59, 130, 246, 0.5) !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
    }
    .ant-picker:focus, .ant-input:focus, .ant-input-affix-wrapper:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
    }
    .ant-picker-input > input, .ant-input {
        color: #fff !important;
        font-size: 14px !important;
    }
    .ant-picker-suffix, .ant-input-clear-icon {
        color: rgba(255, 255, 255, 0.6) !important;
    }
    .ant-picker-clear {
        background: transparent !important;
    }
    .ant-picker-panel {
        background: rgba(15, 23, 42, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px !important;
        backdrop-filter: blur(12px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
    }
    .ant-picker-header, .ant-picker-cell, .ant-picker-header-super-btn, .ant-picker-header-prev-btn, .ant-picker-header-next-btn {
        color: #fff !important;
    }
    .ant-picker-cell:hover:not(.ant-picker-cell-selected) .ant-picker-cell-inner {
        background: rgba(59, 130, 246, 0.2) !important;
        border-radius: 8px !important;
    }
    .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner, 
    .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
        background: #3b82f6 !important;
        border-color: #3b82f6 !important;
        border-radius: 8px !important;
    }
    .ant-tag {
        border-radius: 8px !important;
        font-weight: 500 !important;
        padding: 4px 12px !important;
        border: none !important;
    }
  `;

  return (
    <div className="relative overflow-hidden">
      <style>{inputStyles}</style>
      
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <CalendarOutlined className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Course Timeline</h2>
            <p className="text-gray-300 text-sm">Track your academic progress</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
          
          <div className="space-y-8">
            <AnimatePresence>
              {timeline.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-6 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-4 border-gray-900 shadow-lg z-10"></div>
                  
                  {editingIndex === index ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-12 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DatePicker 
                            defaultValue={dayjs(editingValues.date, 'MMMM D, YYYY')}
                            onChange={(_, dateString) => handleValueChange('date', dateString as string)}
                            format="MMMM D, YYYY"
                            className="w-full"
                            size="large"
                          />
                          <Input
                            value={editingValues.type}
                            onChange={(e) => handleValueChange('type', e.target.value)}
                            placeholder="Type (e.g., Assignment 1)"
                            size="large"
                            prefix={<FileTextOutlined className="text-gray-400" />}
                          />
                        </div>
                        <Input.TextArea
                          value={editingValues.description}
                          onChange={(e) => handleValueChange('description', e.target.value)}
                          placeholder="Description"
                          autoSize={{ minRows: 3, maxRows: 6 }}
                          size="large"
                        />
                        <div className="flex gap-3 justify-end pt-2">
                          <Button 
                            type="primary" 
                            className="!bg-blue-600 hover:!bg-blue-700 !border-0 !shadow-lg !shadow-blue-600/25 !rounded-xl !h-10 !px-6 !font-semibold" 
                            icon={<SaveOutlined />} 
                            onClick={() => handleSave(index)}
                            size="large"
                          >
                            Save
                          </Button>
                          <Button 
                            className="!bg-white/10 hover:!bg-white/20 !text-white !border-white/20 !rounded-xl !h-10 !px-6" 
                            icon={<CloseOutlined />} 
                            onClick={handleCancel}
                            size="large"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="ml-12 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/8"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Tag color={getTypeColor(item.type)} className="!text-sm !font-medium">
                              {item.type}
                            </Tag>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <CalendarOutlined />
                              {item.date}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-3">{item.type}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="text" 
                            icon={<EditOutlined className="text-blue-300 hover:text-blue-400 transition-colors text-lg" />} 
                            onClick={() => handleEdit(index)}
                            className="!w-10 !h-10 !flex !items-center !justify-center hover:!bg-blue-500/20 !rounded-xl"
                          />
                          <Popconfirm
                            title="Delete this item?"
                            description="Are you sure you want to delete this timeline item?"
                            onConfirm={() => handleDelete(item.id)}
                            okText="Yes"
                            cancelText="No"
                            placement="topLeft"
                          >
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined className="text-red-400 hover:text-red-300 transition-colors text-lg" />}
                              className="!w-10 !h-10 !flex !items-center !justify-center hover:!bg-red-500/20 !rounded-xl"
                            />
                          </Popconfirm>
                        </div>
                      </div>
                      <div className="bg-black/10 p-4 rounded-xl border border-white/5">
                        <p className="text-gray-200 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty state */}
        {timeline.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarOutlined className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No timeline items yet</h3>
            <p className="text-gray-400 mb-6">Start building your course timeline by adding your first item</p>
          </motion.div>
        )}

        {/* Add Item Button - Moved to bottom */}
        <div className="flex justify-center mt-8 pt-6 border-t border-white/10">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddItem}
            size="large"
            className="!bg-orange-500 hover:!bg-orange-600 !border-0 !shadow-lg !shadow-orange-500/25 !rounded-xl !h-12 !px-8 !font-semibold"
          >
            {timeline.length === 0 ? 'Add Your First Item' : 'Add New Item'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseTimeline; 