/* eslint-disable import/prefer-default-export */
/* eslint-disable camelcase */
import pool from '../config/database.js';
import { toMoney } from '../utils/dues.js';
import { sql } from '../utils/sql.js';

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const adminService = {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(filters = {}) {
    const { fromDate, toDate } = filters;

    const params = [];
    if (fromDate && toDate) {
      params.push(fromDate, toDate);
    }

    try {
      // Today's collection
      const todayResult = await pool.query(sql.adminService.dashboardToday);

      // Monthly collection (current month)
      const monthlyResult = await pool.query(sql.adminService.dashboardMonthly);

      // Total outstanding dues
      const outstandingResult = await pool.query(sql.adminService.dashboardOutstanding);

      // Registered vehicles count by category
      const vehiclesResult = await pool.query(sql.adminService.dashboardVehicles);

      // Active agents (agents with payments in current month)
      const agentsResult = await pool.query(sql.adminService.dashboardAgents);

      return {
        todaysCollection: {
          amount: toMoney(todayResult.rows[0]?.total || 0),
          paymentCount: parseInt(todayResult.rows[0]?.count || 0, 10),
          vehicleCount: parseInt(todayResult.rows[0]?.vehicle_count || 0, 10),
        },
        monthlyCollection: {
          amount: toMoney(monthlyResult.rows[0]?.total || 0),
          paymentCount: parseInt(monthlyResult.rows[0]?.count || 0, 10),
        },
        totalOutstanding: {
          amount: toMoney(outstandingResult.rows[0]?.total || 0),
          dueCount: parseInt(outstandingResult.rows[0]?.count || 0, 10),
        },
        registeredVehicles: {
          total: vehiclesResult.rows.reduce((sum, row) => sum + parseInt(row.total, 10), 0),
          byCategory: vehiclesResult.rows.map((row) => ({
            category: row.category,
            total: parseInt(row.total, 10),
            active: parseInt(row.active_count, 10),
          })),
        },
        activeAgents: {
          total: parseInt(agentsResult.rows[0]?.total || 0, 10),
        },
      };
    } catch (error) {
      throw httpError('Failed to fetch dashboard metrics', 500);
    }
  },

  /**
   * Get collection report with filters
   */
  async getCollectionReport(filters = {}) {
    const {
      page = 1,
      limit = 20,
      fromDate,
      toDate,
      category,
      agentId,
    } = filters;

    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (fromDate && toDate) {
      params.push(fromDate, toDate);
      conditions.push(sql.adminService.filters.createdAtBetween(params.length - 1, params.length));
    }

    if (category) {
      params.push(category);
      conditions.push(sql.adminService.filters.category(params.length));
    }

    if (agentId) {
      params.push(agentId);
      conditions.push(sql.adminService.filters.agentId(params.length));
    }

    const whereClause = sql.common.whereAll(conditions);

    try {
      const countResult = await pool.query(
        sql.adminService.collectionReportCount(whereClause),
        params,
      );

      params.push(limit, offset);

      const dataResult = await pool.query(
        sql.adminService.collectionReportData(whereClause, params.length - 1, params.length),
        params,
      );

      const total = parseInt(countResult.rows[0]?.total || 0, 10);
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows.map((row) => ({
          id: row.id,
          amount: toMoney(row.amount),
          paymentMode: row.payment_mode,
          status: row.status,
          createdAt: row.created_at,
          vehicleNumber: row.vehicle_number,
          ownerName: row.owner_name,
          category: row.category,
          agentName: row.agent_name,
          receiptNumber: row.receipt_number,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw httpError('Failed to fetch collection report', 500);
    }
  },

  /**
   * Get vehicle category report
   */
  async getVehicleCategoryReport(filters = {}) {
    const { fromDate, toDate } = filters;

    const dateFilter = fromDate && toDate
      ? sql.adminService.filters.paymentJoinDateFilter(1, 2) : '';

    const params = [];
    if (fromDate && toDate) {
      params.push(fromDate, toDate);
    }

    try {
      const result = await pool.query(sql.adminService.vehicleCategoryReport(dateFilter), params);

      return {
        categories: result.rows.map((row) => ({
          category: row.category,
          vehicleCount: parseInt(row.vehicle_count, 10),
          activeVehicles: parseInt(row.active_vehicles, 10),
          inactiveVehicles: parseInt(row.inactive_vehicles, 10),
          totalCollected: toMoney(row.total_collected),
          totalOutstanding: toMoney(row.total_outstanding),
          paymentCount: parseInt(row.payment_count, 10),
        })),
      };
    } catch (error) {
      throw httpError('Failed to fetch vehicle category report', 500);
    }
  },

  /**
   * Get agent collection report
   */
  async getAgentCollectionReport(filters = {}) {
    const {
      page = 1,
      limit = 20,
      fromDate,
      toDate,
    } = filters;

    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (fromDate && toDate) {
      params.push(fromDate, toDate);
      conditions.push(sql.adminService.filters.createdAtBetween(params.length - 1, params.length));
    }

    const whereClause = sql.common.whereAll(conditions);

    try {
      const countResult = await pool.query(
        sql.adminService.agentCollectionCount(whereClause),
        params,
      );

      params.push(limit, offset);

      const dataResult = await pool.query(
        sql.adminService.agentCollectionData(whereClause, params.length - 1, params.length),
        params,
      );

      const total = parseInt(countResult.rows[0]?.total || 0, 10);
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows.map((row) => ({
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          mobileNumber: row.mobile_number,
          paymentCount: parseInt(row.payment_count, 10),
          totalCollected: toMoney(row.total_collected),
          uniqueVehicles: parseInt(row.unique_vehicles, 10),
          lastCollection: row.last_collection,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw httpError('Failed to fetch agent collection report', 500);
    }
  },

  /**
   * Get daily collection chart data
   */
  async getDailyCollectionChart(filters = {}) {
    const { days = 30 } = filters;

    try {
      const result = await pool.query(sql.adminService.dailyCollectionChart, [days]);

      return {
        data: result.rows.map((row) => ({
          date: row.collection_date,
          amount: toMoney(row.amount),
          count: parseInt(row.count, 10),
        })),
      };
    } catch (error) {
      throw httpError('Failed to fetch daily collection chart', 500);
    }
  },

  /**
   * Get monthly collection chart data
   */
  async getMonthlyCollectionChart(filters = {}) {
    const { months = 12 } = filters;

    try {
      const result = await pool.query(sql.adminService.monthlyCollectionChart, [months]);

      return {
        data: result.rows.map((row) => ({
          month: row.month,
          amount: toMoney(row.amount),
          count: parseInt(row.count, 10),
        })),
      };
    } catch (error) {
      throw httpError('Failed to fetch monthly collection chart', 500);
    }
  },

  /**
   * Export collection data as CSV
   */
  async exportCollectionData(filters = {}) {
    const {
      fromDate,
      toDate,
      category,
      agentId,
      format = 'csv',
    } = filters;

    const params = [];
    const conditions = [];

    if (fromDate && toDate) {
      params.push(fromDate, toDate);
      conditions.push(sql.adminService.filters.createdAtBetween(params.length - 1, params.length));
    }

    if (category) {
      params.push(category);
      conditions.push(sql.adminService.filters.category(params.length));
    }

    if (agentId) {
      params.push(agentId);
      conditions.push(sql.adminService.filters.agentId(params.length));
    }

    const whereClause = sql.common.whereAll(conditions);

    try {
      const result = await pool.query(sql.adminService.exportCollectionData(whereClause), params);

      if (format === 'csv') {
        return {
          format: 'csv',
          headers: [
            'ID',
            'Vehicle Number',
            'Owner Name',
            'Category',
            'Amount',
            'Payment Mode',
            'Status',
            'Agent Name',
            'Receipt Number',
            'Collection Date',
          ],
          data: result.rows.map((row) => [
            row.id,
            row.vehicle_number,
            row.owner_name,
            row.category,
            row.amount,
            row.payment_mode,
            row.status,
            row.agent_name,
            row.receipt_number || 'N/A',
            row.created_at,
          ]),
        };
      }

      if (format === 'excel') {
        return {
          format: 'excel',
          headers: [
            'ID',
            'Vehicle Number',
            'Owner Name',
            'Category',
            'Amount',
            'Payment Mode',
            'Status',
            'Agent Name',
            'Receipt Number',
            'Collection Date',
          ],
          data: result.rows.map((row) => ({
            id: row.id,
            vehicleNumber: row.vehicle_number,
            ownerName: row.owner_name,
            category: row.category,
            amount: row.amount,
            paymentMode: row.payment_mode,
            status: row.status,
            agentName: row.agent_name,
            receiptNumber: row.receipt_number || 'N/A',
            collectionDate: row.created_at,
          })),
        };
      }

      throw httpError('Invalid export format', 400);
    } catch (error) {
      if (error.statusCode) throw error;
      throw httpError('Failed to export collection data', 500);
    }
  },
};
