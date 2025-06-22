import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Tag, Progress, Button } from 'antd';
import { CalculatorOutlined, AimOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

interface Grade {
  name: string;
  score: number | null;
  weight?: number;
  isEditable?: boolean;
  isSuggested?: boolean;
}

interface GradeCalculatorProps {
  isVisible: boolean;
  onClose: () => void;
  grades: Grade[];
  onGradesUpdate?: (grades: Grade[]) => void;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  isVisible,
  onClose,
  grades,
  onGradesUpdate
}) => {
  const [targetScore, setTargetScore] = useState<number>(5.0);
  const [suggestedGrades, setSuggestedGrades] = useState<Grade[]>([]);
  const [form] = Form.useForm();

  const calculateCurrentScore = (gradeList: Grade[]) => {
    const completedGrades = gradeList.filter(grade => grade.score !== null);
    if (completedGrades.length === 0) return 0;
    
    const totalWeight = gradeList.reduce((sum, grade) => sum + (grade.weight || 0), 0);
    const weightedSum = completedGrades.reduce((sum, grade) => 
      sum + ((grade.score || 0) * (grade.weight || 0)), 0);
    
    return weightedSum / totalWeight;
  };

  const suggestGrades = (target: number) => {
    const editableGrades = grades.filter(grade => grade.isEditable);
    const completedGrades = grades.filter(grade => grade.score !== null);
    
    const totalWeight = grades.reduce((sum, grade) => sum + (grade.weight || 0), 0);
    const editableWeight = editableGrades.reduce((sum, grade) => sum + (grade.weight || 0), 0);
    
    const completedScore = completedGrades.reduce((sum, grade) => 
      sum + ((grade.score || 0) * (grade.weight || 0)), 0);
    
    const requiredScore = (target * totalWeight - completedScore) / editableWeight;
    
    const suggested = grades.map(grade => {
      if (grade.isEditable && grade.score === null) {
        return {
          ...grade,
          score: Math.min(10, Math.max(0, requiredScore)),
          isSuggested: true
        };
      }
      return grade;
    });
    
    setSuggestedGrades(suggested);
  };

  const handleTargetScoreChange = (value: number | null) => {
    if (value !== null) {
      setTargetScore(value);
      suggestGrades(value);
    }
  };

  const handleApplySuggestions = () => {
    if (onGradesUpdate) {
      onGradesUpdate(suggestedGrades);
    }
    onClose();
  };

  const currentScore = calculateCurrentScore(grades);
  const projectedScore = calculateCurrentScore(suggestedGrades);
  const editableGrades = grades.filter(grade => grade.isEditable && grade.score === null);

  useEffect(() => {
    if (isVisible) {
      suggestGrades(targetScore);
    }
  }, [isVisible, grades]);

  const modalStyles = `
    .grade-calculator-modal .ant-modal-content {
      background: rgba(15, 23, 42, 0.95) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 20px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
    }
    .grade-calculator-modal .ant-modal-header {
      background: transparent !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      padding: 24px 24px 16px 24px !important;
    }
    .grade-calculator-modal .ant-modal-title {
      color: white !important;
      font-size: 20px !important;
      font-weight: 600 !important;
    }
    .grade-calculator-modal .ant-modal-body {
      padding: 24px !important;
      color: white !important;
    }
    .grade-calculator-modal .ant-modal-close {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    .grade-calculator-modal .ant-modal-close:hover {
      color: white !important;
    }
    .grade-calculator-modal .ant-input-number {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 12px !important;
      color: white !important;
    }
    .grade-calculator-modal .ant-input-number:hover {
      border-color: rgba(59, 130, 246, 0.5) !important;
    }
    .grade-calculator-modal .ant-input-number:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
    }
    .grade-calculator-modal .ant-input-number-input {
      color: white !important;
      font-size: 16px !important;
      font-weight: 500 !important;
    }
    .grade-calculator-modal .ant-form-item-label > label {
      color: rgba(255, 255, 255, 0.9) !important;
      font-weight: 500 !important;
    }
    .grade-calculator-modal .ant-progress-text {
      color: white !important;
    }
  `;

  return (
    <>
      <style>{modalStyles}</style>
      <Modal
        title={
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <CalculatorOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-white font-semibold">Pass Score Calculator</div>
              <div className="text-gray-400 text-sm">Calculate required scores to pass</div>
            </div>
          </motion.div>
        }
        open={isVisible}
        onCancel={onClose}
        footer={null}
        width={700}
        className="grade-calculator-modal"
        centered
      >
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Current Status */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AimOutlined className="text-blue-400" />
                Current Status
              </h3>
              <Tag color={currentScore >= 5 ? "green" : "red"} className="text-base font-bold px-3 py-1">
                {currentScore.toFixed(2)}/10
              </Tag>
            </div>
            <Progress 
              percent={currentScore * 10} 
              strokeColor={{
                '0%': currentScore >= 5 ? '#10b981' : '#ef4444',
                '100%': currentScore >= 5 ? '#059669' : '#dc2626'
              }}
              trailColor="rgba(255,255,255,0.1)"
              showInfo={false}
            />
            <p className="text-gray-300 text-sm mt-2">
              {currentScore >= 5 ? 'You are currently passing!' : 'You need to improve your scores to pass.'}
            </p>
          </div>

          {/* Target Score Input */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <Form form={form} layout="vertical">
              <Form.Item 
                label={
                  <span className="text-white font-medium flex items-center gap-2">
                    <AimOutlined className="text-orange-400" />
                    Target Score (out of 10)
                  </span>
                }
              >
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  value={targetScore}
                  onChange={handleTargetScoreChange}
                  className="w-full !h-12 !text-lg"
                  placeholder="Enter your target score"
                  size="large"
                />
              </Form.Item>
            </Form>
          </div>

          {/* Suggested Scores */}
          {suggestedGrades.length > 0 && editableGrades.length > 0 && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircleOutlined className="text-green-400" />
                Suggested Scores
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedGrades
                  .filter(grade => grade.isEditable && grade.score !== null)
                  .map((grade, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">{grade.name}</span>
                        <Tag color="blue" className="font-medium">Suggested</Tag>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-400">{grade.score?.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({grade.weight}%)</span>
                      </div>
                    </motion.div>
                  ))}
              </div>
              
              {/* Projected Result */}
              <motion.div 
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-2xl border border-green-500/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-1">Projected Final Score</h4>
                    <p className="text-gray-300 text-sm">If you achieve the suggested scores</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">{projectedScore.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">out of 10</div>
                  </div>
                </div>
                <Progress 
                  percent={projectedScore * 10} 
                  strokeColor={{
                    '0%': '#10b981',
                    '100%': '#059669'
                  }}
                  trailColor="rgba(255,255,255,0.1)"
                  showInfo={false}
                  className="mt-4"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div 
            className="flex gap-3 pt-4 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button 
              onClick={onClose}
              className="flex-1 !h-12 !bg-white/10 hover:!bg-white/20 !text-white !border-white/20 !rounded-xl !font-medium"
            >
              Cancel
            </Button>
            {suggestedGrades.length > 0 && (
              <Button 
                type="primary"
                onClick={handleApplySuggestions}
                className="flex-1 !h-12 !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !border-0 !rounded-xl !font-medium !shadow-lg !shadow-blue-600/25"
              >
                Apply Suggestions
              </Button>
            )}
          </motion.div>
        </motion.div>
      </Modal>
    </>
  );
};

export default GradeCalculator; 