import React, { useEffect, useMemo, useState } from 'react';
import { vehicleService } from '../../services';
import { formatCurrency, formatLabel } from '../../utils/format';
import { hasErrors, validateVehicle, validateVehicleSearch } from '../../utils/validation';

const initialVehicleForm = {
  vehicle_number: '',
  owner_name: '',
  mobile_number: '',
  category: 'auto',
  address: '',
  status: 'active',
};

const initialSearchForm = {
  vehicle_number: '',
  mobile_number: '',
};

const categoryLabels = {
  auto: 'Auto',
  e_rickshaw: 'E-Rickshaw',
  hawker: 'Hawker',
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
};

export function Dashboard({ onOpenVehicle }) {
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);
  const [searchForm, setSearchForm] = useState(initialSearchForm);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const loadVehicles = async (page = pagination.page, nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const response = await vehicleService.list({
        page,
        limit: pagination.limit,
        search: nextFilters.search,
        category: nextFilters.category,
        status: nextFilters.status,
      });

      setVehicles(response.data.vehicles);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles(1, filters);
  }, []);

  const handleVehicleChange = (event) => {
    const { name, value } = event.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage('');
    setError('');
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    loadVehicles(1, nextFilters);
  };

  const handleVehicleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateVehicle(vehicleForm);
    setFieldErrors(nextErrors);
    setError('');
    setMessage('');

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);

    try {
      await vehicleService.create(vehicleForm);
      setVehicleForm(initialVehicleForm);
      setMessage('Vehicle registered successfully.');
      await loadVehicles(1, filters);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const nextApiErrors = {};
        apiErrors.forEach((item) => {
          nextApiErrors[item.field] = item.message;
        });
        setFieldErrors(nextApiErrors);
      }

      setError(err.response?.data?.error || 'Failed to register vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateVehicleSearch(searchForm);
    setFieldErrors(nextErrors);
    setError('');

    if (hasErrors(nextErrors)) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await vehicleService.search(searchForm);
      setSearchResults(response.data.vehicles);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const nextApiErrors = {};
        apiErrors.forEach((item) => {
          nextApiErrors[item.field] = item.message;
        });
        setFieldErrors(nextApiErrors);
      }
      setError(err.response?.data?.error || 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    loadVehicles(nextPage, filters);
  };

  const visibleSearchResults = useMemo(() => searchResults, [searchResults]);

  return (
    <main className="dashboard__grid">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Vehicle Registration</p>
            <h2>Register a new vehicle</h2>
          </div>
          <span className="count">{pagination.total} total records</span>
        </div>

        {message && <div className="alert alert--success">{message}</div>}
        {error && <div className="alert alert--error">{error}</div>}

        <form className="form-grid" onSubmit={handleVehicleSubmit}>
          <label className="field">
            <span>Vehicle Number</span>
            <input
              name="vehicle_number"
              value={vehicleForm.vehicle_number}
              onChange={handleVehicleChange}
              placeholder="MH12AB1234"
            />
            {fieldErrors.vehicle_number && <small>{fieldErrors.vehicle_number}</small>}
          </label>

          <label className="field">
            <span>Owner Name</span>
            <input
              name="owner_name"
              value={vehicleForm.owner_name}
              onChange={handleVehicleChange}
              placeholder="Ramesh Kumar"
            />
            {fieldErrors.owner_name && <small>{fieldErrors.owner_name}</small>}
          </label>

          <label className="field">
            <span>Mobile Number</span>
            <input
              name="mobile_number"
              value={vehicleForm.mobile_number}
              onChange={handleVehicleChange}
              placeholder="9876543210"
            />
            {fieldErrors.mobile_number && <small>{fieldErrors.mobile_number}</small>}
          </label>

          <label className="field">
            <span>Category</span>
            <select
              name="category"
              value={vehicleForm.category}
              onChange={handleVehicleChange}
              aria-invalid={Boolean(fieldErrors.category)}
              required
            >
              <option value="auto">Auto</option>
              <option value="e_rickshaw">E-Rickshaw</option>
              <option value="hawker">Hawker</option>
            </select>
            {fieldErrors.category && <small>{fieldErrors.category}</small>}
          </label>

          <label className="field field--full">
            <span>Address</span>
            <textarea
              name="address"
              rows="3"
              value={vehicleForm.address}
              onChange={handleVehicleChange}
              placeholder="Full address"
              aria-invalid={Boolean(fieldErrors.address)}
              required
            />
            {fieldErrors.address && <small>{fieldErrors.address}</small>}
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" value={vehicleForm.status} onChange={handleVehicleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Vehicle Search</p>
            <h2>Find a vehicle</h2>
          </div>
        </div>

        <form className="search-grid" onSubmit={handleSearchSubmit} noValidate>
          <label className="field">
            <span>Vehicle Number</span>
            <input
              name="vehicle_number"
              value={searchForm.vehicle_number}
              onChange={handleSearchChange}
              placeholder="MH12AB1234"
              aria-invalid={Boolean(fieldErrors.vehicle_number)}
            />
            {fieldErrors.vehicle_number && <small>{fieldErrors.vehicle_number}</small>}
          </label>

          <label className="field">
            <span>Mobile Number</span>
            <input
              name="mobile_number"
              value={searchForm.mobile_number}
              onChange={handleSearchChange}
              placeholder="9876543210"
              aria-invalid={Boolean(fieldErrors.mobile_number)}
              inputMode="numeric"
            />
            {fieldErrors.mobile_number && <small>{fieldErrors.mobile_number}</small>}
          </label>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              Search
            </button>
          </div>
        </form>

        <div className="search-results">
          {visibleSearchResults.length ? (
            visibleSearchResults.map((vehicle) => (
              <article key={vehicle.id} className="result-card">
                <strong>{vehicle.vehicle_number}</strong>
                <span>{vehicle.owner_name}</span>
                <span>{formatLabel(vehicle.category, categoryLabels)}</span>
                <span>{formatCurrency(vehicle.outstanding_balance)}</span>
                <button type="button" className="button button--small" onClick={() => onOpenVehicle(vehicle.id)}>
                  View
                </button>
              </article>
            ))
          ) : (
            <p className="muted">Search results will appear here.</p>
          )}
        </div>
      </section>

      <section className="panel panel--full">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Vehicle Listing</p>
            <h2>Registered vehicles</h2>
          </div>
        </div>

        <div className="filter-row">
          <label className="field">
            <span>Search</span>
            <input
              name="search"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              onBlur={() => loadVehicles(1, filters)}
              placeholder="Vehicle number, owner, or mobile"
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="auto">Auto</option>
              <option value="e_rickshaw">E-Rickshaw</option>
              <option value="hawker">Hawker</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Owner Name</th>
                <th>Mobile Number</th>
                <th>Category</th>
                <th>Status</th>
                <th>Outstanding</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && !vehicles.length ? (
                <tr>
                  <td colSpan="7">Loading vehicles...</td>
                </tr>
              ) : vehicles.length ? (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.vehicle_number}</td>
                    <td>{vehicle.owner_name}</td>
                    <td>{vehicle.mobile_number}</td>
                    <td>{formatLabel(vehicle.category, categoryLabels)}</td>
                    <td>{formatLabel(vehicle.status, statusLabels)}</td>
                    <td>{formatCurrency(vehicle.outstanding_balance)}</td>
                    <td>
                      <button type="button" className="button button--small" onClick={() => onOpenVehicle(vehicle.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1}>
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
