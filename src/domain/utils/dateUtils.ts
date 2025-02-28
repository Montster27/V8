import { format as dateFnsFormat } from 'date-fns';

/**
 * Formats a date according to the specified format string
 * 
 * @param date - The date to format
 * @param formatString - The format pattern to use
 * @returns Formatted date string
 */
export const formatDate = (date: Date, formatString: string): string => {
  return dateFnsFormat(date, formatString);
};
