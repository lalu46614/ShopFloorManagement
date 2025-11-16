/**
 * Service layer for Safety Management
 * Contains business logic for safety operations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Valid safety statuses
const VALID_STATUSES = ['Safe', 'Warning', 'Critical', 'Maintenance'];
const VALID_RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const VALID_PPE_COMPLIANCE = ['Compliant', 'NonCompliant', 'Partial'];

/**
 * Get all safety areas
 * @returns {Promise<Array>} Array of all safety areas
 */
export async function getAllSafetyAreas() {
  try {
    const areas = await prisma.safetyArea.findMany({
      orderBy: {
        last_inspection: 'desc',
      },
    });
    return areas;
  } catch (error) {
    throw new Error(`Failed to fetch safety areas: ${error.message}`);
  }
}

/**
 * Get a single safety area by area_name
 * @param {string} areaName - The area name
 * @returns {Promise<Object|null>} Safety area object or null if not found
 */
export async function getSafetyArea(areaName) {
  try {
    const area = await prisma.safetyArea.findUnique({
      where: {
        area_name: areaName,
      },
    });
    return area;
  } catch (error) {
    throw new Error(`Failed to fetch safety area ${areaName}: ${error.message}`);
  }
}

/**
 * Update or create a safety area
 * @param {string} areaName - The area name
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated safety area object
 */
export async function updateSafetyArea(areaName, updateData) {
  try {
    // Validate status if provided
    if (updateData.status && !VALID_STATUSES.includes(updateData.status)) {
      throw new Error(
        `Invalid status: ${updateData.status}. Must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }

    // Validate risk level if provided
    if (updateData.risk_level && !VALID_RISK_LEVELS.includes(updateData.risk_level)) {
      throw new Error(
        `Invalid risk_level: ${updateData.risk_level}. Must be one of: ${VALID_RISK_LEVELS.join(', ')}`
      );
    }

    // Ensure last_inspection is set to current time
    const dataToUpdate = {
      ...updateData,
      last_inspection: new Date(),
    };

    const area = await prisma.safetyArea.upsert({
      where: {
        area_name: areaName,
      },
      update: dataToUpdate,
      create: {
        area_name: areaName,
        zone: updateData.zone || areaName.replace('_Area', ''),
        ppe_required: updateData.ppe_required || 'Helmet,Gloves,Safety Shoes',
        risk_level: updateData.risk_level || 'Medium',
        status: updateData.status || 'Safe',
        notes: updateData.notes ?? null,
        last_inspection: new Date(),
      },
    });

    return area;
  } catch (error) {
    throw new Error(`Failed to update safety area ${areaName}: ${error.message}`);
  }
}

/**
 * Create a safety log entry
 * @param {Object} logData - Log data
 * @returns {Promise<Object>} Created safety log
 */
export async function createSafetyLog(logData) {
  try {
    if (logData.ppe_compliance && !VALID_PPE_COMPLIANCE.includes(logData.ppe_compliance)) {
      throw new Error(
        `Invalid ppe_compliance: ${logData.ppe_compliance}. Must be one of: ${VALID_PPE_COMPLIANCE.join(', ')}`
      );
    }

    const log = await prisma.safetyLog.create({
      data: {
        area_name: logData.area_name,
        zone: logData.zone || logData.area_name.replace('_Area', ''),
        ppe_compliance: logData.ppe_compliance || 'Compliant',
        incident_type: logData.incident_type || null,
        description: logData.description || null,
        reported_by: logData.reported_by || null,
        created_at: new Date(),
      },
    });

    return log;
  } catch (error) {
    throw new Error(`Failed to create safety log: ${error.message}`);
  }
}

/**
 * Get safety logs for an area
 * @param {string} areaName - Area name (optional)
 * @returns {Promise<Array>} Array of safety logs
 */
export async function getSafetyLogs(areaName = null) {
  try {
    const where = areaName ? { area_name: areaName } : {};
    
    const logs = await prisma.safetyLog.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      take: 100, // Limit to recent 100 logs
    });
    return logs;
  } catch (error) {
    throw new Error(`Failed to fetch safety logs: ${error.message}`);
  }
}

/**
 * Parse safety codes and return formatted data
 * @param {string} codes - Safety codes string
 * @returns {Object} Parsed safety codes
 */
export function parseSafetyCodes(codes) {
  if (!codes || typeof codes !== 'string') {
    return {};
  }

  const parsed = {};
  const parts = codes.split(',').map((p) => p.trim());

  // Parse PPE requirements
  if (codes.includes('PPE')) {
    const ppeMatch = codes.match(/PPE[=:]?\s*([^,]+(?:,\s*[^,]+)*)/i);
    if (ppeMatch) {
      parsed.ppe_required = ppeMatch[1].trim();
    }
  }

  // Parse risk level
  const riskLevels = ['Critical', 'High', 'Medium', 'Low'];
  for (const level of riskLevels) {
    if (codes.toUpperCase().includes(level.toUpperCase())) {
      parsed.risk_level = level;
      break;
    }
  }

  return parsed;
}

/**
 * Get safety status summary for LLM
 * @returns {Promise<Object>} Safety status summary
 */
export async function getSafetyStatus() {
  try {
    const areas = await getAllSafetyAreas();
    const logs = await getSafetyLogs();

    // Calculate statistics
    const stats = {
      total_areas: areas.length,
      safe: areas.filter((a) => a.status === 'Safe').length,
      warning: areas.filter((a) => a.status === 'Warning').length,
      critical: areas.filter((a) => a.status === 'Critical').length,
      maintenance: areas.filter((a) => a.status === 'Maintenance').length,
      recent_logs_count: logs.length,
    };

    return {
      areas,
      logs: logs.slice(0, 10), // Recent 10 logs
      statistics: stats,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get safety status: ${error.message}`);
  }
}

