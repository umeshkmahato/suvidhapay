/* eslint-env jest */

describe('validation schemas', () => {
  test('accepts a valid login payload', async () => {
    const { authSchemas } = await import('../validators/index.js');

    const result = authSchemas.login.validate({
      email: 'admin@example.com',
      password: 'Admin@123',
    });

    expect(result.error).toBeUndefined();
  });

  test('accepts a valid vehicle payload', async () => {
    const { vehicleSchemas } = await import('../validators/index.js');

    const result = vehicleSchemas.create.validate({
      vehicle_number: 'MH12AB1234',
      owner_name: 'Ramesh Kumar',
      mobile_number: '9876543210',
      category: 'auto',
      address: 'Ward 1, Pune',
      status: 'active',
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects search requests without an identifier', async () => {
    const { vehicleSchemas } = await import('../validators/index.js');

    const result = vehicleSchemas.search.validate({});

    expect(result.error).toBeDefined();
  });

  test('rejects invalid mobile number format during vehicle registration', async () => {
    const { vehicleSchemas } = await import('../validators/index.js');

    const result = vehicleSchemas.create.validate({
      vehicle_number: 'MH12AB1234',
      owner_name: 'Ramesh Kumar',
      mobile_number: '12345',
      category: 'auto',
      address: 'Ward 1, Pune',
      status: 'active',
    });

    expect(result.error).toBeDefined();
  });

  test('accepts valid list filters with pagination', async () => {
    const { vehicleSchemas } = await import('../validators/index.js');

    const result = vehicleSchemas.list.validate({
      page: 2,
      limit: 10,
      search: 'MH12',
      category: 'auto',
      status: 'active',
    });

    expect(result.error).toBeUndefined();
  });

  test('accepts a rate master batch', async () => {
    const { rateSchemas } = await import('../validators/index.js');

    const result = rateSchemas.save.validate({
      rates: [
        { category: 'auto', amount: 50 },
        { category: 'e_rickshaw', amount: 30 },
        { category: 'hawker', amount: 20 },
      ],
    });

    expect(result.error).toBeUndefined();
  });

  test('accepts a due created without a manual amount', async () => {
    const { dueSchemas } = await import('../validators/index.js');

    const result = dueSchemas.create.validate({
      vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
      due_date: '2026-10-08',
      status: 'pending',
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects a due date that is not YYYY-MM-DD', async () => {
    const { dueSchemas } = await import('../validators/index.js');

    const result = dueSchemas.create.validate({
      vehicle_id: '550e8400-e29b-41d4-a716-446655440000',
      due_date: '08-10-2026',
    });

    expect(result.error).toBeDefined();
  });
});
