import { useState } from 'react';

export const useMeetingModals = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showMarkAdvisorMissedModal, setShowMarkAdvisorMissedModal] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(true);
  const [shouldRefreshData, setShouldRefreshData] = useState(false);

  const openCancelModal = () => {
    setShowCancelModal(true);
    setIsDetailModalOpen(false);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setIsDetailModalOpen(true);
  };

  const openCompleteModal = () => {
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
  };

  const openFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  const openMarkAdvisorMissedModal = () => {
    setShowMarkAdvisorMissedModal(true);
  };

  const closeMarkAdvisorMissedModal = () => {
    setShowMarkAdvisorMissedModal(false);
  };

  const handleActionSuccess = (onActionComplete?: () => void) => {
    // Close all modals
    setShowCancelModal(false);
    setShowCompleteModal(false);
    setShowFeedbackModal(false);
    setShowMarkAdvisorMissedModal(false);
    
    // Mark for data refresh and modal reopening
    setShouldRefreshData(true);
    
    // Trigger data refresh
    if (onActionComplete) {
      onActionComplete();
    }
  };

  const resetModalStates = () => {
    setShowCancelModal(false);
    setShowCompleteModal(false);
    setShowFeedbackModal(false);
    setShowMarkAdvisorMissedModal(false);
    setIsDetailModalOpen(true);
    setShouldRefreshData(false);
  };

  return {
    // Modal states
    showCancelModal,
    showCompleteModal,
    showFeedbackModal,
    showMarkAdvisorMissedModal,
    isDetailModalOpen,
    shouldRefreshData,
    
    // Modal actions
    openCancelModal,
    closeCancelModal,
    openCompleteModal,
    closeCompleteModal,
    openFeedbackModal,
    closeFeedbackModal,
    openMarkAdvisorMissedModal,
    closeMarkAdvisorMissedModal,
    handleActionSuccess,
    resetModalStates,
    
    // Setters for external control
    setIsDetailModalOpen,
    setShouldRefreshData,
  };
}; 