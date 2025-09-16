import React from 'react';

const StatItem = ({ label, value }) => {
  return (
    <div className="stat-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};

export default StatItem;