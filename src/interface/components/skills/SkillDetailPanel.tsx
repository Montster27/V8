/**
 * /Users/montysharma/Documents/v8/MMV08/src/interface/components/skills/SkillDetailPanel.tsx
 * 
 * Component for displaying detailed information about a selected skill.
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../infrastructure/state/store';
import { addXpToSkill } from '../../../infrastructure/state/slices/skillsSlice';
import { SKILL_LEVEL_THRESHOLDS } from '../../../domain/SkillTypes';
import './SkillDetailPanel.css';

interface SkillDetailPanelProps {
  selectedNodeId?: string;
  onClose: () => void;
}

export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({
  selectedNodeId,
  onClose
}) => {
  const dispatch = useDispatch();
  
  // Get the selected node from Redux store
  const selectedNode = useSelector((state: RootState) => {
    if (!selectedNodeId) return null;
    
    // Search for the node in all threads
    for (const threadType of Object.keys(state.skills.threads)) {
      const thread = state.skills.threads[threadType as any];
      if (thread.skillNodes[selectedNodeId]) {
        return {
          ...thread.skillNodes[selectedNodeId],
          threadName: thread.name,
          threadColor: thread.color
        };
      }
    }
    return null;
  });
  
  // Get all nodes from store (needed for requirements)
  const allNodes = useSelector((state: RootState) => {
    const nodes: Record<string, any> = {};
    
    for (const threadType of Object.keys(state.skills.threads)) {
      const thread = state.skills.threads[threadType as any];
      for (const nodeId of Object.keys(thread.skillNodes)) {
        nodes[nodeId] = thread.skillNodes[nodeId];
      }
    }
    
    return nodes;
  });
  
  // If no node is selected, show a placeholder
  if (!selectedNode) {
    return (
      <div className="skill-detail-panel empty-panel">
        <h3>Skill Details</h3>
        <p>Select a skill to view details</p>
      </div>
    );
  }
  
  // Calculate level and progress
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
      levelProgress: Math.min(Math.floor(progress), 100),
      currentXp: xp,
      requiredXp: nextLevelXp,
      xpToNextLevel: Math.max(0, nextLevelXp - xp)
    };
  };
  
  const { level, levelProgress, currentXp, requiredXp, xpToNextLevel } = calculateLevelInfo(selectedNode.xp);
  
  // Handle adding XP for testing/development purposes
  const handleAddXp = (amount: number) => {
    dispatch(addXpToSkill({ nodeId: selectedNode.id, amount }));
  };
  
  return (
    <div 
      className="skill-detail-panel"
      style={{ borderColor: selectedNode.threadColor }}
    >
      <div className="skill-detail-header">
        <h3 
          className="skill-name"
          style={{ color: selectedNode.threadColor }}
        >
          {selectedNode.name}
        </h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="skill-detail-content">
        {/* Basic info */}
        <div className="skill-section">
          <div className="skill-thread-badge" style={{ backgroundColor: selectedNode.threadColor }}>
            {selectedNode.threadName}
          </div>
          <div className="skill-tier-badge">{selectedNode.tier}</div>
        </div>
        
        {/* Description */}
        <div className="skill-section">
          <p className="skill-description">{selectedNode.description}</p>
        </div>
        
        {/* Level & Progress */}
        <div className="skill-section">
          <h4>Progress</h4>
          <div className="level-display">
            <span className="level-label">Level {level}</span>
            <div className="level-progress-container">
              <div 
                className="level-progress-bar"
                style={{ width: `${levelProgress}%`, backgroundColor: selectedNode.threadColor }}
              />
            </div>
            <span className="xp-text">
              {currentXp} / {requiredXp} XP ({xpToNextLevel} XP to next level)
            </span>
          </div>
          
          {/* XP Controls (for testing) */}
          <div className="xp-controls">
            <button onClick={() => handleAddXp(10)}>+10 XP</button>
            <button onClick={() => handleAddXp(50)}>+50 XP</button>
            <button onClick={() => handleAddXp(100)}>+100 XP</button>
          </div>
        </div>
        
        {/* Requirements */}
        {selectedNode.requirements.length > 0 && (
          <div className="skill-section">
            <h4>Requirements</h4>
            <ul className="requirements-list">
              {selectedNode.requirements.map((req: any) => {
                const reqNode = allNodes[req.skillId];
                const isMet = reqNode?.isUnlocked && calculateLevelInfo(reqNode.xp).level >= req.minimumLevel;
                
                return (
                  <li 
                    key={req.skillId}
                    className={isMet ? 'requirement-met' : 'requirement-not-met'}
                  >
                    {reqNode ? reqNode.name : 'Unknown Skill'} (Level {req.minimumLevel})
                    {isMet && <span className="check-icon">✓</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Effects */}
        {selectedNode.effects.length > 0 && (
          <div className="skill-section">
            <h4>Effects</h4>
            <ul className="effects-list">
              {selectedNode.effects.map((effect: any, index: number) => (
                <li key={index} className="effect-item">
                  {effect.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Connections */}
        {selectedNode.connections.length > 0 && (
          <div className="skill-section">
            <h4>Connected Skills</h4>
            <div className="connections-list">
              {selectedNode.connections.map((connId: string) => {
                const connNode = allNodes[connId];
                if (!connNode) return null;
                
                return (
                  <div 
                    key={connId}
                    className="connection-pill"
                    style={{ 
                      backgroundColor: connNode.isVisible ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)',
                      color: connNode.isVisible ? '#333' : '#999'
                    }}
                  >
                    {connNode.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDetailPanel;
