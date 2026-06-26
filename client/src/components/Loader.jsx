import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 rounded-full border-4 border-surface border-t-accent animate-spin"></div>
    </div>
  );
};

export default Loader;
