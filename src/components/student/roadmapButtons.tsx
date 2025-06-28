import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';

const buttonVariants = {
  hover: {
    scale: 1.04,
    boxShadow: '0 2px 12px 0 rgba(255,186,73,0.10), 0 1.5px 6px rgba(49,130,206,0.08)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    color: '#ff9800',
    borderColor: '#ff9800',
  },
  tap: { scale: 0.98 },
};

interface RoadmapButtonsProps {
  roadmapButtons: string[];
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function getMaxLabelWidth(labels: string[], font = '600 1.125rem Inter, sans-serif', padding = 48) {
  if (typeof window === 'undefined') return 180;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 180;
  ctx.font = font;
  let max = 0;
  for (const label of labels) {
    const w = ctx.measureText(label).width;
    if (w > max) max = w;
  }
  return Math.ceil(max + padding);
}

const RoadmapButtons: React.FC<RoadmapButtonsProps> = ({ roadmapButtons }) => {
  const size = 6;
  const rows = useMemo(() => chunkArray(roadmapButtons, size), [roadmapButtons]);
  const rowWidths = useMemo(() =>
    rows.map(row =>
      typeof window !== 'undefined' ? getMaxLabelWidth(row, '600 1.125rem Inter, sans-serif', 48) : 180
    ),
    [rows]
  );
  const navigate = useNavigate();

  const handleClick = (label: string) => {
    navigate(`/student/semesterPlanner/${encodeURIComponent(label)}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-row flex-nowrap justify-center gap-4 w-full"
        >
          {row.map((label, idx) => (
            <motion.button
              key={label}
              className="
                rounded-full
                border border-white/30
                text-slate-800 font-semibold
                text-base md:text-lg
                px-6 py-3
                bg-white/40
                hover:bg-orange-100/80 hover:text-orange-600
                transition-all duration-200
                shadow-sm
                focus:outline-none
                backdrop-blur-sm
                drop-shadow
                whitespace-nowrap
              "
              style={{
                width: rowWidths[i],
                WebkitBackdropFilter: 'blur(2px)',
                backdropFilter: 'blur(2px)',
                borderWidth: 1,
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleClick(label)}
            >
              {label}
            </motion.button>
          ))}
          {/* Thêm các ô rỗng để đủ 6 ô/hàng */}
          {Array.from({ length: size - row.length }).map((_, idx) => (
            <div key={idx} style={{ width: rowWidths[i] }} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default RoadmapButtons; 