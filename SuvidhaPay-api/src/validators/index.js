import Joi from 'joi';

export const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const vehicleSchemas = {
  create: Joi.object({
    vehicle_number: Joi.string()
      .trim()
      .max(20)
      .pattern(/^[A-Za-z0-9- ]+$/)
      .required()
      .messages({
        'string.empty': 'Vehicle number is required',
        'any.required': 'Vehicle number is required',
      }),
    owner_name: Joi.string()
      .trim()
      .min(2)
      .max(150)
      .required(),
    mobile_number: Joi.string()
      .trim()
      .pattern(/^[6-9][0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Mobile number must be a valid 10 digit Indian number',
      }),
    category: Joi.string().valid('auto', 'e_rickshaw', 'hawker').required(),
    address: Joi.string()
      .trim()
      .min(5)
      .max(500)
      .required(),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }),

  search: Joi.object({
    vehicle_number: Joi.string().trim().max(20).pattern(/^[A-Za-z0-9- ]+$/),
    mobile_number: Joi.string().trim().pattern(/^[6-9][0-9]{9}$/),
  }).or('vehicle_number', 'mobile_number'),

  list: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
    search: Joi.string()
      .trim()
      .allow(''),
    category: Joi.string().valid('auto', 'e_rickshaw', 'hawker'),
    status: Joi.string().valid('active', 'inactive'),
  }),

  detail: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
  }),
};

const dateString = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);

export const validateRequest = (schema, source = 'body') => (req, res, next) => {
  const payload = req[source] ?? {};
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.validatedData = value;
  return next();
};

export const validateUuidParam = (paramName) => (req, res, next) => {
  const { error } = Joi.string().uuid().required().validate(req.params[paramName]);

  if (error) {
    return res.status(400).json({ error: 'Invalid identifier' });
  }

  return next();
};

const rateItemSchema = Joi.object({
  category: Joi.string().valid('auto', 'e_rickshaw', 'hawker').required(),
  amount: Joi.number().positive().precision(2).required(),
  notes: Joi.string().trim().max(500).allow('', null),
});

export const rateSchemas = {
  save: Joi.alternatives().try(
    rateItemSchema,
    Joi.object({
      rates: Joi.array().items(rateItemSchema).min(1).max(3)
        .required(),
    }),
  ),
};

export const dueSchemas = {
  create: Joi.object({
    vehicle_id: Joi.string().uuid().required(),
    due_date: dateString.required(),
    status: Joi.string().valid('pending', 'partial', 'paid').default('pending'),
    paid_amount: Joi.number().min(0).precision(2),
    notes: Joi.string().trim().max(500).allow('', null),
  }),

  update: Joi.object({
    vehicle_id: Joi.string().uuid(),
    due_date: dateString,
    amount: Joi.number().positive().precision(2),
    status: Joi.string().valid('pending', 'partial', 'paid'),
    paid_amount: Joi.number().min(0).precision(2),
    notes: Joi.string().trim().max(500).allow('', null),
  }).min(1),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(10),
    vehicle_id: Joi.string().uuid(),
    status: Joi.string().valid('pending', 'partial', 'paid', 'cancelled'),
    from_date: dateString,
    to_date: dateString,
  }),

  cancel: Joi.object({
    cancellation_reason: Joi.string().trim().max(500).allow('', null),
  }),

  outstanding: Joi.object({
    vehicle_id: Joi.string().uuid(),
  }),
};

export const collectionSchemas = {
  searchVehicles: Joi.object({
    vehicle_number: Joi.string().trim().max(20).pattern(/^[A-Za-z0-9- ]+$/),
    mobile_number: Joi.string().trim().pattern(/^[6-9][0-9]{9}$/),
  }).or('vehicle_number', 'mobile_number'),

  recordPayment: Joi.object({
    vehicle_id: Joi.string().uuid().required(),
    amount: Joi.number().positive().precision(2).required()
      .messages({
        'number.positive': 'Amount must be greater than 0',
      }),
    payment_mode: Joi.string().valid('cash', 'upi').required(),
    remarks: Joi.string().trim().max(500).allow('', null),
  }),

  paymentHistory: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
    vehicle_id: Joi.string().uuid(),
    agent_id: Joi.string().uuid(),
    from_date: dateString,
    to_date: dateString,
  }),

  receiptHistory: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
    vehicle_id: Joi.string().uuid(),
    agent_id: Joi.string().uuid(),
    from_date: dateString,
    to_date: dateString,
  }),
};

export const adminSchemas = {
  dashboardMetrics: Joi.object({
    from_date: dateString,
    to_date: dateString,
  }),

  collectionReport: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
    from_date: dateString,
    to_date: dateString,
    category: Joi.string().valid('auto', 'e_rickshaw', 'hawker'),
    agent_id: Joi.string().uuid(),
  }),

  vehicleCategoryReport: Joi.object({
    from_date: dateString,
    to_date: dateString,
  }),

  agentCollectionReport: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
    from_date: dateString,
    to_date: dateString,
  }),

  chartData: Joi.object({
    days: Joi.number().integer().min(1).max(365)
      .default(30),
    months: Joi.number().integer().min(1).max(60)
      .default(12),
  }),

  exportData: Joi.object({
    from_date: dateString,
    to_date: dateString,
    category: Joi.string().valid('auto', 'e_rickshaw', 'hawker'),
    agent_id: Joi.string().uuid(),
    format: Joi.string().valid('csv', 'excel').default('csv'),
  }),
};
