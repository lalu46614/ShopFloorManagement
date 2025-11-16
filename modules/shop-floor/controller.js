/**
 * Controller layer for Shop Floor Management
 * Handles HTTP request/response logic
 */

import * as service from './service.js';
import { parseWhatsappMessage, prepareMachineStatusPrompt, formatMachineStatusForLLM } from './utils.js';

/**
 * Get all machines
 * GET /machines
 */
export async function getAllMachines(req, res) {
  try {
    const machines = await service.getAllMachines();
    res.json({
      success: true,
      count: machines.length,
      data: machines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get a single machine by ID
 * GET /machines/:id
 */
export async function getMachine(req, res) {
  try {
    const { id } = req.params;
    const machine = await service.getMachine(id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        error: `Machine with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: machine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update a machine (supports both direct JSON and WhatsApp message format)
 * POST /machines/update
 */
export async function updateMachine(req, res) {
  try {
    const { message, ...updateData } = req.body;

    let parsedData = updateData;

    // If message field is provided, try parsing as WhatsApp message
    if (message && typeof message === 'string') {
      const whatsappData = parseWhatsappMessage(message);
      if (whatsappData) {
        parsedData = { ...parsedData, ...whatsappData };
      } else {
        return res.status(400).json({
          success: false,
          error: 'Failed to parse WhatsApp message. Ensure format: "M03 STATUS=Running OUTPUT=120"',
        });
      }
    }

    // Validate machine_id is present
    if (!parsedData.machine_id) {
      return res.status(400).json({
        success: false,
        error: 'machine_id is required',
      });
    }

    const updated = await service.updateMachine(parsedData.machine_id, parsedData);

    res.json({
      success: true,
      message: `Machine ${parsedData.machine_id} updated successfully`,
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
 * Batch update multiple machines
 * POST /machines/batch
 */
export async function batchUpdateMachines(req, res) {
  try {
    const { machines } = req.body;

    if (!Array.isArray(machines)) {
      return res.status(400).json({
        success: false,
        error: 'Expected an array of machines in the "machines" field',
      });
    }

    const results = await service.batchUpdateMachines(machines);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    res.json({
      success: true,
      message: `Batch update completed: ${successCount} succeeded, ${failureCount} failed`,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get machine status formatted for LLM prompt
 * GET /machines/status/llm
 * Returns machine data in a format optimized for OpenAI/LLM processing
 */
export async function getMachineStatusForLLM(req, res) {
  try {
    const machines = await service.getAllMachines();
    const { format } = req.query;

    // Return JSON format (default) or human-readable format
    if (format === 'human') {
      const humanReadable = formatMachineStatusForLLM(machines);
      return res.json({
        success: true,
        format: 'human-readable',
        data: humanReadable,
      });
    }

    // Default: compact JSON format
    const jsonPrompt = prepareMachineStatusPrompt(machines);
    res.json({
      success: true,
      format: 'json',
      data: JSON.parse(jsonPrompt),
      prompt: jsonPrompt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Health check endpoint
 * GET /machines/health
 */
export async function healthCheck(req, res) {
  try {
    const machines = await service.getAllMachines();
    res.json({
      success: true,
      status: 'healthy',
      machineCount: machines.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
}

