/**
 * Controller layer for Order Tracking
 * Handles HTTP request/response logic
 */

import * as service from './service.js';

/**
 * Get all orders
 * GET /orders
 */
export async function getAllOrders(req, res) {
  try {
    const orders = await service.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get a single order by ID
 * GET /orders/:id
 */
export async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await service.getOrder(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update an order
 * POST /orders/update
 */
export async function updateOrder(req, res) {
  try {
    const { order_id, ...updateData } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        error: 'order_id is required',
      });
    }

    const updated = await service.updateOrder(order_id, updateData);

    res.json({
      success: true,
      message: `Order ${order_id} updated successfully`,
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
 * Batch update multiple orders
 * POST /orders/batch
 */
export async function batchUpdateOrders(req, res) {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: 'Expected an array of orders in the "orders" field',
      });
    }

    const results = await service.batchUpdateOrders(orders);

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
 * Get order status formatted for LLM
 * GET /orders/status/llm
 */
export async function getOrderStatusForLLM(req, res) {
  try {
    const status = await service.getOrderStatus();

    // Format for LLM
    const formatted = {
      summary: {
        total_orders: status.statistics.total_orders,
        active: status.statistics.active,
        on_hold: status.statistics.on_hold,
        completed: status.statistics.completed,
        cancelled: status.statistics.cancelled,
        by_stage: status.statistics.by_stage,
        by_priority: status.statistics.by_priority,
      },
      orders: status.orders.map((order) => ({
        order_id: order.order_id,
        customer_name: order.customer_name,
        stage: order.stage,
        priority: order.priority,
        quantity: order.quantity,
        materials: order.materials,
        eta: order.eta,
        status: order.status,
        assigned_to: order.assigned_to,
        created_at: order.created_at.toISOString(),
        updated_at: order.updated_at.toISOString(),
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

