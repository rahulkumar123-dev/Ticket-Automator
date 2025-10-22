import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Spinner from './Spinner';

const DetailItem = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200 sm:mt-0 sm:col-span-2">{value || <span className="text-slate-400 dark:text-slate-500">N/A</span>}</dd>
  </div>
);

const TicketModal = ({ ticketNumber, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketNumber) return;

    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/ticket/${ticketNumber}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTicket(data.ticket);
      } catch (err) {
        setError('Failed to fetch ticket details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketNumber]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Ticket Details: {ticketNumber}</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading && <Spinner />}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {ticket && (
            <dl className="divide-y divide-slate-200 dark:divide-slate-700">
              <DetailItem label="Number" value={ticket.number} />
              <DetailItem label="State" value={ticket.state} />
              <DetailItem label="Short Description" value={ticket.short_description} />
              <DetailItem label="Description" value={<pre className="whitespace-pre-wrap font-sans">{ticket.description}</pre>} />
              <DetailItem label="Assignment Group" value={ticket.assignment_group} />
              <DetailItem label="Assigned To" value={ticket.assigned_to} />
              <DetailItem label="Priority" value={ticket.priority} />
              <DetailItem label="Impact" value={ticket.impact} />
              <DetailItem label="Urgency" value={ticket.urgency} />
              <DetailItem label="Created" value={`${new Date(ticket.created_date).toLocaleString()} by ${ticket.created_by}`} />
              <DetailItem label="Last Updated" value={`${new Date(ticket.last_updated_date).toLocaleString()} by ${ticket.updated_by}`} />
              <DetailItem label="Resolved" value={ticket.resolved_at ? `${new Date(ticket.resolved_at).toLocaleString()} by ${ticket.resolved_by}` : null} />
              <DetailItem label="Closed" value={ticket.closed_at ? `${new Date(ticket.closed_at).toLocaleString()} by ${ticket.closed_by}` : null} />
              <DetailItem label="Close Code" value={ticket.close_code} />
              <DetailItem label="Close Notes" value={<pre className="whitespace-pre-wrap font-sans">{ticket.close_notes}</pre>} />
              <DetailItem label="Work Notes" value={<pre className="whitespace-pre-wrap font-sans">{ticket.comments_and_work_notes}</pre>} />
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;