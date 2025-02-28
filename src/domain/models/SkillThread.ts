/**
 * /Users/montysharma/Documents/v8/MMV08/src/domain/models/SkillThread.ts
 * 
 * Represents a thread (category) of related skills in the Adaptive Growth Web.
 */

import { SkillTier, SkillThreadType } from '../SkillTypes';
import { SkillNode } from './SkillNode';

/**
 * A thread contains related skills organized into tiers
 */
export class SkillThread {
  readonly type: SkillThreadType;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly icon?: string;
  readonly skillNodes: Map<string, SkillNode>;

  /**
   * Create a new skill thread
   */
  constructor({
    type,
    name,
    description,
    color,
    icon,
    skillNodes = new Map()
  }: {
    type: SkillThreadType;
    name: string;
    description: string;
    color: string;
    icon?: string;
    skillNodes?: Map<string, SkillNode>;
  }) {
    this.type = type;
    this.name = name;
    this.description = description;
    this.color = color;
    this.icon = icon;
    this.skillNodes = new Map(skillNodes);
  }

  /**
   * Get all skill nodes in this thread
   */
  getAllNodes(): SkillNode[] {
    return Array.from(this.skillNodes.values());
  }

  /**
   * Get skill nodes filtered by tier
   * @param tier The tier to filter by
   */
  getNodesByTier(tier: SkillTier): SkillNode[] {
    return this.getAllNodes().filter(node => node.tier === tier);
  }

  /**
   * Get visible skill nodes
   */
  getVisibleNodes(): SkillNode[] {
    return this.getAllNodes().filter(node => node.isVisible);
  }

  /**
   * Get unlocked skill nodes
   */
  getUnlockedNodes(): SkillNode[] {
    return this.getAllNodes().filter(node => node.isUnlocked);
  }

  /**
   * Add a skill node to this thread
   * @param node The node to add
   */
  addNode(node: SkillNode): SkillThread {
    // Only add if the node belongs to this thread
    if (node.threadType !== this.type) {
      throw new Error(`Cannot add node with thread type ${node.threadType} to thread ${this.type}`);
    }
    
    const updatedNodes = new Map(this.skillNodes);
    updatedNodes.set(node.id, node);
    
    return this.with({ skillNodes: updatedNodes });
  }

  /**
   * Update a specific node in this thread
   * @param nodeId ID of the node to update
   * @param updateFn Function that takes the old node and returns an updated one
   */
  updateNode(nodeId: string, updateFn: (node: SkillNode) => SkillNode): SkillThread {
    const node = this.skillNodes.get(nodeId);
    if (!node) {
      return this;
    }
    
    const updatedNode = updateFn(node);
    const updatedNodes = new Map(this.skillNodes);
    updatedNodes.set(nodeId, updatedNode);
    
    return this.with({ skillNodes: updatedNodes });
  }

  /**
   * Remove a node from this thread
   * @param nodeId ID of the node to remove
   */
  removeNode(nodeId: string): SkillThread {
    if (!this.skillNodes.has(nodeId)) {
      return this;
    }
    
    const updatedNodes = new Map(this.skillNodes);
    updatedNodes.delete(nodeId);
    
    return this.with({ skillNodes: updatedNodes });
  }

  /**
   * Create a modified copy of this thread with updated properties
   * @param changes Properties to change in the new instance
   */
  with(changes: Partial<SkillThread>): SkillThread {
    return new SkillThread({
      type: this.type,
      name: this.name,
      description: this.description,
      color: this.color,
      icon: this.icon,
      skillNodes: this.skillNodes,
      ...changes
    });
  }
}
