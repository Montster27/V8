// /Users/montysharma/Documents/v8/MMV08/src/domain/valueObjects/TimeValue.ts

/**
 * TimeValue is a value object that represents time in the game world.
 * It handles the conversion between game time and real time, and provides
 * utilities for time manipulation and comparison.
 */
class TimeValue {
  private _timestamp: number; // Unix timestamp in milliseconds
  private _timeScale: number; // How fast game time progresses relative to real time

  /**
   * Create a new TimeValue
   * @param timestamp Unix timestamp in milliseconds
   * @param timeScale How fast game time progresses (1 = real time, 2 = twice as fast)
   */
  constructor(timestamp: number = Date.now(), timeScale: number = 1) {
    this._timestamp = timestamp;
    this._timeScale = Math.max(0, timeScale); // Prevent negative time scale
  }

  /**
   * Get the current timestamp
   */
  get timestamp(): number {
    return this._timestamp;
  }

  /**
   * Get the current time scale
   */
  get timeScale(): number {
    return this._timeScale;
  }

  /**
   * Get a JavaScript Date object for the current game time
   */
  get date(): Date {
    return new Date(this._timestamp);
  }

  /**
   * Get the game time as a formatted string (24-hour format)
   */
  get formattedTime(): string {
    return this.date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false // Use 24-hour format
    });
  }

  /**
   * Get the game date as a formatted string
   */
  get formattedDate(): string {
    return this.date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Create a new TimeValue with time advanced by the specified milliseconds
   * @param milliseconds The amount of real time that has passed
   */
  advance(milliseconds: number): TimeValue {
    const gameMilliseconds = milliseconds * this._timeScale;
    return new TimeValue(this._timestamp + gameMilliseconds, this._timeScale);
  }

  /**
   * Create a new TimeValue with an updated time scale
   * @param newTimeScale The new time scale
   */
  setTimeScale(newTimeScale: number): TimeValue {
    return new TimeValue(this._timestamp, newTimeScale);
  }

  /**
   * Create a new TimeValue with a specific timestamp
   * @param newTimestamp The new timestamp
   */
  setTimestamp(newTimestamp: number): TimeValue {
    return new TimeValue(newTimestamp, this._timeScale);
  }

  /**
   * Check if this time is after another time
   * @param other The time to compare with
   */
  isAfter(other: TimeValue): boolean {
    return this._timestamp > other.timestamp;
  }

  /**
   * Check if this time is before another time
   * @param other The time to compare with
   */
  isBefore(other: TimeValue): boolean {
    return this._timestamp < other.timestamp;
  }

  /**
   * Get the difference in milliseconds between this time and another time
   * @param other The time to compare with
   */
  differenceInMilliseconds(other: TimeValue): number {
    return this._timestamp - other.timestamp;
  }

  /**
   * Convert TimeValue to string representation (ISO format)
   */
  toString(): string {
    return this.date.toISOString();
  }

  /**
   * Create a TimeValue from a string representation (ISO format)
   */
  static fromString(dateString: string): TimeValue {
    return new TimeValue(new Date(dateString).getTime());
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      timestamp: this._timestamp,
      timeScale: this._timeScale
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(json: { timestamp: number; timeScale: number }): TimeValue {
    return new TimeValue(json.timestamp, json.timeScale);
  }

  /**
   * Create a TimeValue representing the start of the game (1983 college setting)
   */
  static createGameStart(): TimeValue {
    // Set to September 1, 1983 (typical start of college year)
    const startDate = new Date(1983, 8, 1, 8, 0, 0); // Month is 0-indexed
    return new TimeValue(startDate.getTime());
  }
}

// Add default export
export default TimeValue;
// Also export as named export for backward compatibility
export { TimeValue };
