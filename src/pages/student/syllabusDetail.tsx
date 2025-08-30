import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Spin, Row, Col, Input, Button, Avatar, Space, Divider } from 'antd';
import type { TabsProps } from 'antd';
import { FileTextOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined, BulbOutlined, MessageOutlined, LikeOutlined, DislikeOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSyllabusApi } from '../../hooks/useSyllabusApi';
import { usePostSubjectComment, useSubjectComments, usePostCommentReaction } from '../../hooks/useStudentFeature';
import { useMessagePopupContext } from '../../contexts/MessagePopupContext';
import Header from '../../components/student/syllabusDetail/header';
import Sidebar from '../../components/student/syllabusDetail/sidebar';
import { Assessments, Materials, Outcomes, Sessions } from '../../components/student/syllabusDetail/tabs';
import { FetchSubjectTips } from '../../api/SchoolAPI/subjectAPI';
import MarkdownRenderer from '../../components/common/markdownRenderer';

const { TextArea } = Input;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const SyllabusDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useSyllabusById } = useSyllabusApi();
  const { data: syllabus, isLoading: loading, error: syllabusError } = useSyllabusById(id || '');
  const error = syllabusError ? 'Failed to fetch syllabus details.' : null;

  // Tips inline section state
  const [isTipsLoading, setIsTipsLoading] = useState(false);
  const [tipsContent, setTipsContent] = useState<any>(null);

  // Comments state
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Comment API hooks
  const postCommentMutation = usePostSubjectComment();
  const postReactionMutation = usePostCommentReaction();
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useSubjectComments(syllabus?.subjectId ? Number(syllabus.subjectId) : null, currentPage, pageSize);
  
  // Message popup context
  const { showSuccess, showError, showWarning } = useMessagePopupContext();

  const handleGenerateTips = async () => {
    if (!id) return;
    setIsTipsLoading(true);
    setTipsContent(null);
    try {
      const data = await FetchSubjectTips(Number(id));
      setTipsContent(data);
    } catch (e) {
      setTipsContent({ message: 'Unable to generate tips right now. Please try again later.' });
    } finally {
      setIsTipsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      await postReactionMutation.mutateAsync({
        commentId,
        reactionType: 1 // 1 = like
      });
      showSuccess('Reaction added successfully!');
    } catch (error) {
      showError('Failed to add reaction. Please try again.');
      console.error('Error adding like reaction:', error);
    }
  };

  const handleDislikeComment = async (commentId: number) => {
    try {
      await postReactionMutation.mutateAsync({
        commentId,
        reactionType: 2 // 2 = unlike
      });
      showSuccess('Reaction added successfully!');
    } catch (error) {
      showError('Failed to add reaction. Please try again.');
      console.error('Error adding dislike reaction:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      showWarning('Please enter a comment before submitting.');
      return;
    }

    if (!syllabus?.subjectId) {
      showError('Subject ID not found.');
      return;
    }

    try {
      await postCommentMutation.mutateAsync({
        subjectId: Number(syllabus.subjectId),
        content: newComment.trim()
      });
      
      setNewComment('');
      showSuccess('Comment submitted successfully!');
      
      // Refetch comments to get the latest data
      refetchComments();
    } catch (error) {
      showError('Failed to submit comment. Please try again.');
      console.error('Error submitting comment:', error);
    }
  };

  const handleShowMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const hasMoreComments = commentsData && commentsData.totalCount > (currentPage * pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const mainTabItems: TabsProps['items'] = [
    { 
      key: '1', 
      label: (
        <span className="flex !text-white items-center gap-2">
          <FileTextOutlined />
          Assessments
        </span>
      ), 
      children: <Assessments assessments={syllabus?.assessments || []} /> 
    },
    { 
      key: '2', 
      label: (
        <span className="flex items-center gap-2">
          <BookOutlined />
          Materials
        </span>
      ), 
      children: <Materials materials={syllabus?.learningMaterials || []} /> 
    },
    { 
      key: '3', 
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Outcomes
        </span>
      ), 
      children: <Outcomes outcomes={syllabus?.learningOutcomes || []} /> 
    },
    { 
      key: '4', 
      label: (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Sessions
        </span>
      ), 
      children: <Sessions sessions={syllabus?.sessions || []} /> 
    },
  ];

  const contentTabItems: TabsProps['items'] = [
    {
      key: 'content',
      label: (
        <span className="flex text-lg items-center gap-2">
          Syllabus Content
        </span>
      ),
      children: (
        <div className="!space-y-5">
          <motion.div variants={itemVariants as any}>
            <Card
              variant='borderless'
              className="!text-white !border-white/30 !bg-white/10  shadow-lg"
              styles={{ body: { padding: 24 } }}
            >
              <Tabs
                defaultActiveKey="1"
                items={mainTabItems}
                className="minimal-tabs"
              />
            </Card>
          </motion.div>

          {/* Inline Tips Section */}
          <motion.div variants={itemVariants as any}>
            <Card
              variant='borderless'
              className="!border-white/30 !bg-white/10 "
              title={(
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 !text-white"><BulbOutlined /> Study Tips</span>
                  <button
                    onClick={handleGenerateTips}
                    disabled={isTipsLoading}
                    className="inline-flex items-center gap-2 !px-3 !py-1 !bg-orange-500 hover:!bg-orange-600 !border-orange-500 !rounded-full !shadow-lg hover:!shadow-xl !text-white   transition-all duration-200"
                  >
                    <BulbOutlined />
                    <span>{isTipsLoading ? 'Generating...' : 'Generate Tips'}</span>
                  </button>
                </div>
              )}
            >
              {isTipsLoading ? (
                <div className="flex items-center justify-center py-10"><Spin /></div>
              ) : tipsContent ? (
                <div className="prose max-w-none !text-white">
                  {typeof tipsContent === 'string' ? (
                    <MarkdownRenderer content={tipsContent} />
                  ) : (
                    <MarkdownRenderer content={JSON.stringify(tipsContent, null, 2)} />
                  )}
                </div>
              ) : (
                <div className="!text-gray-300">Click Generate Tips to get AI-powered study advice.</div>
              )}
            </Card>
          </motion.div>
        </div>
      )
    },
    {
      key: 'comments',
      label: (
        <span className="flex text-lg items-center gap-2">
          Student Comments
        </span>
      ),
      children: (
        <motion.div variants={itemVariants as any}>
          <Card
            variant='borderless'
            className="!border-white/30 !bg-white/10  shadow-lg"
            styles={{ body: { padding: 24 } }}
          >
            {/* Comment Input Section */}
            <div className="mb-8">
              <div className="flex items-start gap-3">
                <Avatar 
                  icon={<UserOutlined />} 
                  size={40}
                  className="bg-blue-500"
                />
                <div className="flex-1">
                  <TextArea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this syllabus..."
                    rows={3}
                    className="border-white/30 rounded-lg resize-none !bg-white/10 !text-white placeholder:!text-white/50"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs !text-white/60">
                      {newComment.length}/500 characters
                    </span>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSubmitComment}
                      loading={postCommentMutation.isPending}
                      disabled={!newComment.trim()}
                      className="rounded-lg"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Divider className="!border-white/20" />

            {/* Comments List */}
            <div className="space-y-4">
              {commentsLoading && currentPage === 1 ? (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center gap-3">
                    <Spin size="large" />
                    <span className="!text-white/60 text-sm">Loading comments...</span>
                  </div>
                </div>
              ) : commentsData?.items && commentsData.items.length > 0 ? (
                <>
                  {commentsData.items.map((comment: any, index: number) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      className="group hover:bg-white/10 rounded-lg p-3 transition-all duration-200"
                    >
                      <div className="flex gap-3">
                        <Avatar 
                          icon={<UserOutlined />} 
                          size={40}
                          className="bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold !text-white truncate">{comment.fullName}</span>
                            <span className="text-xs !text-white/60 flex-shrink-0">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="!text-white/80 mb-3 leading-relaxed break-words">{comment.content}</p>
                          
                          {/* Like/Dislike Actions */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 bg-white/10 !text-white hover:bg-blue-500/20 hover:!text-blue-300 hover:scale-105 active:scale-95 border border-white/20"
                            >
                              <LikeOutlined className="text-base" />
                              <span className="font-medium">{comment.likeCount}</span>
                            </button>
                            
                            <button
                              onClick={() => handleDislikeComment(comment.id)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 bg-white/10 !text-white hover:bg-red-500/20 hover:!text-red-300 hover:scale-105 active:scale-95 border border-white/20"
                            >
                              <DislikeOutlined className="text-base" />
                              <span className="font-medium">{comment.unlikeCount}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Show More Button */}
                  {hasMoreComments && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-center pt-6"
                    >
                      <Button
                        onClick={handleShowMore}
                        loading={commentsLoading}
                        type="text"
                        size="large"
                        className="!text-blue-300 hover:!text-blue-200 hover:bg-blue-500/20 px-6 py-2 h-auto text-base font-medium transition-all duration-200"
                      >
                        {commentsLoading ? (
                          <span className="flex items-center gap-2">
                            <Spin size="small" />
                            Loading more...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <MessageOutlined />
                            Show more comments
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-16 !text-white/60"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <MessageOutlined className="text-3xl !text-white/40" />
                    </div>
                    <div>
                      <p className="text-lg font-medium !text-white/80 mb-1">No comments yet</p>
                      <p className="!text-white/60">Be the first to share your thoughts about this syllabus!</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spin size="large" />
          <div className="!text-white/80 mt-4 block">Loading syllabus details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 !text-red-400">Error</div>
          <div className="!text-white/60">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="!min-h-screen "
    >
      <div className="!container !mx-auto !px-4 !py-8 !mt-16">
        <Header syllabus={syllabus} navigate={navigate} />
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Sidebar syllabus={syllabus} />
          </Col>
          
          <Col xs={24} lg={16}>
            <motion.div variants={itemVariants as any}>
              <Card
          
                className="!bg-white/10 !backdrop-blur-md !border !border-white/20 !shadow-2xl"
                styles={{ body: { padding: 0 } }}
              >
                <Tabs
                  defaultActiveKey="content"
                  items={contentTabItems}
                  className="minimal-tabs"

                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>
      
      <style>{`
        .minimal-table .ant-table-thead > tr > th {
         
          color: white !important;
          font-weight: 600 !important;
      
          font-size: 12px !important;
        }
        .minimal-table .ant-table-tbody > tr > td {
        
          font-size: 12px !important;
          color: white !important;
        }
        .minimal-table .ant-table-tbody > tr:hover > td {
          background-color: rgba(255,255,255,0.1) !important;
        }
        .minimal-tabs .ant-tabs-tab {
          font-weight: 500 !important;
          padding: 12px 20px !important;
          font-size: 14px !important;
          margin: 0 4px 0 0 !important;
         
          transition: all 0.2s ease !important;
     
        }
     
     
    
        .minimal-tabs .ant-tabs-content-holder {
          padding: 24px !important;
        }
        .minimal-tabs .ant-tabs-nav::before {
          border-bottom: none !important;
        }
        .minimal-timeline .ant-timeline-item-content {
          margin-left: 20px !important;
        }
        .minimal-tabs .ant-tabs-tab-btn {
          color: rgba(255,255,255,0.8) !important;
        }
        .minimal-tabs .ant-tabs-tab-btn:hover {
          color: white !important;
        }
        .minimal-tabs .ant-tabs-ink-bar {
          background:rgb(254, 143, 25) !important;
        }
      `}</style>
    </motion.div>
  );
};

export default SyllabusDetail; 