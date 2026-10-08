import React, { useState } from 'react';
import { useAuthStore } from '../contexts/store';
import { hasErrors, validateLogin } from '../utils/validation';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(formData);
    setFieldErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    try {
      await login(formData.email.trim(), formData.password);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const nextApiErrors = {};
        apiErrors.forEach((item) => {
          nextApiErrors[item.field] = item.message;
        });
        setFieldErrors(nextApiErrors);
      }
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-card__header">
          <h1>Municipal Collection Management</h1>
          <p>Admin and agent access for Phase 1 vehicle records.</p>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@municipal.com"
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.email)}
            required
          />
          {fieldErrors.email && <small>{fieldErrors.email}</small>}
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Admin@123"
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.password)}
            required
            minLength={8}
          />
          {fieldErrors.password && <small>{fieldErrors.password}</small>}
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Login'}
        </button>

        <div className="auth-card__hint">
          <p>Seeded users:</p>
          <p>admin@municipal.com / Admin@123</p>
          <p>agent@municipal.com / Admin@123</p>
        </div>
      </form>
    </div>
  );
}
