import React from 'react';
import './FiltersSidebar.css';

const FiltersSidebar = ({ filters, setFilters, airlinesList, onClear }) => {
  const handleCheckboxChange = (category, value) => {
    const currentValues = filters[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setFilters({ ...filters, [category]: newValues });
  };

  const handlePriceChange = (e) => {
    setFilters({ ...filters, maxPrice: parseInt(e.target.value) });
  };

  const handleToggle = (category) => {
    setFilters({ ...filters, [category]: !filters[category] });
  };

  return (
    <div className="filters-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={onClear} className="clear-btn">Clear All</button>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-range-info">
          <span>₹{filters.minPrice.toLocaleString()}</span>
          <span>₹{filters.maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="500"
          max="50000"
          step="500"
          value={filters.maxPrice}
          onChange={handlePriceChange}
          className="price-slider"
        />
      </div>

      {/* Stops */}
      <div className="filter-section">
        <h4>Stops</h4>
        {['Non-Stop', '1 Stop', '2+ Stops'].map((stop) => (
          <label key={stop} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.stops.includes(stop)}
              onChange={() => handleCheckboxChange('stops', stop)}
            />
            <span>{stop}</span>
          </label>
        ))}
      </div>

      {/* Airlines */}
      <div className="filter-section">
        <h4>Airlines</h4>
        {airlinesList.map((airline, idx) => (
          <label key={`${airline}-${idx}`} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.airlines.includes(airline)}
              onChange={() => handleCheckboxChange('airlines', airline)}
            />
            <span>{airline || 'Unknown Airline'}</span>
          </label>
        ))}
      </div>

      {/* Departure Time */}
      <div className="filter-section">
        <h4>Departure Time</h4>
        {['Early Morning', 'Morning', 'Afternoon', 'Evening/Night'].map((time) => (
          <label key={time} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.departureTime.includes(time)}
              onChange={() => handleCheckboxChange('departureTime', time)}
            />
            <span>{time}</span>
          </label>
        ))}
      </div>

      {/* Refundable */}
      <div className="filter-section">
        <label className="filter-toggle">
          <span>Refundable Flights Only</span>
          <input
            type="checkbox"
            checked={filters.refundable}
            onChange={() => handleToggle('refundable')}
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Seat Class */}
      <div className="filter-section">
        <h4>Seat Class</h4>
        {['Economy', 'Premium Economy', 'Business'].map((cls) => (
          <label key={cls} className="filter-radio">
            <input
              type="radio"
              name="seatClass"
              checked={filters.seatClass === cls}
              onChange={() => setFilters({ ...filters, seatClass: cls })}
            />
            <span>{cls}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FiltersSidebar;
