import React from 'react';

const Pagination = ({ currentPage, setCurrentPage, hasNextPage }) => {
  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600"
      >
        Previous
      </button>

      <span className="px-4 py-2 bg-sky-600 text-white rounded-md font-bold shadow-sm">
        {currentPage}
      </span>

      <button
        onClick={() => setCurrentPage(prev => prev + 1)}
        disabled={!hasNextPage}
        className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;