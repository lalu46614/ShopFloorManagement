/**
 * Controller for LLM Integration
 */

import * as llmService from './llm.service.js';

/**
 * Process AI query
 * POST /ai/query
 */
export async function processAIQuery(req, res) {
  try {
    const { workflow, message } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'workflow is required. Must be: shopfloor, safety, orders, or all',
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message is required',
      });
    }

    const result = await llmService.processAIQuery(workflow, message);

    res.json(result);
  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get daily summary
 * GET /ai/daily-summary
 */
export async function getDailySummary(req, res) {
  try {
    const summary = await llmService.generateDailySummary();
    res.json(summary);
  } catch (error) {
    console.error('Error generating daily summary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

