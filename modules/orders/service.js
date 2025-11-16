/**
 * Service layer for Order Tracking
 * Contains business logic for order operations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Valid order stages
const VALID_STAGES = ['Planning', 'Production', 'Quality', 'Packaging', 'Shipping', 'Completed'];
const VALID_STATUSES = ['Active', 'OnHold', 'Completed', 'Cancelled'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

/**
 * Get all orders
 * @returns {Promise<Array>} Array of all orders
 */
export async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        updated_at: 'desc',
      },
    });
    return orders;
  } catch (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
}

/**
 * Get a single order by order_id
 * @param {string} orderId - The order ID
 * @returns {Promise<Object|null>} Order object or null if not found
 */
export async function getOrder(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        order_id: orderId,
      },
    });
    return order;
  } catch (error) {
    throw new Error(`Failed to fetch order ${orderId}: ${error.message}`);
  }
}

/**
 * Update or create an order
 * @param {string} orderId - The order ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated order object
 */
export async function updateOrder(orderId, updateData) {
  try {
    // Validate stage if provided
    if (updateData.stage && !VALID_STAGES.includes(updateData.stage)) {
      throw new Error(
        `Invalid stage: ${updateData.stage}. Must be one of: ${VALID_STAGES.join(', ')}`
      );
    }

    // Validate status if provided
    if (updateData.status && !VALID_STATUSES.includes(updateData.status)) {
      throw new Error(
        `Invalid status: ${updateData.status}. Must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }

    // Validate priority if provided
    if (updateData.priority && !VALID_PRIORITIES.includes(updateData.priority)) {
      throw new Error(
        `Invalid priority: ${updateData.priority}. Must be one of: ${VALID_PRIORITIES.join(', ')}`
      );
    }

    // Ensure updated_at is set to current time
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date(),
    };

    const order = await prisma.order.upsert({
      where: {
        order_id: orderId,
      },
      update: dataToUpdate,
      create: {
        order_id: orderId,
        customer_name: updateData.customer_name || null,
        stage: updateData.stage || 'Planning',
        priority: updateData.priority || 'Medium',
        quantity: updateData.quantity ?? 0,
        materials: updateData.materials || null,
        eta: updateData.eta || null,
        status: updateData.status || 'Active',
        assigned_to: updateData.assigned_to || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return order;
  } catch (error) {
    throw new Error(`Failed to update order ${orderId}: ${error.message}`);
  }
}

/**
 * Batch update multiple orders
 * @param {Array} ordersData - Array of order update objects
 * @returns {Promise<Array>} Array of update results
 */
export async function batchUpdateOrders(ordersData) {
  try {
    if (!Array.isArray(ordersData)) {
      throw new Error('Expected an array of orders');
    }

    const results = [];

    for (const orderData of ordersData) {
      if (!orderData.order_id) {
        results.push({
          success: false,
          order_id: orderData.order_id || 'unknown',
          error: 'order_id is required',
        });
        continue;
      }

      try {
        const updated = await updateOrder(orderData.order_id, orderData);
        results.push({
          success: true,
          order: updated,
        });
      } catch (error) {
        results.push({
          success: false,
          order_id: orderData.order_id,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to batch update orders: ${error.message}`);
  }
}

/**
 * Parse order message (used for WhatsApp updates)
 * @param {string} message - Order update message
 * @returns {Object|null} Parsed order data
 */
export function parseOrderMessage(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  try {
    const parsed = {
      order_id: null,
      stage: null,
      priority: null,
      quantity: null,
      materials: null,
      eta: null,
      status: null,
      assigned_to: null,
    };

    // Extract order ID
    const orderIdMatch = message.match(/ORD[A-Z0-9]+/i);
    if (orderIdMatch) {
      parsed.order_id = orderIdMatch[0].toUpperCase();
    } else {
      return null;
    }

    // Extract stage
    const stageMatch = message.match(/STAGE[=:]?\s*(\w+)/i);
    if (stageMatch) {
      parsed.stage = normalizeOrderStage(stageMatch[1]);
    }

    // Extract priority
    const priorityMatch = message.match(/PRIORITY[=:]?\s*(Low|Medium|High|Urgent)/i);
    if (priorityMatch) {
      parsed.priority = priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase();
    }

    // Extract quantity
    const quantityMatch = message.match(/QUANTITY[=:]?\s*(\d+)|QTY[=:]?\s*(\d+)/i);
    if (quantityMatch) {
      parsed.quantity = parseInt(quantityMatch[1] || quantityMatch[2], 10);
    }

    // Extract ETA
    const etaMatch = message.match(/ETA[=:]?\s*([A-Za-z0-9\-\s]+)/i);
    if (etaMatch) {
      parsed.eta = etaMatch[1].trim();
    }

    // Extract materials
    const materialsMatch = message.match(/MATERIALS[=:]?\s*(.+?)(?:\s+(?:STAGE|ETA|PRIORITY)|$)/i);
    if (materialsMatch) {
      parsed.materials = materialsMatch[1].trim();
    }

    // Extract status
    const statusMatch = message.match(/STATUS[=:]?\s*(Active|OnHold|Completed|Cancelled)/i);
    if (statusMatch) {
      parsed.status = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
    }

    // Extract assigned_to
    const assignedMatch = message.match(/ASSIGNED[=:]?\s*(.+?)$/i);
    if (assignedMatch) {
      parsed.assigned_to = assignedMatch[1].trim();
    }

    // Remove null values
    Object.keys(parsed).forEach((key) => {
      if (parsed[key] === null) {
        delete parsed[key];
      }
    });

    return parsed;
  } catch (error) {
    console.error('Error parsing order message:', error);
    return null;
  }
}

/**
 * Normalize order stage
 */
function normalizeOrderStage(stage) {
  const normalized = stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
  const validStages = ['Planning', 'Production', 'Quality', 'Packaging', 'Shipping', 'Completed'];
  
  if (normalized.includes('plan')) return 'Planning';
  if (normalized.includes('product')) return 'Production';
  if (normalized.includes('quality') || normalized.includes('qc')) return 'Quality';
  if (normalized.includes('pack')) return 'Packaging';
  if (normalized.includes('ship')) return 'Shipping';
  if (normalized.includes('complete') || normalized.includes('done')) return 'Completed';
  
  return normalized;
}

/**
 * Get order status summary for LLM
 * @returns {Promise<Object>} Order status summary
 */
export async function getOrderStatus() {
  try {
    const orders = await getAllOrders();

    // Calculate statistics
    const stats = {
      total_orders: orders.length,
      active: orders.filter((o) => o.status === 'Active').length,
      on_hold: orders.filter((o) => o.status === 'OnHold').length,
      completed: orders.filter((o) => o.status === 'Completed').length,
      cancelled: orders.filter((o) => o.status === 'Cancelled').length,
      by_stage: {
        planning: orders.filter((o) => o.stage === 'Planning').length,
        production: orders.filter((o) => o.stage === 'Production').length,
        quality: orders.filter((o) => o.stage === 'Quality').length,
        packaging: orders.filter((o) => o.stage === 'Packaging').length,
        shipping: orders.filter((o) => o.stage === 'Shipping').length,
        completed: orders.filter((o) => o.stage === 'Completed').length,
      },
      by_priority: {
        low: orders.filter((o) => o.priority === 'Low').length,
        medium: orders.filter((o) => o.priority === 'Medium').length,
        high: orders.filter((o) => o.priority === 'High').length,
        urgent: orders.filter((o) => o.priority === 'Urgent').length,
      },
    };

    return {
      orders,
      statistics: stats,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get order status: ${error.message}`);
  }
}

