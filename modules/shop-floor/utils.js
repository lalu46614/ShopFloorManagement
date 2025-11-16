/**
 * Utility functions for Shop Floor Management
 * Includes WhatsApp message parsing and LLM prompt preparation
 */

/**
 * Parse WhatsApp message to extract machine update data
 * Expected format: "M03 STATUS=Running OUTPUT=120"
 * or variations like "M03 Status:Running Output:120"
 * 
 * @param {string} message - Raw WhatsApp message
 * @returns {Object|null} Parsed machine data or null if parsing fails
 */
export function parseWhatsappMessage(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  try {
    const parsed = {
      machine_id: null,
      status: null,
      output: null,
      error_message: null,
      operator: null,
    };

    // Extract machine_id (e.g., M01, M02, M03)
    const machineIdMatch = message.match(/M\d+/i);
    if (machineIdMatch) {
      parsed.machine_id = machineIdMatch[0].toUpperCase();
    } else {
      return null; // Machine ID is required
    }

    // Extract status (Running, Idle, Maintenance, Error)
    const statusMatch = message.match(/STATUS[=:]?\s*(\w+)|Status[=:]?\s*(\w+)/i);
    if (statusMatch) {
      const status = (statusMatch[1] || statusMatch[2]).trim();
      // Normalize status to match expected values
      parsed.status = normalizeStatus(status);
    }

    // Extract output (numeric value)
    const outputMatch = message.match(/OUTPUT[=:]?\s*(\d+)|Output[=:]?\s*(\d+)/i);
    if (outputMatch) {
      parsed.output = parseInt(outputMatch[1] || outputMatch[2], 10);
    }

    // Extract error message if present
    const errorMatch = message.match(/ERROR[=:]?\s*(.+?)(?:\s+OPERATOR|$)/i);
    if (errorMatch) {
      parsed.error_message = errorMatch[1].trim();
    }

    // Extract operator name if present
    const operatorMatch = message.match(/OPERATOR[=:]?\s*(.+?)$/i);
    if (operatorMatch) {
      parsed.operator = operatorMatch[1].trim();
    }

    // Remove null values for cleaner output
    Object.keys(parsed).forEach((key) => {
      if (parsed[key] === null) {
        delete parsed[key];
      }
    });

    return parsed;
  } catch (error) {
    console.error('Error parsing WhatsApp message:', error);
    return null;
  }
}

/**
 * Normalize status string to match expected values
 * @param {string} status - Raw status string
 * @returns {string} Normalized status
 */
function normalizeStatus(status) {
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const validStatuses = ['Running', 'Idle', 'Maintenance', 'Error'];
  
  // Check for common variations
  if (normalized.includes('run')) return 'Running';
  if (normalized.includes('idle')) return 'Idle';
  if (normalized.includes('maintain')) return 'Maintenance';
  if (normalized.includes('error') || normalized.includes('down')) return 'Error';
  
  return normalized;
}

/**
 * Apply status validation rules
 * - If status is Error and error_message is missing, set a default
 * - If status is not Error, clear error_message
 * - If status is Idle, set output to 0
 * 
 * @param {Object} data - Machine update data
 * @returns {Object} Validated machine data
 */
export function applyStatusValidation(data) {
  const validated = { ...data };

  // If status is Error and no error_message provided, set default
  if (validated.status === 'Error' && !validated.error_message) {
    validated.error_message = 'Machine error detected';
  }

  // If status is not Error, clear error_message
  if (validated.status && validated.status !== 'Error' && validated.error_message) {
    validated.error_message = null;
  }

  // If status is Idle, set output to 0
  if (validated.status === 'Idle' && validated.output !== undefined && validated.output !== 0) {
    validated.output = 0;
  }

  return validated;
}

/**
 * Prepare machine status data for LLM prompt
 * Converts database machine data into a compact JSON format for OpenAI
 * 
 * @param {Array} machines - Array of machine objects from database
 * @returns {string} Formatted JSON string for LLM consumption
 */
export function prepareMachineStatusPrompt(machines) {
  if (!Array.isArray(machines)) {
    return JSON.stringify([]);
  }

  // Transform machines to compact format for LLM
  const compactMachines = machines.map((machine) => ({
    machine_id: machine.machine_id,
    name: machine.name,
    status: machine.status,
    output: machine.output,
    last_updated: machine.last_updated.toISOString(),
    ...(machine.error_message && { error_message: machine.error_message }),
    ...(machine.operator && { operator: machine.operator }),
  }));

  return JSON.stringify(compactMachines, null, 2);
}

/**
 * Format machine status for human-readable prompt
 * Creates a more natural language format for LLM context
 * 
 * @param {Array} machines - Array of machine objects from database
 * @returns {string} Human-readable machine status summary
 */
export function formatMachineStatusForLLM(machines) {
  if (!Array.isArray(machines) || machines.length === 0) {
    return 'No machine data available.';
  }

  let summary = `Current Shop Floor Status:\n\n`;
  
  machines.forEach((machine) => {
    summary += `Machine ${machine.machine_id} (${machine.name}):\n`;
    summary += `  - Status: ${machine.status}\n`;
    summary += `  - Output: ${machine.output} units\n`;
    summary += `  - Last Updated: ${machine.last_updated.toISOString()}\n`;
    
    if (machine.error_message) {
      summary += `  - Error: ${machine.error_message}\n`;
    }
    
    if (machine.operator) {
      summary += `  - Operator: ${machine.operator}\n`;
    }
    
    summary += '\n';
  });

  return summary;
}

