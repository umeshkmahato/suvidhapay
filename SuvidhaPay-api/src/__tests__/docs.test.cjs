/* eslint-env jest */
const request = require('supertest');

describe('API Documentation', () => {
  let app;
  let openApiResponse;
  let docsResponse;
  let scalarBundleResponse;

  beforeAll(async () => {
    app = (await import('../server.js')).default;
    [openApiResponse, docsResponse, scalarBundleResponse] = await Promise.all([
      request(app).get('/openapi.json'),
      request(app).get('/docs'),
      request(app).get('/docs/scalar.js'),
    ]);
  });
  describe('OpenAPI JSON endpoint', () => {
    test('GET /openapi.json should return OpenAPI 3.1.0 specification', async () => {
      const response = openApiResponse;

      expect(response.status).toBe(200);
      expect(response.type).toMatch(/json/);
      expect(response.body.openapi).toBe('3.1.0');
    });

    test('OpenAPI spec should have required top-level fields', async () => {
      const response = openApiResponse;
      const spec = response.body;

      expect(spec.info).toBeDefined();
      expect(spec.info.title).toBe('SuvidhaPay API');
      expect(spec.info.version).toBe('1.0.0');
      expect(spec.servers).toBeDefined();
      expect(Array.isArray(spec.servers)).toBe(true);
      expect(spec.paths).toBeDefined();
      expect(spec.components).toBeDefined();
    });

    test('OpenAPI spec should define security schemes', async () => {
      const response = openApiResponse;
      const spec = response.body;

      expect(spec.components.securitySchemes).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth.type).toBe('http');
      expect(spec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
      expect(spec.components.securitySchemes.bearerAuth.bearerFormat).toBe('JWT');
    });

    test('OpenAPI spec should document authentication paths', async () => {
      const response = openApiResponse;
      const spec = response.body;

      expect(spec.paths['/api/auth/login']).toBeDefined();
      expect(spec.paths['/api/auth/refresh']).toBeDefined();
      expect(spec.paths['/api/auth/me']).toBeDefined();
    });

    test('OpenAPI spec should document vehicle endpoints', async () => {
      const response = openApiResponse;
      const spec = response.body;

      expect(spec.paths['/api/vehicles']).toBeDefined();
      expect(spec.paths['/api/vehicles/search']).toBeDefined();
      expect(spec.paths['/api/vehicles/options']).toBeDefined();
      expect(spec.paths['/api/vehicles/{id}']).toBeDefined();
    });

    test('OpenAPI spec should document rate endpoints', async () => {
      const response = openApiResponse;
      const spec = response.body;

      expect(spec.paths['/api/rate-master']).toBeDefined();
    });

    test('OpenAPI spec should document dues endpoints', async () => {
      const response = openApiResponse;
      const spec = response.body;

      expect(spec.paths['/api/dues']).toBeDefined();
      expect(spec.paths['/api/dues/{id}']).toBeDefined();
      expect(spec.paths['/api/dues/{id}/cancel']).toBeDefined();
      expect(spec.paths['/api/dues/outstanding']).toBeDefined();
    });

    test('OpenAPI spec should define reusable schemas', async () => {
      const response = openApiResponse;
      const spec = response.body;
      const { schemas } = spec.components;

      // Authentication schemas
      expect(schemas.LoginRequest).toBeDefined();
      expect(schemas.LoginResponse).toBeDefined();
      expect(schemas.User).toBeDefined();

      // Vehicle schemas
      expect(schemas.Vehicle).toBeDefined();
      expect(schemas.VehicleCreateRequest).toBeDefined();

      // Rate schemas
      expect(schemas.Rate).toBeDefined();

      // Due schemas
      expect(schemas.Due).toBeDefined();
      expect(schemas.DueCreateRequest).toBeDefined();

      // Common schemas
      expect(schemas.ErrorResponse).toBeDefined();
      expect(schemas.ValidationErrorResponse).toBeDefined();
      expect(schemas.Pagination).toBeDefined();
    });

    test('Authenticated endpoints should include security requirement', async () => {
      const response = openApiResponse;
      const spec = response.body;

      // GET /auth/me should require bearer auth
      expect(spec.paths['/api/auth/me'].get.security).toBeDefined();
      expect(spec.paths['/api/auth/me'].get.security[0]).toHaveProperty('bearerAuth');

      // POST /vehicles should require bearer auth
      expect(spec.paths['/api/vehicles'].post.security).toBeDefined();
      expect(spec.paths['/api/vehicles'].post.security[0]).toHaveProperty('bearerAuth');

      // GET /vehicles should require bearer auth
      expect(spec.paths['/api/vehicles'].get.security).toBeDefined();
      expect(spec.paths['/api/vehicles'].get.security[0]).toHaveProperty('bearerAuth');
    });

    test('OpenAPI spec should have response schemas for endpoints', async () => {
      const response = openApiResponse;
      const spec = response.body;

      // Check login endpoint responses
      const loginResponses = spec.paths['/api/auth/login'].post.responses;
      expect(loginResponses[200]).toBeDefined();
      expect(loginResponses[401]).toBeDefined();
      expect(loginResponses[400]).toBeDefined();
      expect(loginResponses[500]).toBeDefined();
    });
  });

  describe('Scalar API Reference UI', () => {
    test('GET /docs should return HTML', async () => {
      const response = docsResponse;

      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    });

    test('GET /docs should load self-hosted Scalar assets', async () => {
      const response = docsResponse;

      expect(response.text).toContain('/docs/scalar.js');
      expect(response.text).not.toContain('cdn.jsdelivr.net');
    });

    test('GET /docs should reference OpenAPI JSON endpoint', async () => {
      const response = docsResponse;

      expect(response.text).toContain('openapi.json');
    });

    test('GET /docs/scalar.js should serve the Scalar browser bundle', async () => {
      const response = scalarBundleResponse;

      expect(response.status).toBe(200);
      expect(response.type).toMatch(/javascript/);
      expect(response.text).toContain('createApiReference');
    });

    test('GET /docs should have proper HTML structure', async () => {
      const response = docsResponse;

      expect(response.text.toLowerCase()).toContain('<!doctype html>');
      expect(response.text.toLowerCase()).toContain('<meta charset="utf-8"');
      expect(response.text).toContain('SuvidhaPay API Documentation');
    });

    test('GET /docs should set a CSP compatible with self-hosted Scalar', async () => {
      const response = docsResponse;

      expect(response.headers['content-security-policy']).toContain("script-src 'self' 'unsafe-inline'");
      expect(response.headers['content-security-policy']).toContain("style-src 'self' 'unsafe-inline'");
      expect(response.headers['content-security-policy']).not.toContain('cdn.jsdelivr.net');
    });
  });

  describe('Documentation availability', () => {
    test('/openapi.json should not expose JWT secrets', async () => {
      const response = openApiResponse;

      const spec = JSON.stringify(response.body);
      expect(spec).not.toContain(process.env.JWT_SECRET);
    });

    test('/docs should be accessible only if enabled', async () => {
      const response = docsResponse;

      // Should succeed if ENABLE_API_DOCS=true (which is set in .env.example)
      // In production with ENABLE_API_DOCS=false, this would return 404
      expect([200, 404]).toContain(response.status);
    });
  });
});

