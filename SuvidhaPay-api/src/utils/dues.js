export const roundMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new Error('Amount must be a valid number');
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const toMoney = (value) => roundMoney(value || 0);

export const resolveDueAmounts = ({ amount, paidAmount, status }) => {
  const normalizedAmount = roundMoney(amount);

  if (normalizedAmount <= 0) {
    throw new Error('Due amount must be greater than 0');
  }

  if (status === 'cancelled') {
    throw new Error('Use cancel to void a due');
  }

  const hasPaidAmount = paidAmount !== undefined && paidAmount !== null && paidAmount !== '';
  const normalizedPaid = hasPaidAmount ? roundMoney(paidAmount) : null;

  if (status === 'paid') {
    return {
      amount: normalizedAmount,
      paid_amount: normalizedAmount,
      status: 'paid',
    };
  }

  if (status === 'pending') {
    return {
      amount: normalizedAmount,
      paid_amount: 0,
      status: 'pending',
    };
  }

  if (status === 'partial') {
    if (normalizedPaid === null) {
      throw new Error('Paid amount is required for a partial due');
    }

    if (normalizedPaid <= 0 || normalizedPaid >= normalizedAmount) {
      throw new Error('Partial dues require a paid amount greater than 0 and less than the due amount');
    }

    return {
      amount: normalizedAmount,
      paid_amount: normalizedPaid,
      status: 'partial',
    };
  }

  if (status) {
    throw new Error('Invalid due status');
  }

  if (normalizedPaid === null || normalizedPaid <= 0) {
    return {
      amount: normalizedAmount,
      paid_amount: 0,
      status: 'pending',
    };
  }

  if (normalizedPaid >= normalizedAmount) {
    return {
      amount: normalizedAmount,
      paid_amount: normalizedAmount,
      status: 'paid',
    };
  }

  return {
    amount: normalizedAmount,
    paid_amount: normalizedPaid,
    status: 'partial',
  };
};

export const calculateOutstanding = (dues = []) => {
  const activeDues = dues.filter((due) => due.status !== 'cancelled');
  const totalDue = roundMoney(activeDues.reduce((sum, due) => sum + Number(due.amount || 0), 0));
  const totalPaid = roundMoney(
    activeDues.reduce((sum, due) => sum + Number(due.paid_amount || 0), 0),
  );

  return {
    total_due: totalDue,
    total_paid: totalPaid,
    outstanding_balance: roundMoney(totalDue - totalPaid),
  };
};
