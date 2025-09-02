
import { motion } from 'framer-motion';
import { Button } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '../../hooks/useRoadmap';
import { useStudentProfile } from '../../hooks/useStudentProfile';

const SemesterPlanner = () => {
  const navigate = useNavigate();
  const { studentProfileId, isLoading: isStudentLoading } = useStudentProfile();
  const { createRoadmap, useRoadmapExists, isLoading } = useRoadmap();

  // Silently check if roadmap exists when page loads (no loading state shown)
  // existingRoadmapId will be:
  // - null: when API returns -1 (no roadmap exists)
  // - number > 0: when roadmap exists
  const { data: existingRoadmapId } = useRoadmapExists(studentProfileId);

  const handleRoadmapAction = async () => {
    if (!studentProfileId) {
      console.log('No studentProfileId available');
      return;
    }

    console.log('Roadmap action triggered:', { studentProfileId, existingRoadmapId });

    // Check if existingRoadmapId is a valid number (not null, not -1)
    if (existingRoadmapId && existingRoadmapId > 0) {
      // If roadmap exists, navigate directly to it
      console.log('Navigating to existing roadmap:', existingRoadmapId);
      try {
        navigate(`/student/semesterPlanner/${existingRoadmapId}`);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    } else {
      // If no roadmap exists (existingRoadmapId is null or <= 0), create a new one
      console.log('Creating new roadmap...');
      const result = await createRoadmap(studentProfileId, "My Roadmaps");
      
      if (result) {
        console.log('Roadmap created, navigating to:', result.id);
        // Navigate to the newly created roadmap
        navigate(`/student/semesterPlanner/${result.id}`);
      } else {
        console.error('Failed to create roadmap');
      }
    }
  };

  // Only show loading when actually creating roadmap, not when checking existence
  const isButtonLoading = isLoading || isStudentLoading;
  const buttonText = isLoading ? 'Creating...' : 'My Roadmaps';

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-blue-900">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Your Path to Becoming a Software Engineer
      </motion.h1>
      
      <motion.p
        className="text-lg md:text-xl text-white/90 text-center max-w-3xl mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        The roadmap below is generated based on your learning data. Using AI-powered analysis, we've crafted a personalized plan tailored to your journey. Here are our suggestions to guide your future path in software engineering.
      </motion.p>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        <div className="space-y-4">
          <Button
            type="primary"
            size="large"
            icon={<BookOutlined />}
            onClick={handleRoadmapAction}
            loading={isButtonLoading}
            disabled={!studentProfileId}
            className="w-full !bg-white/10 !backdrop-blur-xl transition-all duration-300 rounded-lg h-12 text-white font-semibold shadow-lg hover:!bg-orange-600 hover:!border-orange-600"
          >
            {buttonText}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SemesterPlanner;
