import {
  authService,
  dueService,
  rateService,
  vehicleService,
} from '../services/index.js';

const sendError = (res, error, fallbackStatus = 400) => {
  res.status(error.statusCode || fallbackStatus).json({ error: error.message });
};

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

  async options(req, res) {
    try {
      const vehicles = await vehicleService.listOptions();
      res.json({ vehicles });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await vehicleService.getDetail(req.params.id, req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error, 400);
    }
  },
};

export const rateController = {
  async list(req, res) {
    try {
      const result = await rateService.list();
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  async save(req, res) {
    try {
      const result = await rateService.save(req.validatedData, req.user.userId);
      res.json({
        message: 'Rates saved successfully',
        ...result,
      });
    } catch (error) {
      sendError(res, error);
    }
  },
};

export const dueController = {
  async create(req, res) {
    try {
      const due = await dueService.create(req.validatedData, req.user.userId);
      res.status(201).json({
        message: 'Due created successfully',
        due,
      });
    } catch (error) {
      sendError(res, error);
    }
  },

  async list(req, res) {
    try {
      const result = await dueService.list(req.validatedData);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },

  async getById(req, res) {
    try {
      const due = await dueService.getById(req.params.id);
      res.json({ due });
    } catch (error) {
      sendError(res, error);
    }
  },

  async update(req, res) {
    try {
      const due = await dueService.update(req.params.id, req.validatedData, req.user.userId);
      res.json({
        message: 'Due updated successfully',
        due,
      });
    } catch (error) {
      sendError(res, error);
    }
  },

  async cancel(req, res) {
    try {
      const due = await dueService.cancel(
        req.params.id,
        req.user.userId,
        req.validatedData.cancellation_reason,
      );
      res.json({
        message: 'Due cancelled successfully',
        due,
      });
    } catch (error) {
      sendError(res, error);
    }
  },

  async outstanding(req, res) {
    try {
      const result = await dueService.outstanding(req.validatedData.vehicle_id);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  },
};
