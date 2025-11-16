/**
 * Routes for Order Tracking Module
 */

import express from 'express';
import * as controller from './controller.js';

const router = express.Router();

/**
 * @route   GET /orders
 * @desc    Get all orders
 * @access  Public
 */
router.get('/', controller.getAllOrders);

/**
 * @route   GET /orders/status/llm
 * @desc    Get order status formatted for LLM
 * @access  Public
 */
router.get('/status/llm', controller.getOrderStatusForLLM);

/**
 * @route   GET /orders/:id
 * @desc    Get a single order by order_id
 * @access  Public
 */
router.get('/:id', controller.getOrder);

/**
 * @route   POST /orders/update
 * @desc    Update or create an order
 * @access  Public
 * @body    { order_id, stage, priority, quantity, materials, eta, status, assigned_to }
 */
router.post('/update', controller.updateOrder);

/**
 * @route   POST /orders/batch
 * @desc    Batch update multiple orders
 * @access  Public
 * @body    { orders: [{ order_id, stage, ... }, ...] }
 */
router.post('/batch', controller.batchUpdateOrders);

export default router;

