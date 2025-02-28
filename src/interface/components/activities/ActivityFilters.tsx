// /Users/montysharma/Documents/v8/MMV08/src/interface/components/activities/ActivityFilters.tsx

import React, { useState, useEffect } from 'react';
import { ActivityCategory } from '../../../domain/types/ActivityTypes';
import './ActivityFilters.css';

// Define available categories with display names
const CATEGORY_OPTIONS: Record<ActivityCategory, string> = {
  academic: 'Academic',
  social: 'Social',
  leisure: 'Leisure',
  work: 'Work',
  health: 'Health',
  rest: 'Rest',
  special: 'Special'
};

// Define sort options
const SORT_OPTIONS = [
  { id: 'name-asc', label: 'Name (A-Z)' },
  { id: 'name-desc', label: 'Name (Z-A)' },
  { id: 'duration-asc', label: 'Duration (Shortest first)' },
  { id: 'duration-desc', label: 'Duration (Longest first)' },
];

export interface ActivityFilterState {
  categories: ActivityCategory[];
  search: string;
  sortBy: string;
  locations: string[];
  hideUnavailable: boolean;
}

interface ActivityFiltersProps {
  onFilterChange: (filters: ActivityFilterState) => void;
  locations?: string[]; // Available locations
}

/**
 * Component for filtering and sorting activities
 */
export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  onFilterChange,
  locations = []
}) => {
  const [filters, setFilters] = useState<ActivityFilterState>({
    categories: [],
    search: '',
    sortBy: 'name-asc',
    locations: [],
    hideUnavailable: false
  });

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle category filter changes
  const handleCategoryChange = (category: ActivityCategory) => {
    setFilters(prevFilters => {
      const categories = prevFilters.categories.includes(category)
        ? prevFilters.categories.filter(c => c !== category)
        : [...prevFilters.categories, category];
      
      return { ...prevFilters, categories };
    });
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      search: e.target.value
    }));
  };

  // Handle sort selection changes
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      sortBy: e.target.value
    }));
  };

  // Handle location filter changes
  const handleLocationChange = (location: string) => {
    setFilters(prevFilters => {
      const locations = prevFilters.locations.includes(location)
        ? prevFilters.locations.filter(l => l !== location)
        : [...prevFilters.locations, location];
      
      return { ...prevFilters, locations };
    });
  };

  // Handle hide unavailable toggle
  const handleHideUnavailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      hideUnavailable: e.target.checked
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      categories: [],
      search: '',
      sortBy: 'name-asc',
      locations: [],
      hideUnavailable: false
    });
  };

  return (
    <div className="activity-filters">
      <div className="filter-section">
        <h4>Search</h4>
        <input
          type="text"
          className="search-input"
          placeholder="Search activities..."
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="filter-section">
        <h4>Categories</h4>
        <div className="category-filters">
          {Object.entries(CATEGORY_OPTIONS).map(([category, label]) => (
            <label key={category} className="category-checkbox">
              <input
                type="checkbox"
                checked={filters.categories.includes(category as ActivityCategory)}
                onChange={() => handleCategoryChange(category as ActivityCategory)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      
      {locations.length > 0 && (
        <div className="filter-section">
          <h4>Locations</h4>
          <div className="location-filters">
            {locations.map(location => (
              <label key={location} className="location-checkbox">
                <input
                  type="checkbox"
                  checked={filters.locations.includes(location)}
                  onChange={() => handleLocationChange(location)}
                />
                {location}
              </label>
            ))}
          </div>
        </div>
      )}
      
      <div className="filter-section">
        <h4>Sort By</h4>
        <select
          className="sort-select"
          value={filters.sortBy}
          onChange={handleSortChange}
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-section">
        <label className="availability-toggle">
          <input
            type="checkbox"
            checked={filters.hideUnavailable}
            onChange={handleHideUnavailableChange}
          />
          Hide unavailable activities
        </label>
      </div>
      
      <button
        className="clear-filters-button"
        onClick={handleClearFilters}
      >
        Clear All Filters
      </button>
    </div>
  );
};
