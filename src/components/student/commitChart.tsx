import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Spin, Alert, Input, Skeleton } from 'antd';
import { GitHubRepoData, ContributionHelper, ContributionData } from '../../interfaces/IGithub';

interface CommitChartProps {
  isConnected?: boolean;
  onConnect?: () => void;
  repoData?: GitHubRepoData | null;
  isLoading?: boolean;
  error?: Error | null;
  joinedSubjectId?: number | null;
  onUpdateGitHubURL?: (joinedSubjectId: number, publicRepoURL: string) => Promise<void>;
  isUpdating?: boolean;
}

const CommitChart: React.FC<CommitChartProps> = ({ 
  isConnected = false, 
  onConnect,
  repoData,
  isLoading = false,
  error = null,
  joinedSubjectId,
  onUpdateGitHubURL,
  isUpdating = false
}) => {
  const [gitHubURL, setGitHubURL] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWaitingForData, setIsWaitingForData] = useState(false);

  // Reset waiting state when we get data
  useEffect(() => {
    if (repoData && isWaitingForData) {
      setIsWaitingForData(false);
    }
  }, [repoData, isWaitingForData]);

  const handleConnect = async () => {
    if (!gitHubURL.trim()) {
      return;
    }

    if (!joinedSubjectId) {
      return;
    }

    if (!onUpdateGitHubURL) {
      return;
    }

    setIsConnecting(true);
    setIsWaitingForData(true); // Start waiting for data
    try {
      await onUpdateGitHubURL(joinedSubjectId, gitHubURL.trim());
      setGitHubURL(''); // Clear input after success
      // Keep waiting for data to load
    } catch (error) {
      setIsWaitingForData(false); // Stop waiting on error
    } finally {
      setIsConnecting(false);
    }
  };



  // Generate contribution chart data
  const generateContributionData = (): ContributionData | null => {
    if (!repoData) return null;

    try {
      // Option 1: Use commitActivity (most detailed)
      if (repoData.commitActivity && repoData.commitActivity.length > 0) {
        return ContributionHelper.convertToContributionData(repoData.commitActivity);
      }
      
      // Option 2: Use commitsPerDayLastYear (simpler)
      if (repoData.commitsPerDayLastYear && Object.keys(repoData.commitsPerDayLastYear).length > 0) {
        return ContributionHelper.convertDailyCommitsToContributionData(repoData.commitsPerDayLastYear);
      }
    } catch (error) {
      console.error('Error generating contribution data:', error);
    }
    
    return null;
  };

  const contributionData = generateContributionData();
  
  // Get chart info with proper month labels
  const chartInfo = contributionData ? 
    ContributionHelper.generateContributionCalendar(contributionData) : null;

  // Sử dụng grid cố định 53 cột cho cả năm
  const gridCols = 53;
  const gridStyle = { 
    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
    gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
    gridAutoFlow: 'column' // Fill theo cột trước, hàng sau (theo chiều dọc)
  };

  // Render contribution chart placeholder when no data
  const renderContributionChartPlaceholder = () => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton.Input 
          active 
          size="small" 
          className="!w-48 !h-5 !bg-white/10" 
        />
      </div>
      
      {/* Chart grid placeholder - same dimensions as real chart */}
      <div className="grid grid-rows-7 gap-1" style={gridStyle}>
        {Array.from({ length: 371 }).map((_, idx) => (
          <div
            key={idx}
            className="w-3 h-3 rounded-sm bg-white/10 animate-pulse"
          />
        ))}
      </div>
      
      {/* Month labels placeholder - show actual months from data if available */}
      <div className="flex justify-between text-xs mt-3 text-gray-300 font-medium">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
    </div>
  );

  // Render repository info placeholder when no data
  const renderRepositoryInfoPlaceholder = () => (
    <div className="mb-6 p-5 rounded-xl shadow-lg">
      {/* Header placeholder */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton.Avatar active size={40} className="!bg-white/10" />
            <div className="flex-1">
              <Skeleton.Input active size="small" className="!w-48 !h-6 !bg-white/10 mb-2" />
              <div className="flex gap-2">
                <Skeleton.Input active size="small" className="!w-16 !h-5 !bg-white/10" />
                <Skeleton.Input active size="small" className="!w-20 !h-5 !bg-white/10" />
              </div>
            </div>
          </div>
          <Skeleton.Input active size="small" className="!w-96 !h-4 !bg-white/10 mt-3" />
        </div>
      </div>

      {/* Stats Grid placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
            <Skeleton.Input active size="small" className="!w-16 !h-8 !bg-white/20 mx-auto mb-1" />
            <Skeleton.Input active size="small" className="!w-12 !h-3 !bg-white/20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Additional Info placeholder */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex flex-wrap items-center gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton.Input key={idx} active size="small" className="!w-32 !h-4 !bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );

  // Show loading when connecting or waiting for data
  if (isConnecting || isWaitingForData || isLoading) {
    return (
      <div className="overflow-x-auto p-6 bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Skeleton.Input active size="small" className="!w-32 !h-6 !bg-white/10" />
          <Skeleton.Input active size="small" className="!w-40 !h-5 !bg-white/10" />
        </div>
        
        {renderRepositoryInfoPlaceholder()}
        {renderContributionChartPlaceholder()}
        
        <div className="text-center mt-6">
          <Spin size="large" />
          <p className="text-white mt-4">
            {isConnecting ? 'Connecting to GitHub...' : 
             isWaitingForData ? 'Loading repository data...' : 
             'Loading GitHub data...'}
          </p>
          {isWaitingForData && (
            <p className="text-gray-300 text-sm mt-2">
              Please wait while we fetch your repository information...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="overflow-x-auto p-6 bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Skeleton.Input active size="small" className="!w-32 !h-6 !bg-white/10" />
          <Skeleton.Input active size="small" className="!w-40 !h-5 !bg-white/10" />
        </div>
        
        {renderRepositoryInfoPlaceholder()}
        {renderContributionChartPlaceholder()}
        
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect GitHub</h3>
            <p className="text-gray-300 text-sm mb-6">
              Enter your GitHub repository URL to see your coding activity and track your progress
            </p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <Input
              placeholder="https://github.com/username/repository"
              value={gitHubURL}
              onChange={(e) => setGitHubURL(e.target.value)}
              className="!bg-white/10 !border-white/30 !text-white placeholder:text-gray-400 !h-12"
              onPressEnter={handleConnect}
            />
            
            <Button
              type="primary"
              onClick={handleConnect}
              loading={isConnecting}
              disabled={!gitHubURL.trim() || isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 h-12 text-base font-medium !mt-3"
              size="large"
              icon={
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              }
            >
              {isConnecting ? 'Connecting...' : 'Connect Repository'}
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-400">
            <p>This will help track your coding activity and learning progress</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-x-auto p-6 bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Skeleton.Input active size="small" className="!w-32 !h-6 !bg-white/10" />
          <Skeleton.Input active size="small" className="!w-40 !h-5 !bg-white/10" />
        </div>
        
        {renderRepositoryInfoPlaceholder()}
        {renderContributionChartPlaceholder()}
        
        <Alert
          message="Error loading GitHub data"
          description={error.message}
          type="error"
          showIcon
          className="bg-red-500/20 border-red-500/30"
        />
      </div>
    );
  }

  if (!repoData || !contributionData) {
    return (
      <div className="overflow-x-auto p-6 bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Skeleton.Input active size="small" className="!w-32 !h-6 !bg-white/10" />
          <Skeleton.Input active size="small" className="!w-40 !h-5 !bg-white/10" />
        </div>
        
        {renderRepositoryInfoPlaceholder()}
        {renderContributionChartPlaceholder()}
        
        <div className="text-center">
          <p className="text-white mb-4">No GitHub data available</p>
          
          {/* Show input field even when connected but no data */}
          <div className="max-w-md mx-auto space-y-4">
            <Input
              placeholder="https://github.com/username/repository"
              value={gitHubURL}
              onChange={(e) => setGitHubURL(e.target.value)}
              className="!bg-white/10 !border-white/30 !text-white placeholder:text-gray-400 !h-12"
              onPressEnter={handleConnect}
            />
            
            <Button
              type="primary"
              onClick={handleConnect}
              loading={isConnecting}
              disabled={!gitHubURL.trim() || isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 h-12 text-base font-medium !mt-3"
              size="large"
            >
              {isConnecting ? 'Connecting...' : 'Update Repository'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-6 bg-white/18 backdrop-blur-16 border border-white/30 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">GitHub Activity</h3>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>Connected to GitHub</span>
        </div>
      </div>
      
      {/* Repository Info */}
      <div className="mb-6 p-5 rounded-xl shadow-lg">
        {/* Header with repo name and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 !text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h4 className="!text-white font-semibold text-lg">{repoData.nameWithOwner || repoData.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {repoData.isPrivate && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                      Private
                    </span>
                  )}
                  {repoData.isArchived && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
                      Archived
                    </span>
                  )}
                  {repoData.primaryLanguage && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                      {repoData.primaryLanguage}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            {repoData.description && (
              <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                {repoData.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Stars */}
          <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              ⭐ {repoData.stargazerCount?.toLocaleString() || 0}
            </div>
            <div className="text-xs !text-white">Stars</div>
          </div>
          
          {/* Forks */}
          <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              🔄 {repoData.forkCount?.toLocaleString() || 0}
            </div>
            <div className="text-xs !text-white">Forks</div>
          </div>
          
          {/* Watchers */}
          <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="text-2xl font-bold text-green-400 mb-1">
              👀 {repoData.watcherCount?.toLocaleString() || 0}
            </div>
            <div className="text-xs !text-white">Watching</div>
          </div>
          
          {/* Issues */}
          <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              💬 {repoData.openIssuesCount?.toLocaleString() || 0}
            </div>
            <div className="text-xs !text-white">Issues</div>
          </div>
        </div>

        {/* Additional Info Row */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex flex-wrap items-center gap-4 text-sm !text-white">
            {/* Last Updated */}
            {repoData.pushedAt && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Updated {new Date(repoData.pushedAt).toLocaleDateString()}</span>
              </div>
            )}
            
            {/* Created Date */}
            {repoData.createdAt && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                <span>Created {new Date(repoData.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            
            {/* License */}
            {repoData.licenseName && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8V4h5v4h3v10z"/>
                </svg>
                <span>{repoData.licenseName}</span>
              </div>
            )}
            
            {/* Contributors */}
            {repoData.contributorCount && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L13 12.5V22h7zm-8-6.5l1.5-4.5h-9L7 15.5V22H4v-8h2.5l1.5-4.5H10L8.5 15.5H12V22h-2v-6.5z"/>
                </svg>
                <span>{repoData.contributorCount} contributors</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contribution Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-medium">
              {contributionData.totalContributions} contributions
            </span>
            {chartInfo && (
              <span className="text-gray-400 text-xs">
                from {chartInfo.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to {chartInfo.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-rows-7 gap-1" style={gridStyle}>
          {chartInfo && chartInfo.calendar.map((day, idx) => (
            <motion.div
              key={idx}
              className={`w-3 h-3 rounded-sm transition-colors duration-300 ${
                day.count === 0
                  ? 'bg-white/10'
                  : day.count === 1
                  ? 'bg-green-400/60'
                  : day.count === 2
                  ? 'bg-green-500/70'
                  : day.count === 3
                  ? 'bg-green-600/80'
                  : 'bg-green-700/90'
              }`}
              whileHover={{ scale: 1.3, zIndex: 10 }}
              title={`${day.date}: ${day.count} commits`}
            />
          ))}
        </div>
        
        {/* Month labels */}
        <div className="flex justify-between text-xs mt-3 text-gray-300 font-medium">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>

      {/* Additional Stats */}
      {repoData.totalCommitCount && (
        <div className="text-center text-sm text-gray-300">
          <p>Total commits: {repoData.totalCommitCount.toLocaleString()}</p>
        </div>
      )}

      {/* Update Repository Section */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-3">Want to connect a different repository?</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="https://github.com/username/repository"
              value={gitHubURL}
              onChange={(e) => setGitHubURL(e.target.value)}
              className="!bg-white/10 !border-white/30 !text-white placeholder:text-gray-400"
              onPressEnter={handleConnect}
            />
            <Button
              type="primary"
              onClick={handleConnect}
              loading={isConnecting || isUpdating}
              disabled={!gitHubURL.trim() || isConnecting || isUpdating}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitChart; 