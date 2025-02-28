/**
 * /Users/montysharma/Documents/v8/MMV08/src/interface/components/skills/SkillNode.tsx
 * 
 * Component for rendering an individual skill node in the Adaptive Growth Web.
 */

import React from 'react';
import { SkillTier } from '../../../domain/SkillTypes';
import './SkillNode.css';

interface SkillNodeProps {
  id: string;
  name: string;
  tier: string; // Using string instead of enum for serialized data
  threadColor: string;
  icon?: string;
  level: number;
  levelProgress: number;
  isVisible: boolean;
  isUnlocked: boolean;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  id,
  name,
  tier,
  threadColor,
  icon,
  level,
  levelProgress,
  isVisible,
  isUnlocked,
  isSelected,
  onClick
}) => {
  // Don't render invisible nodes
  if (!isVisible) {
    return null;
  }

  // Calculate size based on tier
  const getNodeSize = () => {
    switch (tier) {
      case SkillTier.MASTER:
        return 'skill-node-size-xl';
      case SkillTier.EXPERT:
        return 'skill-node-size-lg';
      case SkillTier.PRACTITIONER:
        return 'skill-node-size-md';
      case SkillTier.APPRENTICE:
        return 'skill-node-size-sm';
      case SkillTier.NOVICE:
      default:
        return 'skill-node-size-xs';
    }
  };

  const handleClick = () => {
    onClick(id);
  };

  return (
    <div 
      className={`skill-node ${getNodeSize()} ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      data-testid={`skill-node-${id}`}
      style={{ 
        backgroundColor: isUnlocked ? threadColor : '#cccccc',
        opacity: isUnlocked ? 1 : 0.6,
        cursor: isVisible ? 'pointer' : 'default'
      }}
    >
      <div className="skill-node-content">
        {icon && <div className="skill-node-icon">{icon}</div>}
        <div className="skill-node-name">{name}</div>
        {isUnlocked && (
          <div className="skill-node-level">
            <span>Lv {level}</span>
            <div className="skill-level-progress">
              <div 
                className="skill-level-progress-bar"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillNode;
