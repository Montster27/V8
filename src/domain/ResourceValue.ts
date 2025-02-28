/**
 * ResourceValue class to encapsulate game resource values with min/max constraints
 * Implemented as an immutable value object - all operations return new instances
 */
export class ResourceValue {
  private readonly _value: number;
  private readonly _min: number;
  private readonly _max: number;

  constructor(initialValue: number, min = 0, max = 100) {
    this._min = min;
    this._max = max;
    this._value = this.constrain(initialValue);
  }

  /**
   * Gets the current value
   */
  get value(): number {
    return this._value;
  }

  /**
   * Gets the minimum allowed value
   */
  get min(): number {
    return this._min;
  }

  /**
   * Gets the maximum allowed value
   */
  get max(): number {
    return this._max;
  }

  /**
   * Returns the percentage of the current value relative to min/max range
   */
  get percentage(): number {
    const range = this._max - this._min;
    if (range === 0) return 0;
    return ((this._value - this._min) / range) * 100;
  }

  /**
   * Adds a value to the current value, returning a new ResourceValue
   * @param amount Amount to add
   * @returns New ResourceValue instance
   */
  add(amount: number): ResourceValue {
    return new ResourceValue(this._value + amount, this._min, this._max);
  }

  /**
   * Subtracts a value from the current value, returning a new ResourceValue
   * @param amount Amount to subtract
   * @returns New ResourceValue instance
   */
  subtract(amount: number): ResourceValue {
    return new ResourceValue(this._value - amount, this._min, this._max);
  }

  /**
   * Sets a new value, returning a new ResourceValue
   * @param newValue Value to set
   * @returns New ResourceValue instance
   */
  set(newValue: number): ResourceValue {
    return new ResourceValue(newValue, this._min, this._max);
  }

  /**
   * Constrains a value to be within min and max bounds
   * @param value Value to constrain
   * @returns Constrained value
   */
  private constrain(value: number): number {
    return Math.max(this._min, Math.min(this._max, value));
  }

  /**
   * Serializes the resource value to JSON
   * @returns JSON representation
   */
  toJSON() {
    return {
      value: this._value,
      min: this._min,
      max: this._max
    };
  }

  /**
   * Creates a ResourceValue from JSON
   * @param json JSON representation
   * @returns New ResourceValue instance
   */
  static fromJSON(json: { value: number; min: number; max: number }): ResourceValue {
    return new ResourceValue(json.value, json.min, json.max);
  }
}
