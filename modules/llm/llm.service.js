/**
 * LLM Integration Service
 * Handles OpenAI API calls for generating summaries and insights
 */

import * as machineService from '../shop-floor/service.js';
import * as safetyService from '../safety/service.js';
import * as orderService from '../orders/service.js';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // Using gpt-4o-mini as default, can be upgraded

/**
 * Call OpenAI API
 * @param {string} systemPrompt - System prompt
 * @param {string} userMessage - User message
 * @param {Object} options - Additional options
 * @returns {Promise<string>} AI response
 */
async function callOpenAI(systemPrompt, userMessage, options = {}) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Generate shop floor summary using LLM
 * @param {Array} machineData - Machine data array
 * @param {string} query - User query
 * @returns {Promise<string>} AI-generated summary
 */
export async function generateShopFloorSummary(machineData, query = 'Give me a summary of the shop floor status') {
  try {
    const systemPrompt = `You are an AI assistant for a manufacturing shop floor management system. 
You analyze machine data and provide insights, summaries, and recommendations.
Be concise, clear, and actionable.`;

    const userMessage = `${query}\n\nMachine Data:\n${JSON.stringify(machineData, null, 2)}`;

    const response = await callOpenAI(systemPrompt, userMessage, {
      max_tokens: 1500,
    });

    return response;
  } catch (error) {
    throw new Error(`Failed to generate shop floor summary: ${error.message}`);
  }
}

/**
 * Generate safety summary using LLM
 * @param {Object} safetyData - Safety data object
 * @param {string} query - User query
 * @returns {Promise<string>} AI-generated summary
 */
export async function generateSafetySummary(safetyData, query = 'Give me a summary of the safety status') {
  try {
    const systemPrompt = `You are an AI assistant for a manufacturing safety management system.
You analyze safety data including safety areas, PPE compliance, risk levels, and incidents.
Provide actionable insights and highlight any critical safety concerns.
Be professional and safety-focused.`;

    const userMessage = `${query}\n\nSafety Data:\n${JSON.stringify(safetyData, null, 2)}`;

    const response = await callOpenAI(systemPrompt, userMessage, {
      max_tokens: 1500,
    });

    return response;
  } catch (error) {
    throw new Error(`Failed to generate safety summary: ${error.message}`);
  }
}

/**
 * Generate order summary using LLM
 * @param {Object} orderData - Order data object
 * @param {string} query - User query
 * @returns {Promise<string>} AI-generated summary
 */
export async function generateOrderSummary(orderData, query = 'Give me a summary of the orders') {
  try {
    const systemPrompt = `You are an AI assistant for a manufacturing order tracking system.
You analyze order data including stages, priorities, ETAs, and order status.
Provide insights on order progress, bottlenecks, and recommendations for optimization.
Be data-driven and actionable.`;

    const userMessage = `${query}\n\nOrder Data:\n${JSON.stringify(orderData, null, 2)}`;

    const response = await callOpenAI(systemPrompt, userMessage, {
      max_tokens: 1500,
    });

    return response;
  } catch (error) {
    throw new Error(`Failed to generate order summary: ${error.message}`);
  }
}

/**
 * Process AI query based on workflow
 * Fetches data, builds prompt, calls LLM, and returns response
 * @param {string} workflow - Workflow type: 'shopfloor' | 'safety' | 'orders' | 'all'
 * @param {string} message - User message/query
 * @returns {Promise<Object>} AI response with data
 */
export async function processAIQuery(workflow, message) {
  try {
    let aiResponse = '';
    let dataFetched = null;

    switch (workflow.toLowerCase()) {
      case 'shopfloor':
      case 'machines':
        const machines = await machineService.getAllMachines();
        dataFetched = machines;
        aiResponse = await generateShopFloorSummary(machines, message);
        break;

      case 'safety':
        const safetyStatus = await safetyService.getSafetyStatus();
        dataFetched = safetyStatus;
        aiResponse = await generateSafetySummary(safetyStatus, message);
        break;

      case 'orders':
        const orderStatus = await orderService.getOrderStatus();
        dataFetched = orderStatus;
        aiResponse = await generateOrderSummary(orderStatus, message);
        break;

      case 'all':
      case 'combined':
        // Fetch all data
        const allMachines = await machineService.getAllMachines();
        const allSafety = await safetyService.getSafetyStatus();
        const allOrders = await orderService.getOrderStatus();

        const combinedData = {
          machines: allMachines,
          safety: allSafety,
          orders: allOrders,
        };

        dataFetched = combinedData;

        // Generate combined summary
        const combinedSystemPrompt = `You are an AI assistant for a comprehensive manufacturing management system.
You analyze shop floor machines, safety data, and order tracking information.
Provide a holistic view of the manufacturing operations, identify correlations, and give actionable recommendations.
Be comprehensive yet concise.`;

        const combinedUserMessage = `${message}\n\nCombined Data:\n${JSON.stringify(combinedData, null, 2)}`;

        aiResponse = await callOpenAI(combinedSystemPrompt, combinedUserMessage, {
          max_tokens: 2000,
        });
        break;

      default:
        throw new Error(
          `Invalid workflow: ${workflow}. Must be one of: shopfloor, safety, orders, all`
        );
    }

    return {
      success: true,
      workflow,
      query: message,
      response: aiResponse,
      data: dataFetched,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to process AI query: ${error.message}`);
  }
}

/**
 * Generate daily summary for all workflows
 * @returns {Promise<Object>} Combined daily summary
 */
export async function generateDailySummary() {
  try {
    const machines = await machineService.getAllMachines();
    const safety = await safetyService.getSafetyStatus();
    const orders = await orderService.getOrderStatus();

    const combinedData = {
      machines,
      safety,
      orders,
    };

    const systemPrompt = `You are an AI assistant generating a daily manufacturing operations summary.
Analyze the shop floor machines, safety status, and order tracking data.
Provide a comprehensive daily report highlighting:
1. Machine performance and any issues
2. Safety compliance and incidents
3. Order progress and bottlenecks
4. Key recommendations for tomorrow
Be professional, data-driven, and actionable.`;

    const userMessage = `Generate today's daily manufacturing operations summary.\n\nData:\n${JSON.stringify(combinedData, null, 2)}`;

    const summary = await callOpenAI(systemPrompt, userMessage, {
      max_tokens: 2000,
    });

    return {
      success: true,
      summary,
      data: combinedData,
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to generate daily summary: ${error.message}`);
  }
}

