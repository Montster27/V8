/**
 * /Users/montysharma/Documents/v8/MMV08/src/domain/services/SkillManager.ts
 * 
 * Service for managing the Adaptive Growth Web skill system.
 */

import { SkillThreadType, SkillTier } from '../SkillTypes';
import { SkillNode } from '../models/SkillNode';
import { SkillThread } from '../models/SkillThread';

/**
 * Manages the Adaptive Growth Web skill system
 */
export class SkillManager {
  private threads: Map<SkillThreadType, SkillThread>;

  /**
   * Create a new skill manager
   * @param threads Initial skill threads
   */
  constructor(threads: Map<SkillThreadType, SkillThread> = new Map()) {
    this.threads = new Map(threads);
  }

  /**
   * Get all skill threads
   */
  getAllThreads(): SkillThread[] {
    return Array.from(this.threads.values());
  }

  /**
   * Get a specific thread by type
   * @param type Thread type to retrieve
   */
  getThread(type: SkillThreadType): SkillThread | undefined {
    return this.threads.get(type);
  }

  /**
   * Get all skill nodes across all threads
   */
  getAllNodes(): SkillNode[] {
    return this.getAllThreads().flatMap(thread => thread.getAllNodes());
  }

  /**
   * Get a specific skill node by ID
   * @param nodeId ID of the node to retrieve
   */
  getNode(nodeId: string): SkillNode | undefined {
    for (const thread of this.threads.values()) {
      const node = thread.skillNodes.get(nodeId);
      if (node) {
        return node;
      }
    }
    return undefined;
  }

  /**
   * Add experience to a skill node
   * @param nodeId ID of the node to add XP to
   * @param amount Amount of XP to add
   */
  addXpToNode(nodeId: string, amount: number): SkillManager {
    for (const [threadType, thread] of this.threads.entries()) {
      if (thread.skillNodes.has(nodeId)) {
        const updatedThread = thread.updateNode(nodeId, node => node.addXp(amount));
        return this.updateThread(threadType, updatedThread);
      }
    }
    return this;
  }

  /**
   * Update visibility and unlock state of nodes based on requirements
   */
  updateNodeStates(): SkillManager {
    const allNodes = new Map<string, SkillNode>();
    
    // Create a map of all nodes for easy lookup
    for (const thread of this.threads.values()) {
      for (const [id, node] of thread.skillNodes.entries()) {
        allNodes.set(id, node);
      }
    }
    
    let manager = this;
    
    // Update each thread
    for (const [threadType, thread] of this.threads.entries()) {
      let updatedThread = thread;
      
      // Update visibility and unlock state for each node
      for (const [nodeId, node] of thread.skillNodes.entries()) {
        // Check if any connected node is unlocked to determine visibility
        const isVisible = node.isVisible ||
          node.connections.some(connId => {
            const connNode = allNodes.get(connId);
            return connNode?.isUnlocked || false;
          });
        
        // Check if node can be unlocked based on requirements
        const canBeUnlocked = node.canBeUnlocked(allNodes);
        
        // Only update if there's a change needed
        if (isVisible !== node.isVisible || (canBeUnlocked && !node.isUnlocked)) {
          updatedThread = updatedThread.updateNode(nodeId, n => 
            n.setVisibility(isVisible).setUnlocked(canBeUnlocked && isVisible)
          );
        }
      }
      
      // Update the thread in the manager
      if (updatedThread !== thread) {
        manager = manager.updateThread(threadType, updatedThread);
      }
    }
    
    return manager;
  }

  /**
   * Apply skill decay to all nodes based on inactivity
   * @param currentDate Current date to calculate decay
   */
  applySkillDecay(currentDate: Date = new Date()): SkillManager {
    let manager = this;
    
    // Update each thread
    for (const [threadType, thread] of this.threads.entries()) {
      let updatedThread = thread;
      
      // Apply decay to each node
      for (const [nodeId, node] of thread.skillNodes.entries()) {
        const decayedNode = node.applyDecay(currentDate);
        if (decayedNode !== node) {
          updatedThread = updatedThread.updateNode(nodeId, () => decayedNode);
        }
      }
      
      // Update the thread in the manager
      if (updatedThread !== thread) {
        manager = manager.updateThread(threadType, updatedThread);
      }
    }
    
    return manager;
  }

  /**
   * Add a thread to the manager
   * @param thread The thread to add
   */
  addThread(thread: SkillThread): SkillManager {
    const updatedThreads = new Map(this.threads);
    updatedThreads.set(thread.type, thread);
    return new SkillManager(updatedThreads);
  }

  /**
   * Update a thread in the manager
   * @param type Type of the thread to update
   * @param thread Updated thread
   */
  updateThread(type: SkillThreadType, thread: SkillThread): SkillManager {
    // Ensure thread type matches
    if (thread.type !== type) {
      throw new Error(`Thread type mismatch: ${thread.type} vs ${type}`);
    }
    
    const updatedThreads = new Map(this.threads);
    updatedThreads.set(type, thread);
    return new SkillManager(updatedThreads);
  }

  /**
   * Create a default skill web with empty threads for all types
   */
  static createDefault(): SkillManager {
    const manager = new SkillManager();
    
    // Create default threads
    const threadConfigs = [
      {
        type: SkillThreadType.BODY,
        name: "Body",
        description: "Physical stamina, health, and fitness",
        color: "#E63946", // Red
      },
      {
        type: SkillThreadType.MIND,
        name: "Mind",
        description: "Critical thinking, problem-solving, and knowledge",
        color: "#457B9D", // Blue
      },
      {
        type: SkillThreadType.HEART,
        name: "Heart",
        description: "Social awareness, persuasion, and leadership",
        color: "#E9C46A", // Yellow
      },
      {
        type: SkillThreadType.WORLD,
        name: "World",
        description: "Resource management, finance, and sustainability",
        color: "#2A9D8F", // Green
      },
      {
        type: SkillThreadType.MASTERY,
        name: "Mastery",
        description: "Specialized expertise and entrepreneurship",
        color: "#9B5DE5", // Purple
      }
    ];
    
    // Create threads and add them to the manager
    return threadConfigs.reduce((mgr, config) => {
      const thread = new SkillThread({
        type: config.type,
        name: config.name,
        description: config.description,
        color: config.color
      });
      return mgr.addThread(thread);
    }, manager);
  }
}
