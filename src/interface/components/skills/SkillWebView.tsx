/**
 * /Users/montysharma/Documents/v8/MMV08/src/interface/components/skills/SkillWebView.tsx
 * 
 * Component for visualizing the Adaptive Growth Web.
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../infrastructure/state/store';
import { SkillNode } from './SkillNode';
import { SkillThreadType, SkillTier, SKILL_LEVEL_THRESHOLDS } from '../../../domain/SkillTypes';
import { updateNodeStates } from '../../../infrastructure/state/slices/skillsSlice';
import './SkillWebView.css';

interface SkillWebViewProps {
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

export const SkillWebView: React.FC<SkillWebViewProps> = ({
  onSelectNode,
  selectedNodeId
}) => {
  const dispatch = useDispatch();
  const threads = useSelector((state: RootState) => state.skills.threads);
  const [initialized, setInitialized] = useState(false);

  // Update node visibility and unlock states when component mounts
  useEffect(() => {
    if (!initialized) {
      dispatch(updateNodeStates());
      setInitialized(true);
    }
  }, [dispatch, initialized]);

  // Calculate level and progress for a skill node
  const calculateLevelInfo = (xp: number) => {
    // Find the level based on XP thresholds
    let level = 1;
    for (let i = 0; i < SKILL_LEVEL_THRESHOLDS.length; i++) {
      if (xp >= SKILL_LEVEL_THRESHOLDS[i]) {
        level = i + 1;
      } else {
        break;
      }
    }

    // Calculate progress to next level
    const currentLevelXp = level > 1 ? SKILL_LEVEL_THRESHOLDS[level - 2] : 0;
    const nextLevelXp = level < SKILL_LEVEL_THRESHOLDS.length + 1 
      ? SKILL_LEVEL_THRESHOLDS[level - 1] 
      : SKILL_LEVEL_THRESHOLDS[SKILL_LEVEL_THRESHOLDS.length - 1];
    
    const xpRange = nextLevelXp - currentLevelXp;
    const progress = xpRange > 0 ? ((xp - currentLevelXp) / xpRange) * 100 : 100;
    
    return {
      level,
      levelProgress: Math.min(Math.floor(progress), 100)
    };
  };

  const handleNodeClick = (nodeId: string) => {
    onSelectNode(nodeId);
  };

  // Render each thread section
  const renderThread = (threadType: SkillThreadType) => {
    const thread = threads[threadType];
    if (!thread) return null;

    return (
      <div 
        key={threadType}
        className="skill-thread-section"
        style={{ borderColor: thread.color }}
      >
        <h3 className="thread-name" style={{ color: thread.color }}>
          {thread.name}
        </h3>
        
        <div className="skill-thread-content">
          {/* Render skill tiers */}
          <div className="skill-tiers">
            {Object.values(SkillTier).map(tier => (
              <div key={tier} className="skill-tier">
                {/* Render nodes for this tier */}
                <div className="skill-tier-nodes">
                  {Object.values(thread.skillNodes)
                    .filter(node => node.tier === tier)
                    .map(node => {
                      const { level, levelProgress } = calculateLevelInfo(node.xp);
                      
                      return (
                        <SkillNode
                          key={node.id}
                          id={node.id}
                          name={node.name}
                          tier={node.tier}
                          threadColor={thread.color}
                          icon={node.icon}
                          level={level}
                          levelProgress={levelProgress}
                          isVisible={node.isVisible}
                          isUnlocked={node.isUnlocked}
                          isSelected={node.id === selectedNodeId}
                          onClick={handleNodeClick}
                        />
                      );
                    })}
                </div>
                
                {/* Tier label */}
                <div className="skill-tier-label">
                  {tier}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="skill-web-view">
      <h2 className="skill-web-title">Adaptive Growth Web</h2>
      
      <div className="skill-threads-container">
        {Object.values(SkillThreadType).map(threadType => 
          renderThread(threadType)
        )}
      </div>
    </div>
  );
};

export default SkillWebView;
