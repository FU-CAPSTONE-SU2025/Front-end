import React from 'react';
import RoadmapFlow from './roadmapFlow';
import { IRoadmapGraph } from '../../interfaces/IRoadMap';

interface CurrentRoadmapProps {
  roadmap: IRoadmapGraph;
  onLinkCreate: (fromNodeId: number, toNodeId: number) => void;
  onLinkDelete: (linkId: number) => void;
  onNodeDeleted?: () => void; // Callback khi node bị xóa
}

const CurrentRoadmap: React.FC<CurrentRoadmapProps> = ({ roadmap, onLinkCreate, onLinkDelete, onNodeDeleted }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">Current Roadmap</h2>
      <RoadmapFlow
        roadmap={roadmap}
        onLinkCreate={onLinkCreate}
        onLinkDelete={onLinkDelete}
        onNodeDeleted={onNodeDeleted}
      />
    </div>
  );
};

export default CurrentRoadmap;
