import React, { useState, useEffect, useCallback } from 'react';
import Filters from './components/Filters';
import TicketTable from './components/TicketTable';
import Pagination from './components/Pagination';
import TicketModal from './components/TicketModal';
import Spinner from './components/Spinner';
import FilterModal from './components/FilterModal';
import SearchBar from './components/SearchBar';
import SearchResultModal from './components/SearchResultModal';
import Settings from './components/Settings'; // ✅ Import Settings

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState([null]); 

  // ✅ THEME MANAGEMENT START
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  // ✅ THEME MANAGEMENT END

  const initialFilters = {
    sort_field: 'last_updated_date',
    sort_order: 'desc',
    date_field: 'last_updated_date',
    start_date: '',
    end_date: '',
    keyword_filters: [],
  };
  
  const [filtersToApply, setFiltersToApply] = useState(initialFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchResultModalOpen, setIsSearchResultModalOpen] = useState(false);
  const [searchResult, setSearchResult] = useState({ ticket: null, error: null, loading: false });


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTickets = useCallback(async () => {
    // ... (This function remains unchanged)
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page_size: 10,
      sort_field: filtersToApply.sort_field,
      sort_order: filtersToApply.sort_order,
      date_field: filtersToApply.date_field,
    });
    if (filtersToApply.start_date) params.append('start_date', `${filtersToApply.start_date.replace('T', ' ')}:00`);
    if (filtersToApply.end_date) params.append('end_date', `${filtersToApply.end_date.replace('T', ' ')}:00`);
    if (filtersToApply.keyword_filters.length > 0) {
      const filterString = filtersToApply.keyword_filters.map(f => `${f.field}=${f.value}`).join(',');
      params.append('filters', filterString);
    }
    const cursor = cursors[currentPage - 1];
    if (cursor) {
      params.append('search_after', JSON.stringify(cursor));
    }
    try {
      const response = await fetch(`http://localhost:8000/tickets/search?${params.toString()}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to fetch tickets');
      }
      const data = await response.json();
      setTickets(data.tickets || []);
      if (data.next_cursor) {
        setCursors(prev => {
          const newCursors = [...prev];
          newCursors[currentPage] = data.next_cursor;
          return newCursors;
        });
      } else {
        setCursors(prev => prev.slice(0, currentPage));
      }
    } catch (err) {
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtersToApply]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleApplyFilters = (newFilters) => {
    setCurrentPage(1);
    setCursors([null]);
    setFiltersToApply(newFilters);
  };

  const handleTicketSearch = async (ticketNumber) => {
    setIsSearchLoading(true);
    setSearchResult({ ticket: null, error: null, loading: true });
    setIsSearchResultModalOpen(true);
    try {
      const response = await fetch(`http://localhost:8000/ticket/${ticketNumber}`);
      if (response.status === 404) {
        setSearchResult({ ticket: null, error: null, loading: false });
        return;
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Search failed');
      }
      const data = await response.json();
      setSearchResult({ ticket: data.ticket, error: null, loading: false });
    } catch (err) {
      setSearchResult({ ticket: null, error: err.message, loading: false });
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleViewDetailsFromSearch = (ticketNumber) => {
    setIsSearchResultModalOpen(false);
    setSelectedTicket(ticketNumber);
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">ServiceNow Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Browse and search incident tickets.</p>
        </div>
        <Settings theme={theme} setTheme={setTheme} />
      </div>

      {/* ✅ NEW COMPACT LAYOUT */}
      <div className="flex items-center gap-4 mb-6">
        <SearchBar onSearch={handleTicketSearch} isLoading={isSearchLoading} />
        <Filters activeFilters={filtersToApply} onOpenModal={() => setIsFilterModalOpen(true)} />
      </div>
      
      {isFilterModalOpen && (
        <FilterModal 
          initialFilters={initialFilters} // Pass initial filters for reset functionality
          appliedFilters={filtersToApply} // Pass currently applied filters for display
          onApply={handleApplyFilters}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}
      
      {isSearchResultModalOpen && (
        <SearchResultModal 
          result={searchResult}
          onClose={() => setIsSearchResultModalOpen(false)}
          onViewDetails={handleViewDetailsFromSearch}
        />
      )}
      
      <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
         {loading ? (
          <Spinner />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-center m-4">
            <p><strong>Error:</strong> {error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400 px-4 py-8 rounded-md text-center m-4">
            <p>No tickets found for the selected criteria.</p>
          </div>
        ) : (
          <>
            <TicketTable tickets={tickets} onTicketClick={(t) => setSelectedTicket(t)} />
          </>
        )}
      </div>
      {!loading && !error && tickets.length > 0 && (
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            hasNextPage={cursors.length > currentPage}
          />
      )}

      {selectedTicket && <TicketModal ticketNumber={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
}

export default App;