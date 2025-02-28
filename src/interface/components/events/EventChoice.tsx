// /Users/montysharma/Documents/v8/MMV08/src/interface/components/events/EventChoice.tsx

import React from 'react';
import { EventChoice as IEventChoice } from '../../../domain/types/EventTypes';
import './EventChoice.css';

interface EventChoiceProps {
  choice: IEventChoice;
  disabled?: boolean;
  onSelect: (choiceId: string) => void;
}

/**
 * Component for displaying an event choice with its text and requirements
 */
const EventChoice: React.FC<EventChoiceProps> = ({ 
  choice, 
  disabled = false,
  onSelect 
}) => {
  // Determine if the choice has special requirements to show
  const hasSkillRequirements = choice.requiredSkills && choice.requiredSkills.length > 0;
  const hasResourceRequirements = choice.requiredResources && choice.requiredResources.length > 0;
  const hasEventRequirements = choice.requiredEvents && choice.requiredEvents.length > 0;
  const hasProbability = choice.probability !== undefined && choice.probability < 1.0;
  const showRequirements = hasSkillRequirements || hasResourceRequirements || hasEventRequirements || hasProbability;

  // Handler for clicking the choice
  const handleClick = () => {
    if (!disabled) {
      onSelect(choice.id);
    }
  };

  return (
    <div 
      className={`event-choice ${disabled ? 'event-choice-disabled' : ''}`}
      onClick={handleClick}
    >
      <div className="event-choice-text">{choice.text}</div>
      
      {showRequirements && (
        <div className="event-choice-requirements">
          {hasProbability && (
            <div className="event-choice-requirement event-choice-probability">
              Success chance: {Math.round(choice.probability! * 100)}%
            </div>
          )}
          
          {hasSkillRequirements && (
            <div className="event-choice-requirement">
              <span className="requirement-label">Required skills:</span>
              <ul className="requirement-list">
                {choice.requiredSkills!.map(skill => (
                  <li key={skill.id}>
                    {skill.id} (Level {skill.level})
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {hasResourceRequirements && (
            <div className="event-choice-requirement">
              <span className="requirement-label">Required resources:</span>
              <ul className="requirement-list">
                {choice.requiredResources!.map(resource => (
                  <li key={resource.type}>
                    {resource.type} ({resource.value})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventChoice;