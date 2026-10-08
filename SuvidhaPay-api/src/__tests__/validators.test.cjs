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
});
