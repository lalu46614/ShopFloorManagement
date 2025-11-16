/**
 * Routes for Safety Management Module
 */

import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

/**
 * @route   GET /safety
 * @desc    Get all safety areas
 * @access  Public
 */
router.get('/', controller.getAllSafetyAreas);

/**
 * @route   GET /safety/logs
 * @desc    Get safety logs (optionally filtered by area)
 * @access  Public
 * @query   area - Optional area name filter
 */
router.get('/logs', controller.getSafetyLogs);

/**
 * @route   GET /safety/status/llm
 * @desc    Get safety status formatted for LLM
 * @access  Public
 */
router.get('/status/llm', controller.getSafetyStatusForLLM);

/**
 * @route   GET /safety/:area
 * @desc    Get a single safety area by area name
 * @access  Public
 */
router.get('/:area', controller.getSafetyArea);

/**
 * @route   POST /safety/update
 * @desc    Update or create a safety area
 * @access  Public
 * @body    { area_name, zone, ppe_required, risk_level, status, notes }
 */
router.post('/update', controller.updateSafetyArea);

/**
 * @route   POST /safety/log
 * @desc    Create a safety log entry
 * @access  Public
 * @body    { area_name, zone, ppe_compliance, incident_type, description, reported_by }
 */
router.post('/log', controller.createSafetyLog);

export default router;

