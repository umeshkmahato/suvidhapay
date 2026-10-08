import React, { useEffect, useState } from 'react';
import { vehicleService } from '../../services';
import {
  categoryLabels,
  dueStatusLabels,
  formatCurrency,
  formatDate,
  formatLabel,
  vehicleStatusLabels,
} from '../../utils/format';

export function VehicleDetailPage({ vehicleId, onBack, onCreateDue }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadDetail = async (nextPage = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await vehicleService.getById(vehicleId, { page: nextPage, limit: 20 });
      setDetail(response.data);
      setPage(response.data.page);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      loadDetail(1);
    }
  }, [vehicleId]);

  if (!vehicleId) {
    return (
      <main className="dashboard__grid">
        <section className="panel">
          <p>Select a vehicle to view dues.</p>
        </section>
      </main>
    );
  }

  const vehicle = detail?.vehicle;
  const outstanding = detail?.outstanding || {};

  return (
    <main className="dashboard__grid">
      <section className="panel panel--full">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Vehicle Detail</p>
            <h2>{vehicle?.vehicle_number || 'Vehicle'}</h2>
          </div>
          <div className="form-actions">
            <button type="button" className="button button--ghost" onClick={onBack}>Back</button>
            {onCreateDue && vehicle && (
              <button type="button" onClick={() => onCreateDue(vehicle.id)}>Create Due</button>
            )}
          </div>
        </div>
        {error && <div className="alert alert--error">{error}</div>}
        {loading && !vehicle ? <p>Loading vehicle...</p> : null}
        {vehicle && (
          <div className="detail-grid">
            <div><span>Owner</span><strong>{vehicle.owner_name}</strong></div>
            <div><span>Mobile</span><strong>{vehicle.mobile_number}</strong></div>
            <div><span>Category</span><strong>{formatLabel(vehicle.category, categoryLabels)}</strong></div>
            <div><span>Status</span><strong>{formatLabel(vehicle.status, vehicleStatusLabels)}</strong></div>
            <div className="field--full"><span>Address</span><strong>{vehicle.address}</strong></div>
            <div>
              <span>Current Rate</span>
              <strong>{detail.rate ? formatCurrency(detail.rate.amount) : 'Not configured'}</strong>
            </div>
          </div>
        )}
      </section>

      <section className="panel panel--full">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Outstanding Amount</p>
            <h2>Balance for this vehicle</h2>
          </div>
        </div>
        <div className="stat-grid">
          <article className="stat-card">
            <span>Total Due</span>
            <strong>{formatCurrency(outstanding.total_due)}</strong>
          </article>
          <article className="stat-card">
            <span>Total Paid</span>
            <strong>{formatCurrency(outstanding.total_paid)}</strong>
          </article>
          <article className="stat-card">
            <span>Outstanding Balance</span>
            <strong>{formatCurrency(outstanding.outstanding_balance)}</strong>
          </article>
        </div>
      </section>

      <section className="panel panel--full">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Due History</p>
            <h2>Charges kept for this vehicle</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Applied Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {detail?.dues?.length ? detail.dues.map((due) => (
                <tr key={due.id}>
                  <td>{formatDate(due.due_date)}</td>
                  <td>{formatCurrency(due.amount)}</td>
                  <td>{formatCurrency(due.paid_amount)}</td>
                  <td>{formatCurrency(due.outstanding_amount)}</td>
                  <td>{due.applied_rate === null ? '-' : formatCurrency(due.applied_rate)}</td>
                  <td>
                    <span className={`badge badge--${due.status}`}>
                      {formatLabel(due.status, dueStatusLabels)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6">{loading ? 'Loading history...' : 'No dues recorded.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button type="button" onClick={() => loadDetail(page - 1)} disabled={page <= 1}>Previous</button>
          <span>Page {detail?.page || 1} of {detail?.totalPages || 1}</span>
          <button
            type="button"
            onClick={() => loadDetail(page + 1)}
            disabled={!detail || page >= detail.totalPages}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

