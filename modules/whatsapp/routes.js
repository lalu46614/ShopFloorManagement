/**
 * WhatsApp Webhook Routes
 * Handles incoming messages from Meta WhatsApp Cloud API
 */

import express from 'express';
import { detectIntent, parseMachineUpdate, parseSafetyUpdate, parseOrderUpdate } from '../../utils/whatsappParser.js';
import * as machineService from '../shop-floor/service.js';
import * as safetyService from '../safety/service.js';
import * as orderService from '../orders/service.js';

const router = express.Router();

/**
 * WhatsApp Webhook Verification (GET)
 * Meta WhatsApp Cloud API requires this for webhook setup
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token_here';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * WhatsApp Webhook Handler (POST)
 * Receives messages from WhatsApp and processes them
 */
router.post('/webhook', async (req, res) => {
  try {
    // WhatsApp sends data in a specific format
    const body = req.body;

    // Verify webhook signature if configured
    if (process.env.WHATSAPP_WEBHOOK_SECRET) {
      // Add signature verification here if needed
    }

    // Handle webhook events
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      
      for (const entry of entries) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.field === 'messages') {
            const value = change.value;
            
            // Process incoming messages
            if (value.messages && value.messages.length > 0) {
              for (const message of value.messages) {
                await processIncomingMessage(message, value.contacts?.[0]);
              }
            }

            // Handle status updates (delivery, read, etc.)
            if (value.statuses && value.statuses.length > 0) {
              // Log status updates if needed
              console.log('Message status updates:', value.statuses);
            }
          }
        }
      }
    }

    // Always return 200 OK to WhatsApp
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    // Still return 200 to avoid retries
    res.status(200).send('OK');
  }
});

/**
 * Process incoming WhatsApp message
 * Detects intent and routes to appropriate service
 */
async function processIncomingMessage(message, contact) {
  try {
    const messageText = message.text?.body || message.body?.text || '';
    const fromNumber = message.from;
    const messageId = message.id;

    console.log(`📨 Received WhatsApp message from ${fromNumber}: ${messageText}`);

    if (!messageText.trim()) {
      console.log('Empty message, skipping...');
      return;
    }

    // Detect intent
    const intent = detectIntent(messageText);
    console.log(`🎯 Detected intent: ${intent}`);

    let result = null;

    switch (intent) {
      case 'MACHINE_UPDATE':
        const machineData = parseMachineUpdate(messageText);
        if (machineData && machineData.machine_id) {
          result = await machineService.updateMachine(machineData.machine_id, machineData);
          console.log(`✅ Machine ${machineData.machine_id} updated successfully`);
        } else {
          console.log('❌ Failed to parse machine update');
        }
        break;

      case 'SAFETY_UPDATE':
        const safetyData = parseSafetyUpdate(messageText);
        if (safetyData && safetyData.area_name) {
          result = await safetyService.updateSafetyArea(safetyData.area_name, safetyData);
          console.log(`✅ Safety area ${safetyData.area_name} updated successfully`);
        } else {
          console.log('❌ Failed to parse safety update');
        }
        break;

      case 'ORDER_UPDATE':
        const orderData = parseOrderUpdate(messageText);
        if (orderData && orderData.order_id) {
          result = await orderService.updateOrder(orderData.order_id, orderData);
          console.log(`✅ Order ${orderData.order_id} updated successfully`);
        } else {
          console.log('❌ Failed to parse order update');
        }
        break;

      default:
        console.log(`❓ Unknown intent for message: ${messageText}`);
        // Could send a help message back to user
        break;
    }

    return result;
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

/**
 * Test endpoint for WhatsApp message parsing
 * POST /whatsapp/test
 */
router.post('/test', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const intent = detectIntent(message);
    let parsed = null;

    switch (intent) {
      case 'MACHINE_UPDATE':
        parsed = parseMachineUpdate(message);
        break;
      case 'SAFETY_UPDATE':
        parsed = parseSafetyUpdate(message);
        break;
      case 'ORDER_UPDATE':
        parsed = parseOrderUpdate(message);
        break;
    }

    res.json({
      success: true,
      intent,
      parsed,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

