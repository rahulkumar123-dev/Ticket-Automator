import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw } from 'lucide-react';

const FILTERABLE_FIELDS = [
  'ticket_type', 'state', 'application', 'assignment_group', 'assigned_to', 
  'impact', 'priority', 'urgency', 'severity', 'resolved_by', 
  'updated_by', 'created_by', 'close_code', 'closed_by'
];

const FilterModal = ({ initialFilters, appliedFilters, onApply, onClose }) => {
  const [sortField, setSortField] = useState(appliedFilters.sort_field);
  const [sortOrder, setSortOrder] = useState(appliedFilters.sort_order);
  const [dateField, setDateField] = useState(appliedFilters.date_field);
  const [startDate, setStartDate] = useState(appliedFilters.start_date);
  const [endDate, setEndDate] = useState(appliedFilters.end_date);
  const [keywordFilters, setKeywordFilters] = useState(appliedFilters.keyword_filters);

  const [currentField, setCurrentField] = useState(FILTERABLE_FIELDS[0]);
  const [currentValue, setCurrentValue] = useState('');

  const handleAddKeywordFilter = () => {
    if (currentValue.trim() === '') return;
    setKeywordFilters([...keywordFilters, { field: currentField, value: currentValue.trim() }]);
    setCurrentValue('');
  };

  const handleRemoveKeywordFilter = (indexToRemove) => {
    setKeywordFilters(keywordFilters.filter((_, index) => index !== indexToRemove));
  };
  
  // ✅ UPDATED "Clear All" handler
  const handleClearAll = () => {
    // 1. Reset the local state for immediate visual feedback
    setSortField(initialFilters.sort_field);
    setSortOrder(initialFilters.sort_order);
    setDateField(initialFilters.date_field);
    setStartDate('');
    setEndDate('');
    setKeywordFilters([]);
    // 2. Immediately apply the cleared filters to the main app
    onApply(initialFilters);
  };

  const handleApplyFilters = () => {
    onApply({
      sort_field: sortField,
      sort_order: sortOrder,
      date_field: dateField,
      start_date: startDate,
      end_date: endDate,
      keyword_filters: keywordFilters,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Apply Filter & Sort</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">Sorting & Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Sort By</label>
                <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                  <option value="last_updated_date">Last Updated Date</option>
                  <option value="created_date">Created Date</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Order</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Filter Dates By</label>
                <select value={dateField} onChange={(e) => setDateField(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                  <option value="last_updated_date">Last Updated Date</option>
                  <option value="created_date">Created Date</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Date & Time</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">End Date & Time</label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">Keyword Filters</h3>
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-grow">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Field</label>
                <select value={currentField} onChange={(e) => setCurrentField(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                  {FILTERABLE_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="flex-grow">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Value</label>
                <input type="text" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="Enter value..." className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
              </div>
              <button onClick={handleAddKeywordFilter} className="px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:bg-slate-300" disabled={!currentValue.trim()}>
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {keywordFilters.map((filter, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md">
                  <div>
                    <span className="font-semibold">{filter.field}</span> = <span className="text-slate-600 dark:text-slate-300">"{filter.value}"</span>
                  </div>
                  <button onClick={() => handleRemoveKeywordFilter(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              ))}
              {keywordFilters.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">No filters added.</p>}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <button onClick={handleClearAll} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <RotateCcw size={16} />
            Clear All
          </button>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
            <button onClick={handleApplyFilters} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">Apply Filters</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;