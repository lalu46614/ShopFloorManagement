/**
 * Routes for Shop Floor Management Module
 */

import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

/**
 * @route   GET /machines
 * @desc    Get all machines
 * @access  Public
 */
router.get('/', controller.getAllMachines);

/**
 * @route   GET /machines/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', controller.healthCheck);

/**
 * @route   GET /machines/status/llm
 * @desc    Get machine status formatted for LLM prompt
 * @access  Public
 * @query   format - Optional: 'human' for human-readable format, default is JSON
 */
router.get('/status/llm', controller.getMachineStatusForLLM);

/**
 * @route   GET /machines/:id
 * @desc    Get a single machine by machine_id
 * @access  Public
 */
router.get('/:id', controller.getMachine);

/**
 * @route   POST /machines/update
 * @desc    Update a machine (supports both JSON and WhatsApp message format)
 * @access  Public
 * @body    JSON: { machine_id, status, output, error_message, operator }
 *          OR: { message: "M03 STATUS=Running OUTPUT=120" }
 */
router.post('/update', controller.updateMachine);

/**
 * @route   POST /machines/batch
 * @desc    Batch update multiple machines
 * @access  Public
 * @body    { machines: [{ machine_id, status, output, ... }, ...] }
 */
router.post('/batch', controller.batchUpdateMachines);

export default router;

