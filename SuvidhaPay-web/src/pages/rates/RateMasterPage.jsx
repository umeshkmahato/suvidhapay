import React, { useEffect, useState } from 'react';
import { rateService } from '../../services';
import { categoryLabels, formatCurrency, formatDate, formatLabel } from '../../utils/format';
import { hasErrors, validateRateMaster } from '../../utils/validation';

const categories = ['auto', 'e_rickshaw', 'hawker'];

const emptyRates = {
  auto: '',
  e_rickshaw: '',
  hawker: '',
};

export function RateMasterPage() {
  const [rates, setRates] = useState(emptyRates);
  const [history, setHistory] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadRates = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await rateService.list();
      const nextRates = { ...emptyRates };
      response.data.rates.forEach((rate) => {
        nextRates[rate.category] = rate.amount;
      });
      setRates(nextRates);
      setHistory(response.data.history || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRates((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRateMaster(rates);
    setFieldErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSaving(true);

    try {
      await rateService.save({
        rates: categories.map((category) => ({
          category,
          amount: Number(rates[category]),
        })),
      });
      setMessage('Rates saved. Existing dues keep their original amounts.');
      await loadRates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save rates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard__grid">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Rate Master</p>
            <h2>Configure category rates</h2>
          </div>
        </div>
        <p className="muted">New dues use these amounts. Earlier dues are not recalculated.</p>
        {message && <div className="alert alert--success">{message}</div>}
        {error && <div className="alert alert--error">{error}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          {categories.map((category) => (
            <label className="field" key={category}>
              <span>{formatLabel(category, categoryLabels)} (Rs)</span>
              <input
                name={category}
                type="number"
                min="0.01"
                step="0.01"
                value={rates[category]}
                onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors[category] && <small>{fieldErrors[category]}</small>}
            </label>
          ))}
          <div className="form-actions">
            <button type="submit" disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save Rates'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel panel--full">
        <div className="panel__header">
          <div>
            <p className="eyebrow">History</p>
            <h2>Rate changes</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length ? history.map((rate) => (
                <tr key={rate.id}>
                  <td>{formatLabel(rate.category, categoryLabels)}</td>
                  <td>{formatCurrency(rate.amount)}</td>
                  <td>{formatDate(rate.effective_from)}</td>
                  <td>{formatDate(rate.effective_to)}</td>
                  <td>{rate.is_active ? 'Active' : 'Replaced'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">{loading ? 'Loading rates...' : 'No rates configured yet.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

