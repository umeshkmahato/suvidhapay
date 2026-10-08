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
};

export const validateRequest = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
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
