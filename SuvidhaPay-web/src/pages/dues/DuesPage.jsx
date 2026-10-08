import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../contexts/store';
import { dueService, rateService, vehicleService } from '../../services';
import {
  categoryLabels,
  dueStatusLabels,
  formatCurrency,
  formatDate,
  formatLabel,
  todayInputDate,
} from '../../utils/format';
import { hasErrors, validateDue } from '../../utils/validation';

const emptyForm = {
  vehicle_id: '',
  due_date: todayInputDate(),
  amount: '',
  status: 'pending',
  paid_amount: '',
  notes: '',
};

export function DuesPage({ initialVehicleId = '', onOpenVehicle }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState({ ...emptyForm, vehicle_id: initialVehicleId });
  const [editingId, setEditingId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [rates, setRates] = useState([]);
  const [dues, setDues] = useState([]);
  const [balances, setBalances] = useState([]);
  const [summary, setSummary] = useState({
    total_due: 0,
    total_paid: 0,
    outstanding_balance: 0,
  });
  const [filters, setFilters] = useState({
    vehicle_id: initialVehicleId,
    status: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === form.vehicle_id),
    [vehicles, form.vehicle_id],
  );

  const suggestedAmount = useMemo(() => {
    if (!selectedVehicle) {
      return '';
    }
    const rate = rates.find((item) => item.category === selectedVehicle.category);
    return rate ? rate.amount : '';
  }, [rates, selectedVehicle]);

  const loadReferenceData = async () => {
    const [vehicleResponse, rateResponse] = await Promise.all([
      vehicleService.options(),
      rateService.list(),
    ]);
    setVehicles(vehicleResponse.data.vehicles);
    setRates(rateResponse.data.rates || []);
  };

  const loadDues = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const [listResponse, outstandingResponse] = await Promise.all([
        dueService.list({
          page,
          limit: pagination.limit,
          vehicle_id: nextFilters.vehicle_id,
          status: nextFilters.status,
        }),
        dueService.outstanding({ vehicle_id: nextFilters.vehicle_id }),
      ]);

      setDues(listResponse.data.dues);
      setSummary(listResponse.data.outstanding);
      setBalances(outstandingResponse.data.vehicles || []);
      setPagination({
        page: listResponse.data.page,
        limit: listResponse.data.limit,
        total: listResponse.data.total,
        totalPages: listResponse.data.totalPages,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferenceData().catch(() => {
      setError('Failed to load vehicles or rates');
    });
    loadDues(1, filters);
  }, []);

  useEffect(() => {
    if (!editingId && suggestedAmount !== '') {
      setForm((prev) => ({ ...prev, amount: suggestedAmount }));
    }
  }, [suggestedAmount, editingId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage('');
    setError('');
  };

  const handleFilterChange = (event) => {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
    loadDues(1, nextFilters);
  };

  const resetForm = () => {
    setForm({ ...emptyForm, vehicle_id: filters.vehicle_id });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateDue(
      { ...form, amount: editingId ? form.amount : suggestedAmount },
      { requireAmount: Boolean(editingId) },
    );
    if (!editingId && suggestedAmount === '') {
      nextErrors.amount = 'Configure a rate for this category before creating a due';
    }
    setFieldErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await dueService.update(editingId, {
          vehicle_id: form.vehicle_id,
          due_date: form.due_date,
          amount: Number(form.amount),
          status: form.status,
          paid_amount: form.status === 'partial' ? Number(form.paid_amount) : undefined,
          notes: form.notes,
        });
        setMessage('Due updated.');
      } else {
        await dueService.create({
          vehicle_id: form.vehicle_id,
          due_date: form.due_date,
          status: form.status,
          paid_amount: form.status === 'partial' ? Number(form.paid_amount) : undefined,
          notes: form.notes,
        });
        setMessage('Due created from the active category rate.');
      }
      resetForm();
      await loadDues(1, filters);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save due');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (due) => {
    setEditingId(due.id);
    setForm({
      vehicle_id: due.vehicle_id,
      due_date: formatDate(due.due_date),
      amount: due.amount,
      status: due.status === 'cancelled' ? 'pending' : due.status,
      paid_amount: due.paid_amount,
      notes: due.notes || '',
    });
    setMessage('');
    setError('');
  };

  const handleCancel = async (due) => {
    if (!window.confirm(`Cancel the due for ${due.vehicle_number} on ${formatDate(due.due_date)}? The record will be kept.`)) {
      return;
    }

    try {
      await dueService.cancel(due.id, { cancellation_reason: 'Cancelled by admin' });
      setMessage('Due cancelled. Historical record retained.');
      await loadDues(pagination.page, filters);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel due');
    }
  };

  return (
    <main className="dashboard__grid">
      {isAdmin && (
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Due Creation</p>
              <h2>{editingId ? 'Edit due' : 'Create due'}</h2>
            </div>
          </div>
          {message && <div className="alert alert--success">{message}</div>}
          {error && <div className="alert alert--error">{error}</div>}
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Vehicle</span>
              <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange}>
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicle_number} - {vehicle.owner_name}
                  </option>
                ))}
              </select>
              {fieldErrors.vehicle_id && <small>{fieldErrors.vehicle_id}</small>}
            </label>
            <label className="field">
              <span>Due Date</span>
              <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
              {fieldErrors.due_date && <small>{fieldErrors.due_date}</small>}
            </label>
            <label className="field">
              <span>Amount</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={editingId ? form.amount : suggestedAmount}
                onChange={handleChange}
                readOnly={!editingId}
              />
              <small className="hint">
                {editingId
                  ? 'Editing keeps this historical amount unless you change it.'
                  : 'Calculated from Rate Master. It is stored on the due.'}
              </small>
              {fieldErrors.amount && <small>{fieldErrors.amount}</small>}
            </label>
            <label className="field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
              {fieldErrors.status && <small>{fieldErrors.status}</small>}
            </label>
            {form.status === 'partial' && (
              <label className="field">
                <span>Paid Amount</span>
                <input
                  name="paid_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.paid_amount}
                  onChange={handleChange}
                />
                {fieldErrors.paid_amount && <small>{fieldErrors.paid_amount}</small>}
              </label>
            )}
            <label className="field field--full">
              <span>Notes</span>
              <textarea name="notes" rows="2" value={form.notes} onChange={handleChange} />
            </label>
            <div className="form-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Due' : 'Create Due'}
              </button>
              {editingId && (
                <button type="button" className="button button--ghost" onClick={resetForm}>
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="panel panel--full">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Outstanding Calculation</p>
            <h2>Vehicle-wise balances</h2>
          </div>
        </div>
        <div className="stat-grid">
          <article className="stat-card">
            <span>Total Due</span>
            <strong>{formatCurrency(summary.total_due)}</strong>
          </article>
          <article className="stat-card">
            <span>Total Paid</span>
            <strong>{formatCurrency(summary.total_paid)}</strong>
          </article>
          <article className="stat-card">
            <span>Outstanding Balance</span>
            <strong>{formatCurrency(summary.outstanding_balance)}</strong>
          </article>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Total Due</th>
                <th>Total Paid</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((row) => (
                <tr key={row.vehicle_id}>
                  <td>
                    <button type="button" className="link-button" onClick={() => onOpenVehicle(row.vehicle_id)}>
                      {row.vehicle_number}
                    </button>
                  </td>
                  <td>{row.owner_name}</td>
                  <td>{formatLabel(row.category, categoryLabels)}</td>
                  <td>{formatCurrency(row.total_due)}</td>
                  <td>{formatCurrency(row.total_paid)}</td>
                  <td>{formatCurrency(row.outstanding_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel panel--full">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Due History</p>
            <h2>Created dues</h2>
          </div>
        </div>
        {!isAdmin && error && <div className="alert alert--error">{error}</div>}
        {!isAdmin && message && <div className="alert alert--success">{message}</div>}
        <div className="filter-row">
          <label className="field">
            <span>Vehicle</span>
            <select name="vehicle_id" value={filters.vehicle_id} onChange={handleFilterChange}>
              <option value="">All vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_number}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && !dues.length ? (
                <tr><td colSpan={isAdmin ? 7 : 6}>Loading dues...</td></tr>
              ) : dues.length ? dues.map((due) => (
                <tr key={due.id}>
                  <td>{due.vehicle_number}</td>
                  <td>{formatDate(due.due_date)}</td>
                  <td>{formatCurrency(due.amount)}</td>
                  <td>{formatCurrency(due.paid_amount)}</td>
                  <td>{formatCurrency(due.outstanding_amount)}</td>
                  <td>
                    <span className={`badge badge--${due.status}`}>
                      {formatLabel(due.status, dueStatusLabels)}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="table-actions">
                      <button type="button" className="button button--small" onClick={() => handleEdit(due)} disabled={due.status === 'cancelled'}>
                        Edit
                      </button>
                      <button type="button" className="button button--small button--danger" onClick={() => handleCancel(due)} disabled={due.status === 'cancelled'}>
                        Cancel
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={isAdmin ? 7 : 6}>No dues found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button type="button" onClick={() => loadDues(pagination.page - 1, filters)} disabled={pagination.page <= 1}>
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button type="button" onClick={() => loadDues(pagination.page + 1, filters)} disabled={pagination.page >= pagination.totalPages}>
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

