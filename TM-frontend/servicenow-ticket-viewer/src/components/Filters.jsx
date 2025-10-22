import React from 'react';
import { Filter } from 'lucide-react';

const Filters = ({ activeFilters, onOpenModal }) => {
  const filterCount =
    (activeFilters.start_date ? 1 : 0) +
    (activeFilters.end_date ? 1 : 0) +
    activeFilters.keyword_filters.length;

  return (
    // ✅ CHANGED: Removed outer container, now it's just the button
    <button 
      onClick={onOpenModal} 
      className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
    >
      <Filter size={20} />
      <span>Filter</span> 
      {filterCount > 0 && (
        <span className="ml-2 bg-sky-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{filterCount}</span>
      )}
    </button>
  );
};

export default Filters;