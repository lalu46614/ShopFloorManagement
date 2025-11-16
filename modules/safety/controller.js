/**
 * Controller layer for Safety Management
 * Handles HTTP request/response logic
 */

import * as service from './service.js';

/**
 * Get all safety areas
 * GET /safety
 */
export async function getAllSafetyAreas(req, res) {
  try {
    const areas = await service.getAllSafetyAreas();
    res.json({
      success: true,
      count: areas.length,
      data: areas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get a single safety area by name
 * GET /safety/:area
 */
export async function getSafetyArea(req, res) {
  try {
    const { area } = req.params;
    const safetyArea = await service.getSafetyArea(area);

    if (!safetyArea) {
      return res.status(404).json({
        success: false,
        error: `Safety area "${area}" not found`,
      });
    }

    res.json({
      success: true,
      data: safetyArea,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update a safety area
 * POST /safety/update
 */
export async function updateSafetyArea(req, res) {
  try {
    const { area_name, ...updateData } = req.body;

    if (!area_name) {
      return res.status(400).json({
        success: false,
        error: 'area_name is required',
      });
    }

    const updated = await service.updateSafetyArea(area_name, updateData);

    res.json({
      success: true,
      message: `Safety area "${area_name}" updated successfully`,
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Create a safety log entry
 * POST /safety/log
 */
export async function createSafetyLog(req, res) {
  try {
    const logData = req.body;

    if (!logData.area_name) {
      return res.status(400).json({
        success: false,
        error: 'area_name is required',
      });
    }

    const log = await service.createSafetyLog(logData);

    res.json({
      success: true,
      message: 'Safety log created successfully',
      data: log,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get safety logs
 * GET /safety/logs?area=optional
 */
export async function getSafetyLogs(req, res) {
  try {
    const { area } = req.query;
    const logs = await service.getSafetyLogs(area || null);

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get safety status formatted for LLM
 * GET /safety/status/llm
 */
export async function getSafetyStatusForLLM(req, res) {
  try {
    const status = await service.getSafetyStatus();

    // Format for LLM
    const formatted = {
      summary: {
        total_areas: status.statistics.total_areas,
        safe: status.statistics.safe,
        warning: status.statistics.warning,
        critical: status.statistics.critical,
        maintenance: status.statistics.maintenance,
      },
      areas: status.areas.map((area) => ({
        area_name: area.area_name,
        zone: area.zone,
        status: area.status,
        risk_level: area.risk_level,
        ppe_required: area.ppe_required,
        last_inspection: area.last_inspection.toISOString(),
        notes: area.notes,
      })),
      recent_incidents: status.logs.map((log) => ({
        area_name: log.area_name,
        zone: log.zone,
        ppe_compliance: log.ppe_compliance,
        incident_type: log.incident_type,
        description: log.description,
        reported_by: log.reported_by,
        created_at: log.created_at.toISOString(),
      })),
      last_updated: status.last_updated,
    };

    res.json({
      success: true,
      format: 'json',
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

