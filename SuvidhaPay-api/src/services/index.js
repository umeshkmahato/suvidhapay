import bcrypt from 'bcrypt';
import {
  dueModel,
  rateModel,
  userModel,
  vehicleModel,
} from '../models/index.js';
import { generateTokens, refreshAccessToken } from '../utils/jwt.js';
import { resolveDueAmounts } from '../utils/dues.js';

export const authService = {
  async login(email, password) {
    const user = await userModel.findByEmail(email);

    if (!user || !user.is_active) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    await userModel.updateLastLogin(user.id);

    const tokens = generateTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobileNumber: user.mobile_number,
        role: user.role,
      },
      ...tokens,
    };
  },

  async refreshToken(refreshToken) {
    return refreshAccessToken(refreshToken);
  },

  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },
};

const normalizeVehicleNumber = (value) => value.trim().toUpperCase().replace(/\s+/g, '');
const normalizeMobileNumber = (value) => value.replace(/\s+/g, '');

export const vehicleService = {
  async create(vehicleData, userId) {
    const vehicleNumber = normalizeVehicleNumber(vehicleData.vehicle_number);
    const existingVehicle = await vehicleModel.findByVehicleNumber(vehicleNumber);

    if (existingVehicle) {
      throw new Error('Vehicle number already exists');
    }

    return vehicleModel.create({
      ...vehicleData,
      vehicle_number: vehicleNumber,
      mobile_number: normalizeMobileNumber(vehicleData.mobile_number),
      created_by: userId,
    });
  },

  async search(searchData) {
    return vehicleModel.searchByIdentifiers({
      vehicleNumber: searchData.vehicle_number
        ? normalizeVehicleNumber(searchData.vehicle_number)
        : null,
      mobileNumber: searchData.mobile_number
        ? normalizeMobileNumber(searchData.mobile_number)
        : null,
    });
  },

  async list(listParams) {
    return vehicleModel.list(listParams);
  },

  async listOptions() {
    return vehicleModel.listOptions();
  },

  async getDetail(id, { page = 1, limit = 20 } = {}) {
    const vehicle = await vehicleModel.findById(id);

    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    const [rate, outstanding, duePage] = await Promise.all([
      rateModel.findActiveByCategory(vehicle.category),
      dueModel.summarize({ vehicleId: id }),
      dueModel.listByVehicle(id, { page, limit }),
    ]);

    return {
      vehicle,
      rate,
      outstanding,
      ...duePage,
    };
  },
};

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isUniqueViolation = (error) => error && error.code === '23505';

export const rateService = {
  async list() {
    return rateModel.list();
  },

  async save(payload, userId) {
    if (!userId) {
      throw httpError('Authenticated user is required to update rates', 401);
    }

    const actor = await userModel.findById(userId);
    if (!actor) {
      throw httpError('Authenticated user not found', 404);
    }

    const items = payload.rates || [payload];
    const categories = new Set();

    items.forEach((item) => {
      if (categories.has(item.category)) {
        throw httpError('Each category can only be configured once per save', 400);
      }
      categories.add(item.category);
    });

    const rates = await rateModel.saveActiveRates(items, userId);
    return { rates };
  },
};

export const dueService = {
  async create(dueData, userId) {
    const vehicle = await vehicleModel.findById(dueData.vehicle_id);

    if (!vehicle) {
      throw httpError('Vehicle not found', 404);
    }

    if (vehicle.status !== 'active') {
      throw httpError('Dues can only be created for active vehicles', 400);
    }

    const rate = await rateModel.findActiveByCategory(vehicle.category);

    if (!rate) {
      throw httpError(`No active rate configured for ${vehicle.category}`, 400);
    }

    const amounts = resolveDueAmounts({
      amount: rate.amount,
      paidAmount: dueData.paid_amount,
      status: dueData.status || 'pending',
    });

    try {
      return await dueModel.create({
        vehicle_id: vehicle.id,
        rate_master_id: rate.id,
        due_date: dueData.due_date,
        amount: amounts.amount,
        paid_amount: amounts.paid_amount,
        status: amounts.status,
        notes: dueData.notes || null,
        created_by: userId,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw httpError('A due already exists for this vehicle and date', 409);
      }
      throw error;
    }
  },

  async list(listParams) {
    const [page, outstanding] = await Promise.all([
      dueModel.list({
        page: listParams.page,
        limit: listParams.limit,
        vehicleId: listParams.vehicle_id || null,
        status: listParams.status || null,
        fromDate: listParams.from_date || null,
        toDate: listParams.to_date || null,
      }),
      dueModel.summarize({
        vehicleId: listParams.vehicle_id || null,
        fromDate: listParams.from_date || null,
        toDate: listParams.to_date || null,
      }),
    ]);

    return {
      ...page,
      outstanding,
    };
  },

  async getById(id) {
    const due = await dueModel.findById(id);

    if (!due) {
      throw httpError('Due not found', 404);
    }

    return due;
  },

  async update(id, dueData, userId) {
    const existing = await dueModel.findById(id);

    if (!existing) {
      throw httpError('Due not found', 404);
    }

    if (existing.status === 'cancelled') {
      throw httpError('Cancelled dues cannot be edited', 400);
    }

    const vehicleId = dueData.vehicle_id || existing.vehicle_id;
    const vehicle = await vehicleModel.findById(vehicleId);

    if (!vehicle) {
      throw httpError('Vehicle not found', 404);
    }

    let amounts;
    try {
      amounts = resolveDueAmounts({
        amount: dueData.amount === undefined ? existing.amount : dueData.amount,
        paidAmount: dueData.paid_amount === undefined ? existing.paid_amount : dueData.paid_amount,
        status: dueData.status || existing.status,
      });
    } catch (error) {
      throw httpError(error.message, 400);
    }

    try {
      return await dueModel.update(id, {
        vehicle_id: vehicle.id,
        due_date: dueData.due_date || existing.due_date,
        amount: amounts.amount,
        paid_amount: amounts.paid_amount,
        status: amounts.status,
        notes: dueData.notes === undefined ? existing.notes : dueData.notes,
        updated_by: userId,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw httpError('A due already exists for this vehicle and date', 409);
      }
      throw error;
    }
  },

  async cancel(id, userId, reason) {
    const existing = await dueModel.findById(id);

    if (!existing) {
      throw httpError('Due not found', 404);
    }

    if (existing.status === 'cancelled') {
      throw httpError('Due is already cancelled', 400);
    }

    return dueModel.cancel(id, { userId, reason: reason || null });
  },

  async outstanding(vehicleId = null) {
    const [summary, vehicles] = await Promise.all([
      dueModel.summarize({ vehicleId }),
      dueModel.summarizeByVehicle(vehicleId),
    ]);

    return {
      summary,
      vehicles,
    };
  },
};

export { collectionService } from './collectionService.js';
export { adminService } from './adminService.js';
