// /Users/montysharma/Documents/v8/MMV08/Mock_project/domain/ResourceValue.ts

/**
 * ResourceValue is a value object that represents a resource with a current value
 * that is constrained between a minimum and maximum value.
 */
export class ResourceValue {
  private _value: number;
  private _min: number;
  private _max: number;

  constructor(value: number, min: number = 0, max: number = 100) {
    this._min = min;
    this._max = max;
    // Ensure value is within bounds on creation
    this._value = this.constrain(value);
  }

  /**
   * Get the current value
   */
  get value(): number {
    return this._value;
  }

  /**
   * Get the minimum allowed value
   */
  get min(): number {
    return this._min;
  }

  /**
   * Get the maximum allowed value
   */
  get max(): number {
    return this._max;
  }

  /**
   * Get the value as a percentage of the range
   */
  get percentage(): number {
    const range = this._max - this._min;
    return range === 0 ? 100 : ((this._value - this._min) / range) * 100;
  }

  /**
   * Create a new ResourceValue with updated value
   */
  add(amount: number): ResourceValue {
    return new ResourceValue(this._value + amount, this._min, this._max);
  }

  /**
   * Create a new ResourceValue with updated value
   */
  subtract(amount: number): ResourceValue {
    return new ResourceValue(this._value - amount, this._min, this._max);
  }

  /**
   * Create a new ResourceValue with updated value set to a specific amount
   */
  setValue(newValue: number): ResourceValue {
    return new ResourceValue(newValue, this._min, this._max);
  }

  /**
   * Constrain a value to be within the min and max bounds
   */
  private constrain(value: number): number {
    return Math.max(this._min, Math.min(this._max, value));
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      value: this._value,
      min: this._min,
      max: this._max
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(json: { value: number; min: number; max: number }): ResourceValue {
    return new ResourceValue(json.value, json.min, json.max);
  }
}
