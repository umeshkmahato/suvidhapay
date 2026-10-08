/* eslint-env jest */

describe('due calculations', () => {
  test('calculates outstanding and ignores cancelled dues', async () => {
    const { calculateOutstanding } = await import('../utils/dues.js');

    const result = calculateOutstanding([
      { amount: 50, paid_amount: 0, status: 'pending' },
      { amount: 50, paid_amount: 50, status: 'paid' },
      { amount: 30, paid_amount: 10, status: 'partial' },
      { amount: 20, paid_amount: 0, status: 'cancelled' },
    ]);

    expect(result).toEqual({
      total_due: 130,
      total_paid: 60,
      outstanding_balance: 70,
    });
  });

  test('marks a full payment as paid', async () => {
    const { resolveDueAmounts } = await import('../utils/dues.js');

    expect(resolveDueAmounts({ amount: 50, status: 'paid' })).toEqual({
      amount: 50,
      paid_amount: 50,
      status: 'paid',
    });
  });

  test('rejects a partial payment that is not between zero and the due', async () => {
    const { resolveDueAmounts } = await import('../utils/dues.js');

    expect(() => resolveDueAmounts({
      amount: 50,
      paidAmount: 50,
      status: 'partial',
    })).toThrow('Partial dues require a paid amount greater than 0 and less than the due amount');
  });
});

