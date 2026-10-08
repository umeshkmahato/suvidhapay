export const categoryLabels = {
  auto: 'Auto',
  e_rickshaw: 'E-Rickshaw',
  hawker: 'Hawker',
};

export const dueStatusLabels = {
  pending: 'Pending',
  partial: 'Partial',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export const vehicleStatusLabels = {
  active: 'Active',
  inactive: 'Inactive',
};

export const formatLabel = (value, mapping) => mapping[value] || value || '-';

export const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
};

export const todayInputDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

