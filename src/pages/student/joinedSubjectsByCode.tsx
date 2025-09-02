import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Button, Spin, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useJoinedSubjectsByCode } from '../../hooks/useJoinedSubjectsByCode';
import { IJoinedSubjectByCode } from '../../interfaces/IJoinedSubject';

const JoinedSubjectsByCodePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectCode = (searchParams.get('subjectCode') || '').trim();

  const { data: items, isLoading, isError, error } = useJoinedSubjectsByCode(subjectCode || null);

  const headerTitle = useMemo(() => {
    if (!subjectCode) return 'Joined Subjects';
    return `Joined Subjects for ${subjectCode}`;
  }, [subjectCode]);

  return (
    <div className="pt-20 flex flex-col w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-500 to-blue-900 px-4 py-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className="!text-white !border-white/30 !bg-white/10 hover:!bg-white/20 !h-10 !px-4 !flex !items-center !gap-2 !backdrop-blur-md"
                size="large"
              >
                Back
              </Button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spin size="large" />
            </div>
          ) : isError ? (
            <div className="text-center py-16 bg-white/5 border border-red-500/30 rounded-xl text-red-300">
              {(error as any)?.message || 'Failed to load data'}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl text-white/80">
              No subjects found.
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="mb-4 text-white/80">Found <span className="text-white font-semibold">{items.length}</span> joined subject(s).</div>
              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((s: IJoinedSubjectByCode) => (
                  <div
                    key={s.id}
                    className="bg-white/10 border border-white/20 rounded-xl p-5 text-white/90 hover:bg-white/15 transition-colors duration-200 shadow-md cursor-pointer"
                    onClick={() => navigate(`/student/subject-details/${s.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-white/70">{s.semesterName || '—'}</div>
                      <div className={`text-xs px-2 py-0.5 rounded ${s.isPassed ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>{s.isPassed ? 'Passed' : 'In Progress'}</div>
                    </div>
                    <div className="text-lg font-semibold mb-1 line-clamp-2" title={s.name}>{s.name}</div>
                    <div className="text-sm text-white/80 mb-2 flex items-center gap-2 flex-wrap">
                      <span>Code:</span>
                      <span className="font-medium">{s.subjectCode}</span>
                      <span className="opacity-60">•</span>
                      <span>Credits: {s.credits}</span>
                    </div>
                    <div className="text-xs text-white/60 flex items-center gap-2 flex-wrap">
                      <span>Version: {s.subjectVersionCode}</span>
                      <span className="opacity-60">•</span>
                      <span>Block: {s.semesterStudyBlockType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinedSubjectsByCodePage;
