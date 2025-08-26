import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Spin, Empty, Button } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { SubjectCheckpoint } from '../../interfaces/IStudent';
import { useSubjectCheckpoints, useCheckpointDetail, useDeleteCheckpoint } from '../../hooks/useStudentFeature';
import CheckpointDetailModal from './checkpointDetailModal';
import CheckpointEditModal from './checkpointEditModal';
import DeleteCheckpointModal from './deleteCheckpointModal';
import AIGenerateTodoModal from './aiGenerateTodoModal';
import AddManualTodoModal from './addManualTodoModal';
import { message } from 'antd';

interface TodoListProps {
  checkpoints: SubjectCheckpoint[];
  isLoading?: boolean;
  joinedSubjectId?: number;
}

const TodoList: React.FC<TodoListProps> = ({ checkpoints, isLoading = false, joinedSubjectId }) => {
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCheckpointId, setEditingCheckpointId] = useState<number | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingCheckpointId, setDeletingCheckpointId] = useState<number | null>(null);
  const [deletingCheckpointTitle, setDeletingCheckpointTitle] = useState<string>('');
  const [isAIGenerateTodoModalVisible, setIsAIGenerateTodoModalVisible] = useState(false);
  const [isAddManualTodoModalVisible, setIsAddManualTodoModalVisible] = useState(false);

  // Hook for deleting checkpoint
  const deleteCheckpointMutation = useDeleteCheckpoint();

  // Fetch checkpoint details when modal is opened
  const { data: checkpointDetail, isLoading: detailLoading } = useCheckpointDetail(
    isModalVisible ? selectedCheckpointId : null
  );

  // Fetch checkpoint details for edit modal
  const { data: editingCheckpointDetail, isLoading: editDetailLoading } = useCheckpointDetail(
    isEditModalVisible ? editingCheckpointId : null
  );

  // Sort checkpoints by deadline (newest to oldest)
  const sortedCheckpoints = [...checkpoints].sort((a, b) => 
    new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (checkpoint: SubjectCheckpoint) => {
    if (checkpoint.isCompleted) return 'text-green-500';
    
    const daysUntil = getDaysUntilDeadline(checkpoint.deadline);
    if (daysUntil < 0) return 'text-red-500'; // Overdue
    if (daysUntil <= 3) return 'text-orange-500'; // Due soon
    return 'text-blue-500'; // Normal
  };

  const getStatusText = (checkpoint: SubjectCheckpoint) => {
    if (checkpoint.isCompleted) return 'Completed';
    
    const daysUntil = getDaysUntilDeadline(checkpoint.deadline);
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 3) return `Due in ${daysUntil} days`;
    return `Due in ${daysUntil} days`;
  };

  const handleCheckpointClick = (checkpointId: number) => {
    setSelectedCheckpointId(checkpointId);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCheckpointId(null);
  };

  const handleEditClick = (e: React.MouseEvent, checkpointId: number) => {
    e.stopPropagation();
    setEditingCheckpointId(checkpointId);
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, checkpointId: number, checkpointTitle: string) => {
    e.stopPropagation();
    setDeletingCheckpointId(checkpointId);
    setDeletingCheckpointTitle(checkpointTitle);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCheckpointId) {
      try {
        await deleteCheckpointMutation.mutateAsync(deletingCheckpointId);
        message.success('Checkpoint deleted successfully');
        setIsDeleteModalVisible(false);
        setDeletingCheckpointId(null);
        setDeletingCheckpointTitle('');
      } catch (error) {
        message.error('Failed to delete checkpoint');
      }
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
    setDeletingCheckpointId(null);
    setDeletingCheckpointTitle('');
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setEditingCheckpointId(null);
  };

  const handleAIGenerateTodoClick = () => {
    setIsAIGenerateTodoModalVisible(true);
  };

  const handleAIGenerateTodoModalClose = () => {
    setIsAIGenerateTodoModalVisible(false);
  };

  const handleAddManualTodoClick = () => {
    setIsAddManualTodoModalVisible(true);
  };

  const handleAddManualTodoModalClose = () => {
    setIsAddManualTodoModalVisible(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-center flex-1">Course Timeline</h2>
          {joinedSubjectId && (
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleAIGenerateTodoClick}
              size="large"
              className="!bg-blue-500 hover:!bg-blue-600 !border-blue-500 hover:!border-blue-600"
            >
              AI Gen Todo
            </Button>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center py-16">
          {/* Loading icon container */}
          <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
          </div>
          
          {/* Loading text */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-white">
              Loading Timeline
            </h3>
            <p className="text-gray-300 text-base">
              Please wait while we fetch your course milestones...
            </p>
          </div>
          
          {/* Loading dots */}
          <div className="mt-8 flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-center flex-1">Course Timeline</h2>
          {joinedSubjectId && (
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleAIGenerateTodoClick}
              size="large"
              className="!bg-blue-500 hover:!bg-blue-600 !border-blue-500 hover:!border-blue-600"
            >
              AI Gen Todo
            </Button>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center py-16">
          
          {/* Text content with better spacing */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-white">
              No Timeline Available
            </h3>
            <p className="text-gray-300 text-base max-w-md mx-auto leading-relaxed">
              Course timeline and milestones will appear here once they are added to your curriculum.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-8 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full opacity-60"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full opacity-40"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full opacity-20"></div>
          </div>
        </div>

        {/* AI Generate Todo Modal */}
        <AIGenerateTodoModal
          isVisible={isAIGenerateTodoModalVisible}
          onClose={handleAIGenerateTodoModalClose}
          joinedSubjectId={joinedSubjectId}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-center flex-1">Course Timeline</h2>
          {joinedSubjectId && (
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<RobotOutlined />}
                onClick={handleAIGenerateTodoClick}
                size="large"
                className="!bg-blue-500 hover:!bg-blue-600 !border-blue-500 hover:!border-blue-600"
              >
                AI Gen Todo
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddManualTodoClick}
                size="large"
                className="!bg-green-500 hover:!bg-green-600 !border-green-500 hover:!border-green-600"
              >
                Add Manual Todo
              </Button>
            </div>
          )}
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/20"></div>
          
          <div className="space-y-6">
            {sortedCheckpoints.map((checkpoint, index) => (
              <motion.div
                key={checkpoint.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start"
              >
                {/* Timeline dot */}
                <div className={`absolute left-4 top-2 w-4 h-4 rounded-full border-2 ${
                  checkpoint.isCompleted 
                    ? 'bg-green-500 border-green-500' 
                    : getDaysUntilDeadline(checkpoint.deadline) < 0
                      ? 'bg-red-500 border-red-500'
                      : getDaysUntilDeadline(checkpoint.deadline) <= 3
                        ? 'bg-orange-500 border-orange-500'
                        : 'bg-blue-500 border-blue-500'
                }`}>
                  {/* Green checkmark for completed checkpoints */}
                  {checkpoint.isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircleOutlined className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Content card - Clickable */}
                <div 
                  className={`ml-12 flex-1 p-4 rounded-xl border transition-all duration-300 cursor-pointer relative ${
                    checkpoint.isCompleted 
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                  }`}
                  onClick={() => handleCheckpointClick(checkpoint.id)}
                >
                  {/* Completion ribbon for completed checkpoints */}
                  {checkpoint.isCompleted && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                      <CheckCircleOutlined className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        checkpoint.isCompleted ? 'line-through text-gray-400' : 'text-white'
                      }`}>
                        {checkpoint.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <CalendarOutlined className="w-4 h-4" />
                          <span>{formatDate(checkpoint.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status badge and Action buttons */}
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        checkpoint.isCompleted 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : getDaysUntilDeadline(checkpoint.deadline) < 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : getDaysUntilDeadline(checkpoint.deadline) <= 3
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {checkpoint.isCompleted ? (
                          <CheckCircleOutlined className="w-3 h-3" />
                        ) : (
                          <ClockCircleOutlined className="w-3 h-3" />
                        )}
                        <span>{getStatusText(checkpoint)}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                          onClick={(e) => handleEditClick(e, checkpoint.id)}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30 w-6 h-6 flex items-center justify-center"
                          title="Edit checkpoint"
                        >
                          <EditOutlined className="w-2.5 h-2.5 text-white" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteClick(e, checkpoint.id, checkpoint.title)}
                          className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30 hover:border-red-500/50 w-6 h-6 flex items-center justify-center"
                          title="Delete checkpoint"
                        >
                          <DeleteOutlined className="w-2.5 h-2.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-8 pt-4 border-t border-white/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">
              Total: {checkpoints.length} milestones
            </span>
            <span className="text-green-400">
              Completed: {checkpoints.filter(c => c.isCompleted).length}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <CheckpointDetailModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        checkpointDetail={checkpointDetail}
        isLoading={detailLoading}
      />

      {/* Edit Modal */}
      <CheckpointEditModal
        isVisible={isEditModalVisible}
        onClose={handleEditModalClose}
        checkpointDetail={editingCheckpointDetail}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCheckpointModal
        isVisible={isDeleteModalVisible}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        checkpointTitle={deletingCheckpointTitle}
        isLoading={deleteCheckpointMutation.isPending}
      />

      {/* AI Generate Todo Modal */}
      <AIGenerateTodoModal
        isVisible={isAIGenerateTodoModalVisible}
        onClose={handleAIGenerateTodoModalClose}
        joinedSubjectId={joinedSubjectId}
      />

      {/* Add Manual Todo Modal */}
      <AddManualTodoModal
        isVisible={isAddManualTodoModalVisible}
        onClose={handleAddManualTodoModalClose}
        joinedSubjectId={joinedSubjectId}
      />
    </>
  );
};

export default TodoList;
