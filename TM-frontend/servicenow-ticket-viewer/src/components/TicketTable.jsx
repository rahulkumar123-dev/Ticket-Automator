import React from 'react';

const TicketTable = ({ tickets, onTicketClick }) => {
  const getStatusColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'new': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
      case 'in progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      case 'closed': return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Number</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">State</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignment Group</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignee</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {tickets.map(ticket => (
            <tr key={ticket.sys_id} onClick={() => onTicketClick(ticket.number)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600 dark:text-sky-400">{ticket.number || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.state)}`}>
                  {ticket.state || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{ticket.assignment_group || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{ticket.assigned_to || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(ticket.created_date).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(ticket.last_updated_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;