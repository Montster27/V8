/**
 * /Users/montysharma/Documents/v8/MMV08/src/interface/components/skills/SkillsPanel.tsx
 * 
 * Main container component for the skills system UI.
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeSkills } from '../../../infrastructure/state/slices/skillsSlice';
import SkillWebView from './SkillWebView';
import SkillDetailPanel from './SkillDetailPanel';
import './SkillsPanel.css';

interface SkillsPanelProps {
  // Optional props can be added here
}

export const SkillsPanel: React.FC<SkillsPanelProps> = () => {
  const dispatch = useDispatch();
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Initialize the skills system when the component mounts
    dispatch(initializeSkills());
  }, [dispatch]);
  
  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };
  
  const handleCloseDetails = () => {
    setSelectedNodeId(undefined);
  };
  
  return (
    <div className="skills-panel">
      <h2 className="panel-title">Skills</h2>
      
      <div className="skills-panel-content">
        <div className="skill-web-container">
          <SkillWebView
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNodeId}
          />
        </div>
        
        <div className="skill-detail-container">
          <SkillDetailPanel
            selectedNodeId={selectedNodeId}
            onClose={handleCloseDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default SkillsPanel;
