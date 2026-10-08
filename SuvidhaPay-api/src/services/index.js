import bcrypt from 'bcrypt';
import { userModel, vehicleModel } from '../models/index.js';
import { generateTokens, refreshAccessToken } from '../utils/jwt.js';

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
    const vehicles = await vehicleModel.searchByIdentifiers({
      vehicleNumber: searchData.vehicle_number
        ? normalizeVehicleNumber(searchData.vehicle_number)
        : null,
      mobileNumber: searchData.mobile_number
        ? normalizeMobileNumber(searchData.mobile_number)
        : null,
    });

    return vehicles;
  },

  async list(listParams) {
    return vehicleModel.list(listParams);
  },
};
