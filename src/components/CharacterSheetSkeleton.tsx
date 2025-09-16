import React from 'react';
import '@/app/styles/Skeleton.css';

// FIX: Added the correct TypeScript type for the props
const SkeletonElement = ({ type }: { type: string }) => <div className={`skeleton ${type}`}></div>;

const CharacterSheetSkeleton = () => {
  return (
    <div className="App">
      <div className="character-sheet-container">
        <div className="layout-header">
          <SkeletonElement type="title" />
          <SkeletonElement type="text" />
        </div>
        <div className="layout-art">
          <SkeletonElement type="art" />
        </div>
        <div className="layout-main-stats">
          <SkeletonElement type="panel" />
        </div>
        <div className="layout-special-stats">
          <SkeletonElement type="panel" />
        </div>
        <div className="layout-skills">
          <SkeletonElement type="skills" />
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetSkeleton;