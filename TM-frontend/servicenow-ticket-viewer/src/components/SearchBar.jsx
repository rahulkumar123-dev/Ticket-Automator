import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, isLoading }) => {
  const [ticketNumber, setTicketNumber] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;
    onSearch(ticketNumber.trim());
  };

  return (
    // ✅ CHANGED: Removed outer container, added flex-grow for responsive width
    <form onSubmit={handleSearch} className="flex-grow flex gap-2 max-w-lg">
      <input
        type="text"
        value={ticketNumber}
        onChange={(e) => setTicketNumber(e.target.value)}
        placeholder="Search by ticket number..."
        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
      />
      <button
        type="submit"
        disabled={isLoading || !ticketNumber.trim()}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm"
      >
        <Search size={20} />
      </button>
    </form>
  );
};

export default SearchBar;