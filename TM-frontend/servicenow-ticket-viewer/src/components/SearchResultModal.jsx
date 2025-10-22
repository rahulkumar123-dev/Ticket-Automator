import React from 'react';
import { X, AlertTriangle, Ticket, ChevronsRight } from 'lucide-react';
import Spinner from './Spinner';

const SearchResultModal = ({ result, onClose, onViewDetails }) => {
  const handleViewClick = () => {
    onViewDetails(result.ticket.number);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Search Result</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-8 text-center">
          {result.loading && <Spinner />}
          
          {result.error && (
            <div className="flex flex-col items-center gap-4 text-red-600 dark:text-red-400">
              <AlertTriangle size={48} />
              <p className="font-semibold">An error occurred.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{result.error}</p>
            </div>
          )}
          
          {!result.loading && !result.error && result.ticket && (
             <div className="flex flex-col items-center gap-4 text-emerald-600 dark:text-emerald-400">
              <Ticket size={48} />
              <p className="font-semibold">Ticket Found!</p>
              <button onClick={handleViewClick} className="mt-4 flex items-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">
                <span>View Details for {result.ticket.number}</span>
                <ChevronsRight size={20} />
              </button>
            </div>
          )}
          
           {!result.loading && !result.error && !result.ticket && (
             <div className="flex flex-col items-center gap-4 text-slate-600 dark:text-slate-400">
              <AlertTriangle size={48} />
              <p className="font-semibold">No matching ticket found.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Please check the ticket number and try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultModal;