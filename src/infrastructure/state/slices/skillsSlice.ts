/**
 * /Users/montysharma/Documents/v8/MMV08/src/infrastructure/state/slices/skillsSlice.ts
 * 
 * Redux slice for managing skills state.
 */

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SkillManager } from '../../../domain/services/SkillManager';
import { SkillThreadType } from '../../../domain/SkillTypes';
import { SkillNode } from '../../../domain/models/SkillNode';
import { RootState } from '../store';

// Define serializable versions of our domain objects
interface SerializableSkillNode {
  id: string;
  name: string;
  description: string;
  threadType: SkillThreadType;
  tier: string;
  icon?: string;
  requirements: Array<{ skillId: string; minimumLevel: number }>;
  effects: Array<{
    type: string;
    target: string;
    modifier: number;
    description: string;
  }>;
  connections: string[];
  xp: number;
  lastUsed: string; // ISO date string
  isVisible: boolean;
  isUnlocked: boolean;
}

interface SerializableSkillThread {
  type: SkillThreadType;
  name: string;
  description: string;
  color: string;
  icon?: string;
  skillNodes: Record<string, SerializableSkillNode>;
}

// Define the skills state
interface SkillsState {
  threads: Record<SkillThreadType, SerializableSkillThread>;
  initialized: boolean;
}

// Create the initial state
const initialState: SkillsState = {
  threads: {} as Record<SkillThreadType, SerializableSkillThread>,
  initialized: false,
};

// Create the skills slice
export const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    // Initialize the skills system
    initializeSkills: (state) => {
      if (state.initialized) {
        return;
      }
      
      const skillManager = SkillManager.createDefault();
      
      // Convert domain objects to serializable format
      for (const thread of skillManager.getAllThreads()) {
        const serializableNodes: Record<string, SerializableSkillNode> = {};
        
        for (const node of thread.getAllNodes()) {
          serializableNodes[node.id] = serializeSkillNode(node);
        }
        
        state.threads[thread.type] = {
          type: thread.type,
          name: thread.name,
          description: thread.description,
          color: thread.color,
          icon: thread.icon,
          skillNodes: serializableNodes
        };
      }
      
      state.initialized = true;
    },
    
    // Add XP to a skill node
    addXpToSkill: (state, action: PayloadAction<{ nodeId: string; amount: number }>) => {
      const { nodeId, amount } = action.payload;
      
      // Find the node in threads
      for (const threadType of Object.keys(state.threads) as SkillThreadType[]) {
        const thread = state.threads[threadType];
        if (thread.skillNodes[nodeId]) {
          const node = thread.skillNodes[nodeId];
          
          // Update XP and lastUsed
          node.xp += amount;
          node.lastUsed = new Date().toISOString();
          break;
        }
      }
    },
    
    // Update node states (visibility and unlocks)
    updateNodeStates: (state) => {
      // Convert serializable state to domain objects
      const skillManager = deserializeSkillManager(state);
      
      // Update node states based on connections and requirements
      const updatedManager = skillManager.updateNodeStates();
      
      // Convert updated domain objects back to serializable format
      for (const thread of updatedManager.getAllThreads()) {
        for (const node of thread.getAllNodes()) {
          const serNode = serializeSkillNode(node);
          state.threads[thread.type].skillNodes[node.id] = serNode;
        }
      }
    },
    
    // Apply skill decay based on inactivity
    applySkillDecay: (state, action: PayloadAction<{ currentDate: string }>) => {
      const currentDate = new Date(action.payload.currentDate);
      
      // Convert serializable state to domain objects
      const skillManager = deserializeSkillManager(state);
      
      // Apply skill decay
      const updatedManager = skillManager.applySkillDecay(currentDate);
      
      // Convert updated domain objects back to serializable format
      for (const thread of updatedManager.getAllThreads()) {
        for (const node of thread.getAllNodes()) {
          const serNode = serializeSkillNode(node);
          state.threads[thread.type].skillNodes[node.id] = serNode;
        }
      }
    },
    
    // Add a new skill node
    addSkillNode: (state, action: PayloadAction<{ node: SerializableSkillNode }>) => {
      const { node } = action.payload;
      const threadType = node.threadType;
      
      // Ensure thread exists
      if (!state.threads[threadType]) {
        return;
      }
      
      // Add node to thread
      state.threads[threadType].skillNodes[node.id] = { ...node };
      
      // Update node states
      skillsSlice.caseReducers.updateNodeStates(state, { type: 'updateNodeStates', payload: undefined });
    }
  },
});

