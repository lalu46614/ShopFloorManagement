/**
 * WhatsApp Message Parser Utilities
 * Parses different types of worker updates from WhatsApp messages
 */

/**
 * Detect intent from WhatsApp message
 * @param {string} message - Raw WhatsApp message
 * @returns {string} Intent type: MACHINE_UPDATE | SAFETY_UPDATE | ORDER_UPDATE | UNKNOWN
 */
export function detectIntent(message) {
  if (!message || typeof message !== 'string') {
    return 'UNKNOWN';
  }

  const upperMessage = message.toUpperCase();

  // Machine update pattern: Starts with M followed by digits
  if (/^M\d+/i.test(message.trim())) {
    return 'MACHINE_UPDATE';
  }

  // Safety update pattern: Contains SAFETY keyword
  if (upperMessage.includes('SAFETY')) {
    return 'SAFETY_UPDATE';
  }

  // Order update pattern: Contains ORDER keyword or ORD followed by digits
  if (upperMessage.includes('ORDER') || /ORD\d+/i.test(message)) {
    return 'ORDER_UPDATE';
  }

  return 'UNKNOWN';
}

/**
 * Parse machine update message
 * Format: "M03 STATUS=Running OUTPUT=130 OPERATOR=Arun"
 * @param {string} message - Raw WhatsApp message
 * @returns {Object|null} Parsed machine data
 */
export function parseMachineUpdate(message) {
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
      return null;
    }

    // Extract status
    const statusMatch = message.match(/STATUS[=:]?\s*(\w+)/i);
    if (statusMatch) {
      parsed.status = normalizeMachineStatus(statusMatch[1]);
    }

    // Extract output
    const outputMatch = message.match(/OUTPUT[=:]?\s*(\d+)/i);
    if (outputMatch) {
      parsed.output = parseInt(outputMatch[1], 10);
    }

    // Extract error message
    const errorMatch = message.match(/ERROR[=:]?\s*(.+?)(?:\s+(?:OPERATOR|STATUS|OUTPUT)|$)/i);
    if (errorMatch) {
      parsed.error_message = errorMatch[1].trim();
    }

    // Extract operator
    const operatorMatch = message.match(/OPERATOR[=:]?\s*(.+?)$/i);
    if (operatorMatch) {
      parsed.operator = operatorMatch[1].trim();
    }

    // Remove null values
    Object.keys(parsed).forEach((key) => {
      if (parsed[key] === null) {
        delete parsed[key];
      }
    });

    return parsed;
  } catch (error) {
    console.error('Error parsing machine update:', error);
    return null;
  }
}

/**
 * Parse safety update message
 * Format: "SAFETY WeldingZone PPE=Helmet,Gloves"
 * @param {string} message - Raw WhatsApp message
 * @returns {Object|null} Parsed safety data
 */
export function parseSafetyUpdate(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  try {
    const parsed = {
      area_name: null,
      zone: null,
      ppe_required: null,
      risk_level: null,
      status: null,
      notes: null,
    };

    // Extract zone name (after SAFETY keyword)
    const zoneMatch = message.match(/SAFETY\s+(\w+)/i);
    if (zoneMatch) {
      const zone = zoneMatch[1];
      parsed.zone = zone;
      parsed.area_name = `${zone}_Area`; // Generate area name
    } else {
      return null;
    }

    // Extract PPE requirements
    const ppeMatch = message.match(/PPE[=:]?\s*([^,]+(?:,\s*[^,]+)*)/i);
    if (ppeMatch) {
      parsed.ppe_required = ppeMatch[1].trim();
    }

    // Extract risk level
    const riskMatch = message.match(/RISK[=:]?\s*(Low|Medium|High|Critical)/i);
    if (riskMatch) {
      parsed.risk_level = riskMatch[1].charAt(0).toUpperCase() + riskMatch[1].slice(1).toLowerCase();
    } else {
      parsed.risk_level = 'Medium'; // Default
    }

    // Extract status
    const statusMatch = message.match(/STATUS[=:]?\s*(Safe|Warning|Critical|Maintenance)/i);
    if (statusMatch) {
      parsed.status = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
    } else {
      parsed.status = 'Safe'; // Default
    }

    // Extract notes
    const notesMatch = message.match(/NOTES[=:]?\s*(.+?)$/i);
    if (notesMatch) {
      parsed.notes = notesMatch[1].trim();
    }

    // Remove null values
    Object.keys(parsed).forEach((key) => {
      if (parsed[key] === null) {
        delete parsed[key];
      }
    });

    return parsed;
  } catch (error) {
    console.error('Error parsing safety update:', error);
    return null;
  }
}

/**
 * Parse order update message
 * Format: "ORDER ORD1024 STAGE=Packaging ETA=Nov-18"
 * @param {string} message - Raw WhatsApp message
 * @returns {Object|null} Parsed order data
 */
export function parseOrderUpdate(message) {
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

    // Extract order ID (ORD followed by digits or alphanumeric)
    const orderIdMatch = message.match(/ORD[A-Z0-9]+|\bORDER\s+([A-Z0-9]+)/i);
    if (orderIdMatch) {
      parsed.order_id = orderIdMatch[0].toUpperCase().replace(/^ORDER\s+/i, '');
      if (!parsed.order_id.startsWith('ORD')) {
        parsed.order_id = `ORD${parsed.order_id}`;
      }
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
    } else {
      parsed.status = 'Active'; // Default
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
    console.error('Error parsing order update:', error);
    return null;
  }
}

/**
 * Normalize machine status
 */
function normalizeMachineStatus(status) {
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const validStatuses = ['Running', 'Idle', 'Maintenance', 'Error'];
  
  if (normalized.includes('run')) return 'Running';
  if (normalized.includes('idle')) return 'Idle';
  if (normalized.includes('maintain')) return 'Maintenance';
  if (normalized.includes('error') || normalized.includes('down')) return 'Error';
  
  return normalized;
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

