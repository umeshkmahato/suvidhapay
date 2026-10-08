import config from '../config/index.js';

/**
 * OpenAPI 3.1.0 Specification for SuvidhaPay API
 * This document describes all available API endpoints, schemas, and authentication methods
 */
const getOpenAPISpec = () => {
  const { baseUrl } = config.docs;
  const apiPrefix = '/api';

  return {
    openapi: '3.1.0',
    info: {
      title: 'SuvidhaPay API',
      description: 'Municipal Collection Management System - Backend API for vehicle registration, dues management, and rate configuration',
      version: '1.0.0',
      contact: {
        name: 'SuvidhaPay Team',
        email: 'support@suvidhapay.local',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'Current Environment',
      },
      {
        url: 'http://localhost:3001',
        description: 'Local Development',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Vehicles',
        description: 'Vehicle registration and management',
      },
      {
        name: 'Rates',
        description: 'Rate master configuration',
      },
      {
        name: 'Dues',
        description: 'Due management and collection',
      },
      {
        name: 'Admin Dashboard',
        description: 'Admin dashboard analytics, reports, and metrics',
      },
    ],
    paths: {
      [`${apiPrefix}/auth/login`]: {
        post: {
          tags: ['Authentication'],
          summary: 'User Login',
          description: 'Authenticate user and receive access and refresh tokens',
          operationId: 'loginUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest',
                },
                example: {
                  email: 'admin@municipal.com',
                  password: 'Admin@123',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse',
                  },
                },
              },
            },
            400: {
              description: 'Invalid request format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Invalid email or password',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/auth/refresh`]: {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh Access Token',
          description: 'Use refresh token to get a new access token',
          operationId: 'refreshToken',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RefreshTokenRequest',
                },
                example: {
                  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TokenResponse',
                  },
                },
              },
            },
            401: {
              description: 'Invalid or expired refresh token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/auth/me`]: {
        get: {
          tags: ['Authentication'],
          summary: 'Get Current User Profile',
          description: 'Retrieve the profile information of the authenticated user',
          operationId: 'getCurrentUser',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Access token required or invalid',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
       [`${apiPrefix}/vehicles`]: {
         post: {
           tags: ['Vehicles'],
           summary: 'Register New Vehicle',
           description: 'Register a new vehicle in the system. Requires admin, collector, or officer role.',
           operationId: 'createVehicle',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VehicleCreateRequest',
                },
                example: {
                  vehicle_number: 'MH12AB1234',
                  owner_name: 'Ramesh Kumar',
                  mobile_number: '9876543210',
                  category: 'auto',
                  address: 'Ward 1, Pune',
                  status: 'active',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Vehicle registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Vehicle registered successfully' },
                      vehicle: { $ref: '#/components/schemas/Vehicle' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid request format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            403: {
              description: 'Insufficient permissions',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            409: {
              description: 'Vehicle number already exists',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ['Vehicles'],
          summary: 'List Vehicles',
          description: 'Retrieve a paginated list of all vehicles with optional filters',
          operationId: 'listVehicles',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number (1-based)',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Number of items per page (1-100)',
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
              },
            },
            {
              name: 'search',
              in: 'query',
              description: 'Search by vehicle number or owner name',
              schema: { type: 'string' },
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by vehicle category',
              schema: { type: 'string', enum: ['auto', 'e_rickshaw', 'hawker'] },
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by vehicle status',
              schema: { type: 'string', enum: ['active', 'inactive'] },
            },
          ],
          responses: {
            200: {
              description: 'List of vehicles retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      vehicles: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Vehicle' },
                      },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/vehicles/search`]: {
        get: {
          tags: ['Vehicles'],
          summary: 'Search Vehicles',
          description: 'Search for vehicles by vehicle number or mobile number',
          operationId: 'searchVehicles',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'vehicle_number',
              in: 'query',
              description: 'Vehicle registration number to search',
              schema: { type: 'string', maxLength: 20 },
            },
            {
              name: 'mobile_number',
              in: 'query',
              description: 'Owner mobile number to search',
              schema: { type: 'string', pattern: '^[6-9][0-9]{9}$' },
            },
          ],
          responses: {
            200: {
              description: 'Search results retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      vehicles: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Vehicle' },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid search parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/vehicles/options`]: {
        get: {
          tags: ['Vehicles'],
          summary: 'Get Vehicle Options',
          description: 'Retrieve a simplified list of vehicles (id and number only)',
          operationId: 'getVehicleOptions',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Vehicle options retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      vehicles: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            vehicle_number: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/vehicles/{id}`]: {
        get: {
          tags: ['Vehicles'],
          summary: 'Get Vehicle Details',
          description: 'Retrieve detailed information about a specific vehicle',
          operationId: 'getVehicleById',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Vehicle ID (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for related dues',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Items per page for related dues',
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 20,
              },
            },
          ],
          responses: {
            200: {
              description: 'Vehicle details retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/VehicleDetail',
                  },
                },
              },
            },
            400: {
              description: 'Invalid vehicle ID',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/rate-master`]: {
        get: {
          tags: ['Rates'],
          summary: 'Get Rate Master',
          description: 'Retrieve all current rates for different vehicle categories',
          operationId: 'getRateMaster',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Rates retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      rates: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Rate',
                        },
                      },
                      history: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Rate',
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ['Rates'],
          summary: 'Update Rate Master',
          description: 'Update rates for one or more vehicle categories. Requires admin role.',
          operationId: 'updateRateMaster',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      $ref: '#/components/schemas/SingleRateRequest',
                    },
                    {
                      $ref: '#/components/schemas/MultipleRatesRequest',
                    },
                  ],
                },
                examples: {
                  singleRate: {
                    value: {
                      category: 'auto',
                      amount: 100.5,
                      notes: 'Updated rate for autos',
                    },
                  },
                  multipleRates: {
                    value: {
                      rates: [
                        {
                          category: 'auto',
                          amount: 100.5,
                          notes: 'Updated rate for autos',
                        },
                        {
                          category: 'e_rickshaw',
                          amount: 50,
                          notes: 'Updated rate for e-rickshaws',
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Rates updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Rates saved successfully' },
                      rates: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Rate' },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid request format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            403: {
              description: 'Insufficient permissions',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/dues`]: {
        post: {
          tags: ['Dues'],
          summary: 'Create New Due',
          description: 'Create a new due for a vehicle. Requires admin role.',
          operationId: 'createDue',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DueCreateRequest',
                },
                example: {
                  vehicle_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                  due_date: '2024-12-31',
                  status: 'pending',
                  paid_amount: 0,
                  notes: 'Annual dues',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Due created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Due created successfully' },
                      due: { $ref: '#/components/schemas/Due' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid request format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            403: {
              description: 'Insufficient permissions',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ['Dues'],
          summary: 'List Dues',
          description: 'Retrieve a paginated list of dues with optional filters',
          operationId: 'listDues',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
              },
            },
            {
              name: 'vehicle_id',
              in: 'query',
              description: 'Filter by vehicle ID',
              schema: { type: 'string', format: 'uuid' },
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by status',
              schema: { type: 'string', enum: ['pending', 'partial', 'paid', 'cancelled'] },
            },
            {
              name: 'from_date',
              in: 'query',
              description: 'Filter from date (YYYY-MM-DD)',
              schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            },
            {
              name: 'to_date',
              in: 'query',
              description: 'Filter to date (YYYY-MM-DD)',
              schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            },
          ],
          responses: {
            200: {
              description: 'Dues retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      dues: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Due' },
                      },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      totalPages: { type: 'integer' },
                      outstanding: { $ref: '#/components/schemas/OutstandingSummary' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/dues/{id}`]: {
        get: {
          tags: ['Dues'],
          summary: 'Get Due Details',
          description: 'Retrieve detailed information about a specific due',
          operationId: 'getDueById',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Due ID (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Due details retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      due: { $ref: '#/components/schemas/Due' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid due ID',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ['Dues'],
          summary: 'Update Due',
          description: 'Update an existing due. Requires admin role.',
          operationId: 'updateDue',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Due ID (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DueUpdateRequest',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Due updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Due updated successfully' },
                      due: { $ref: '#/components/schemas/Due' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid request format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            403: {
              description: 'Insufficient permissions',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/dues/{id}/cancel`]: {
        post: {
          tags: ['Dues'],
          summary: 'Cancel Due',
          description: 'Cancel an existing due. Requires admin role.',
          operationId: 'cancelDue',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Due ID (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CancelDueRequest',
                },
                example: {
                  cancellation_reason: 'Duplicate entry',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Due cancelled successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Due cancelled successfully' },
                      due: { $ref: '#/components/schemas/Due' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid request format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            403: {
              description: 'Insufficient permissions',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      [`${apiPrefix}/dues/outstanding`]: {
        get: {
          tags: ['Dues'],
          summary: 'Get Outstanding Dues',
          description: 'Retrieve all outstanding dues for a specific vehicle',
          operationId: 'getOutstandingDues',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'vehicle_id',
              in: 'query',
              required: true,
              description: 'Vehicle ID (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Outstanding dues retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      summary: {
                        $ref: '#/components/schemas/OutstandingSummary',
                      },
                      vehicles: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DueOutstandingVehicle' },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        [`${apiPrefix}/admin/dashboard/metrics`]: {
          get: {
            tags: ['Admin Dashboard'],
            summary: 'Get Dashboard Metrics',
            description: 'Get key performance indicators for the admin dashboard',
            operationId: 'getDashboardMetrics',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'from_date',
                in: 'query',
                required: false,
                schema: {
                  type: 'string',
                  format: 'date',
                  example: '2024-01-01',
                },
              },
              {
                name: 'to_date',
                in: 'query',
                required: false,
                schema: {
                  type: 'string',
                  format: 'date',
                  example: '2024-12-31',
                },
              },
            ],
            responses: {
              200: {
                description: 'Dashboard metrics retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        todaysCollection: {
                          type: 'object',
                          properties: {
                            amount: { type: 'number' },
                            paymentCount: { type: 'integer' },
                            vehicleCount: { type: 'integer' },
                          },
                        },
                        monthlyCollection: {
                          type: 'object',
                          properties: {
                            amount: { type: 'number' },
                            paymentCount: { type: 'integer' },
                          },
                        },
                        totalOutstanding: {
                          type: 'object',
                          properties: {
                            amount: { type: 'number' },
                            dueCount: { type: 'integer' },
                          },
                        },
                        registeredVehicles: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer' },
                            byCategory: { type: 'array' },
                          },
                        },
                        activeAgents: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              401: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
              403: {
                description: 'Forbidden - Admin role required',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        [`${apiPrefix}/admin/reports/collection`]: {
          get: {
            tags: ['Admin Dashboard'],
            summary: 'Get Collection Report',
            description: 'Get detailed collection report with filters',
            operationId: 'getCollectionReport',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1, minimum: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer', default: 20, minimum: 1, maximum: 100,
                },
              },
              {
                name: 'from_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
              {
                name: 'to_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
              {
                name: 'category',
                in: 'query',
                schema: { type: 'string', enum: ['auto', 'e_rickshaw', 'hawker'] },
              },
              {
                name: 'agent_id',
                in: 'query',
                schema: { type: 'string', format: 'uuid' },
              },
            ],
            responses: {
              200: {
                description: 'Collection report retrieved successfully',
              },
              401: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
              403: {
                description: 'Forbidden - Admin role required',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        [`${apiPrefix}/admin/reports/vehicle-category`]: {
          get: {
            tags: ['Admin Dashboard'],
            summary: 'Get Vehicle Category Report',
            description: 'Get collection report grouped by vehicle category',
            operationId: 'getVehicleCategoryReport',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'from_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
              {
                name: 'to_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
            ],
            responses: {
              200: {
                description: 'Vehicle category report retrieved successfully',
              },
              401: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        [`${apiPrefix}/admin/reports/agent-collection`]: {
          get: {
            tags: ['Admin Dashboard'],
            summary: 'Get Agent Collection Report',
            description: 'Get collection report grouped by agent',
            operationId: 'getAgentCollectionReport',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1, minimum: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer', default: 20, minimum: 1, maximum: 100,
                },
              },
              {
                name: 'from_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
              {
                name: 'to_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
            ],
            responses: {
              200: {
                description: 'Agent collection report retrieved successfully',
              },
              401: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        [`${apiPrefix}/admin/charts/daily-collection`]: {
          get: {
            tags: ['Admin Dashboard'],
            summary: 'Get Daily Collection Chart Data',
            description: 'Get daily collection data for chart visualization',
            operationId: 'getDailyCollectionChart',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'days',
                in: 'query',
                schema: {
                  type: 'integer', default: 30, minimum: 1, maximum: 365,
                },
              },
            ],
            responses: {
              200: {
                description: 'Daily collection chart data retrieved successfully',
              },
              401: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        [`${apiPrefix}/admin/charts/monthly-collection`]: {
          get: {
            tags: ['Admin Dashboard'],
            summary: 'Get Monthly Collection Chart Data',
            description: 'Get monthly collection data for chart visualization',
            operationId: 'getMonthlyCollectionChart',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'months',
                in: 'query',
                schema: {
                  type: 'integer', default: 12, minimum: 1, maximum: 60,
                },
              },
            ],
            responses: {
              200: {
                description: 'Monthly collection chart data retrieved successfully',
              },
              401: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        [`${apiPrefix}/admin/export/collection`]: {
          get: {
            tags: ['Admin Dashboard'],
            summary: 'Export Collection Data',
            description: 'Export collection data as CSV or Excel file',
            operationId: 'exportCollectionData',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'format',
                in: 'query',
                schema: { type: 'string', enum: ['csv', 'excel'], default: 'csv' },
              },
              {
                name: 'from_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
              {
                name: 'to_date',
                in: 'query',
                schema: { type: 'string', format: 'date' },
              },
              {
                name: 'category',
                in: 'query',
                schema: { type: 'string', enum: ['auto', 'e_rickshaw', 'hawker'] },
              },
              {
                name: 'agent_id',
                in: 'query',
                schema: { type: 'string', format: 'uuid' },
              },
            ],
            responses: {
              200: {
                description: 'Collection data exported successfully',
                content: {
                  'text/csv': {
                    schema: { type: 'string' },
                  },
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
              401: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token authentication. Obtain tokens via POST /api/auth/login',
        },
      },
      schemas: {
        // Authentication Schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT access token',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
            },
            user: {
              $ref: '#/components/schemas/LoginUser',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Previously issued refresh token',
            },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'New JWT access token',
            },
            refreshToken: {
              type: 'string',
              description: 'New JWT refresh token',
            },
          },
        },
        LoginUser: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            fullName: {
              type: 'string',
              description: 'User full name',
            },
            mobileNumber: {
              type: 'string',
              description: 'User mobile number',
            },
            role: {
              type: 'string',
              enum: ['admin', 'collector', 'officer', 'vendor'],
              description: 'User role',
            },
           },
         },
         User: {
           type: 'object',
           properties: {
             id: {
               type: 'string',
               format: 'uuid',
               description: 'Unique user identifier',
             },
             email: {
               type: 'string',
               format: 'email',
               description: 'User email address',
             },
            full_name: {
              type: 'string',
              description: 'User full name',
            },
            mobile_number: {
              type: 'string',
              description: 'User mobile number',
            },
             role: {
               type: 'string',
               enum: ['admin', 'collector', 'officer', 'vendor'],
               description: 'User role',
             },
             is_active: {
               type: 'boolean',
               description: 'Whether the user account is active',
             },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },

        // Vehicle Schemas
        VehicleCreateRequest: {
          type: 'object',
          required: ['vehicle_number', 'owner_name', 'mobile_number', 'category', 'address'],
          properties: {
            vehicle_number: {
              type: 'string',
              maxLength: 20,
              pattern: '^[A-Za-z0-9- ]+$',
              description: 'Vehicle registration number',
            },
            owner_name: {
              type: 'string',
              minLength: 2,
              maxLength: 150,
              description: 'Owner full name',
            },
            mobile_number: {
              type: 'string',
              pattern: '^[6-9][0-9]{9}$',
              description: 'Owner mobile number (10 digits)',
            },
            category: {
              type: 'string',
              enum: ['auto', 'e_rickshaw', 'hawker'],
              description: 'Vehicle category',
            },
            address: {
              type: 'string',
              minLength: 5,
              maxLength: 500,
              description: 'Vehicle owner address',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              default: 'active',
              description: 'Vehicle status',
            },
          },
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique vehicle identifier',
            },
            vehicle_number: {
              type: 'string',
              description: 'Vehicle registration number',
            },
            owner_name: {
              type: 'string',
              description: 'Owner full name',
            },
            mobile_number: {
              type: 'string',
              description: 'Owner mobile number',
            },
            category: {
              type: 'string',
              enum: ['auto', 'e_rickshaw', 'hawker'],
              description: 'Vehicle category',
            },
            address: {
              type: 'string',
              description: 'Vehicle owner address',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Vehicle status',
            },
            total_due: {
              type: 'number',
              format: 'double',
              description: 'Total amount due for the vehicle',
            },
            total_paid: {
              type: 'number',
              format: 'double',
              description: 'Total amount paid for the vehicle',
            },
            outstanding_balance: {
              type: 'number',
              format: 'double',
              description: 'Outstanding balance for the vehicle',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        VehicleDetail: {
          type: 'object',
          properties: {
            vehicle: {
              $ref: '#/components/schemas/Vehicle',
            },
            rate: {
              $ref: '#/components/schemas/Rate',
            },
            outstanding: {
              $ref: '#/components/schemas/OutstandingSummary',
            },
            dues: {
              type: 'array',
              items: { $ref: '#/components/schemas/Due' },
            },
            page: {
              type: 'integer',
            },
            limit: {
              type: 'integer',
            },
            total: {
              type: 'integer',
            },
            totalPages: {
              type: 'integer',
            },
          },
        },

        // Rate Schemas
        Rate: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            category: {
              type: 'string',
              enum: ['auto', 'e_rickshaw', 'hawker'],
              description: 'Vehicle category',
            },
            amount: {
              type: 'number',
              format: 'double',
              description: 'Annual rate amount',
            },
            effective_from: {
              type: 'string',
              format: 'date',
            },
            effective_to: {
              type: 'string',
              nullable: true,
              format: 'date',
            },
            is_active: {
              type: 'boolean',
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Notes about the rate',
            },
            created_by: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            updated_by: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        SingleRateRequest: {
          type: 'object',
          required: ['category', 'amount'],
          properties: {
            category: {
              type: 'string',
              enum: ['auto', 'e_rickshaw', 'hawker'],
              description: 'Vehicle category',
            },
            amount: {
              type: 'number',
              format: 'double',
              minimum: 0,
              description: 'Annual rate amount',
            },
            notes: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              description: 'Notes about the rate',
            },
          },
        },
        MultipleRatesRequest: {
          type: 'object',
          required: ['rates'],
          properties: {
            rates: {
              type: 'array',
              minItems: 1,
              maxItems: 3,
              items: {
                $ref: '#/components/schemas/SingleRateRequest',
              },
            },
          },
        },

        // Due Schemas
        DueCreateRequest: {
          type: 'object',
          required: ['vehicle_id', 'due_date'],
          properties: {
            vehicle_id: {
              type: 'string',
              format: 'uuid',
              description: 'Vehicle ID',
            },
            due_date: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Due date (YYYY-MM-DD)',
            },
            status: {
              type: 'string',
              enum: ['pending', 'partial', 'paid'],
              default: 'pending',
              description: 'Initial due status',
            },
            paid_amount: {
              type: 'number',
              format: 'double',
              minimum: 0,
              default: 0,
              description: 'Amount already paid',
            },
            notes: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              description: 'Notes about the due',
            },
          },
        },
        DueUpdateRequest: {
          type: 'object',
          properties: {
            vehicle_id: {
              type: 'string',
              format: 'uuid',
              description: 'Vehicle ID',
            },
            due_date: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Due date (YYYY-MM-DD)',
            },
            amount: {
              type: 'number',
              format: 'double',
              minimum: 0,
              description: 'Total amount',
            },
            status: {
              type: 'string',
              enum: ['pending', 'partial', 'paid'],
              description: 'Due status',
            },
            paid_amount: {
              type: 'number',
              format: 'double',
              minimum: 0,
              description: 'Amount paid',
            },
            notes: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              description: 'Notes about the due',
            },
          },
        },
        CancelDueRequest: {
          type: 'object',
          properties: {
            cancellation_reason: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              description: 'Reason for cancellation',
            },
          },
        },
        Due: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique due identifier',
            },
            vehicle_id: {
              type: 'string',
              format: 'uuid',
              description: 'Vehicle ID',
            },
            rate_master_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            amount: {
              type: 'number',
              format: 'double',
              description: 'Total amount due',
            },
            due_date: {
              type: 'string',
              format: 'date',
              description: 'Due date',
            },
            status: {
              type: 'string',
              enum: ['pending', 'partial', 'paid', 'cancelled'],
              description: 'Due status',
            },
            paid_amount: {
              type: 'number',
              format: 'double',
              description: 'Amount already paid',
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Notes about the due',
            },
            cancellation_reason: {
              type: 'string',
              nullable: true,
            },
            cancelled_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            cancelled_by: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            vehicle_number: {
              type: 'string',
            },
            owner_name: {
              type: 'string',
            },
            category: {
              type: 'string',
              enum: ['auto', 'e_rickshaw', 'hawker'],
            },
            mobile_number: {
              type: 'string',
            },
            applied_rate: {
              type: 'number',
              format: 'double',
              nullable: true,
            },
            outstanding_amount: {
              type: 'number',
              format: 'double',
            },
            created_by: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            updated_by: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },

        // Common Schemas
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
            },
          },
        },
        OutstandingSummary: {
          type: 'object',
          properties: {
            total_due: {
              type: 'number',
              format: 'double',
            },
            total_paid: {
              type: 'number',
              format: 'double',
            },
            outstanding_balance: {
              type: 'number',
              format: 'double',
            },
          },
        },
        DueOutstandingVehicle: {
          type: 'object',
          properties: {
            vehicle_id: {
              type: 'string',
              format: 'uuid',
            },
            vehicle_number: {
              type: 'string',
            },
            owner_name: {
              type: 'string',
            },
            category: {
              type: 'string',
              enum: ['auto', 'e_rickshaw', 'hawker'],
            },
            vehicle_status: {
              type: 'string',
              enum: ['active', 'inactive'],
            },
            total_due: {
              type: 'number',
              format: 'double',
            },
            total_paid: {
              type: 'number',
              format: 'double',
            },
            outstanding_balance: {
              type: 'number',
              format: 'double',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name',
                  },
                  message: {
                    type: 'string',
                    description: 'Validation error message',
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

export default getOpenAPISpec;