// Helper function to serialize a SkillNode to a plain object
function serializeSkillNode(node: SkillNode): SerializableSkillNode {
  return {
    id: node.id,
    name: node.name,
    description: node.description,
    threadType: node.threadType,
    tier: node.tier,
    icon: node.icon,
    requirements: node.requirements.map(req => ({
      skillId: req.skillId,
      minimumLevel: req.minimumLevel
    })),
    effects: node.effects.map(effect => ({
      type: effect.type,
      target: effect.target,
      modifier: effect.modifier,
      description: effect.description
    })),
    connections: [...node.connections],
    xp: node.value.xp,
    lastUsed: node.value.lastUsed.toISOString(),
    isVisible: node.isVisible,
    isUnlocked: node.isUnlocked
  };
}

// Helper function to deserialize state into a SkillManager
function deserializeSkillManager(state: SkillsState): SkillManager {
  let skillManager = new SkillManager();
  
  for (const threadType of Object.keys(state.threads) as SkillThreadType[]) {
    const serThread = state.threads[threadType];
    
    // Create thread domain object
    const thread = new skillManager.getThread(threadType) || {
      type: serThread.type,
      name: serThread.name,
      description: serThread.description,
      color: serThread.color,
      icon: serThread.icon,
      skillNodes: new Map()
    };
    
    // Add nodes to thread
    for (const nodeId of Object.keys(serThread.skillNodes)) {
      const serNode = serThread.skillNodes[nodeId];
      
      // Create node domain object from serialized data
      const node = new SkillNode({
        id: serNode.id,
        name: serNode.name,
        description: serNode.description,
        threadType: serNode.threadType,
        tier: serNode.tier as any, // Type assertion
        icon: serNode.icon,
        requirements: serNode.requirements,
        effects: serNode.effects as any[], // Type assertion
        connections: serNode.connections,
        value: {
          _xp: serNode.xp,
          _lastUsed: new Date(serNode.lastUsed)
        } as any, // Type assertion
        isVisible: serNode.isVisible,
        isUnlocked: serNode.isUnlocked
      });
      
      thread.skillNodes.set(nodeId, node);
    }
    
    // Add thread to manager
    skillManager = skillManager.addThread(thread as any); // Type assertion
  }
  
  return skillManager;
}

// Export actions
export const {
  initializeSkills,
  addXpToSkill,
  updateNodeStates,
  applySkillDecay,
  addSkillNode
} = skillsSlice.actions;

// Selectors
export const selectAllThreads = (state: RootState) => state.skills.threads;
export const selectThread = (state: RootState, threadType: SkillThreadType) => state.skills.threads[threadType];
export const selectSkillNode = (state: RootState, nodeId: string) => {
  for (const threadType of Object.keys(state.skills.threads) as SkillThreadType[]) {
    const thread = state.skills.threads[threadType];
    if (thread.skillNodes[nodeId]) {
      return thread.skillNodes[nodeId];
    }
  }
  return undefined;
};
export const selectVisibleNodes = (state: RootState) => {
  const visibleNodes: SerializableSkillNode[] = [];
  for (const threadType of Object.keys(state.skills.threads) as SkillThreadType[]) {
    const thread = state.skills.threads[threadType];
    for (const nodeId of Object.keys(thread.skillNodes)) {
      const node = thread.skillNodes[nodeId];
      if (node.isVisible) {
        visibleNodes.push(node);
      }
    }
  }
  return visibleNodes;
};
export const selectUnlockedNodes = (state: RootState) => {
  const unlockedNodes: SerializableSkillNode[] = [];
  for (const threadType of Object.keys(state.skills.threads) as SkillThreadType[]) {
    const thread = state.skills.threads[threadType];
    for (const nodeId of Object.keys(thread.skillNodes)) {
      const node = thread.skillNodes[nodeId];
      if (node.isUnlocked) {
        unlockedNodes.push(node);
      }
    }
  }
  return unlockedNodes;
};

export default skillsSlice.reducer;
