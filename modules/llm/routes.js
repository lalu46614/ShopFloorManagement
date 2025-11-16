/**
 * Routes for LLM Integration Module
 */

import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

/**
 * @route   POST /ai/query
 * @desc    Process AI query for specific workflow
 * @access  Public
 * @body    { workflow: "shopfloor" | "safety" | "orders" | "all", message: string }
 */
router.post('/query', controller.processAIQuery);

/**
 * @route   GET /ai/daily-summary
 * @desc    Generate daily summary for all workflows
 * @access  Public
 */
router.get('/daily-summary', controller.getDailySummary);

export default router;

