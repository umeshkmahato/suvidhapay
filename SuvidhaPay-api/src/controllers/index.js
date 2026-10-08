import { authService, vehicleService } from '../services/index.js';

export const authController = {
  async login(req, res) {
    try {
      const result = await authService.login(req.validatedData.email, req.validatedData.password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async refreshToken(req, res) {
    try {
      const tokens = await authService.refreshToken(req.validatedData.refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async me(req, res) {
    try {
      const user = await authService.getProfile(req.user.userId);
      res.json({ user });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },
};

export const vehicleController = {
  async create(req, res) {
    try {
      const vehicle = await vehicleService.create(req.validatedData, req.user.userId);
      res.status(201).json({
        message: 'Vehicle registered successfully',
        vehicle,
      });
    } catch (error) {
      if (error.message === 'Vehicle number already exists') {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(400).json({ error: error.message });
    }
  },

  async search(req, res) {
    try {
      const vehicles = await vehicleService.search(req.validatedData);
      res.json({ vehicles });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const result = await vehicleService.list(req.validatedData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};
