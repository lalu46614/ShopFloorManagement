/**
 * Data Model for Shop Floor Management
 * 
 * Note: This module uses Prisma ORM for database operations.
 * The actual schema is defined in database/schema.prisma
 * 
 * Machine Model Structure:
 * {
 *   id: string (UUID) - Auto-generated
 *   machine_id: string (unique) - e.g., "M01", "M02", "M03"
 *   name: string - Machine name/description
 *   status: string - One of: "Running" | "Idle" | "Maintenance" | "Error"
 *   output: number - Current production output
 *   last_updated: Date - Timestamp of last update
 *   error_message: string | null - Error description (required if status is "Error")
 *   operator: string | null - Name of operator assigned to machine
 * }
 * 
 * Usage:
 * Import PrismaClient directly or use service layer functions:
 * 
 * import { PrismaClient } from '@prisma/client';
 * const prisma = new PrismaClient();
 * 
 * Or use service functions:
 * import * as service from './service.js';
 */

export const MachineStatus = {
  RUNNING: 'Running',
  IDLE: 'Idle',
  MAINTENANCE: 'Maintenance',
  ERROR: 'Error',
};

export const VALID_STATUSES = Object.values(MachineStatus);

/**
 * Machine data structure interface (TypeScript-like documentation)
 * @typedef {Object} MachineData
 * @property {string} machine_id - Unique machine identifier (e.g., "M01")
 * @property {string} name - Machine name
 * @property {string} status - Machine status (Running | Idle | Maintenance | Error)
 * @property {number} output - Production output value
 * @property {Date} last_updated - Last update timestamp
 * @property {string|null} error_message - Error message if status is Error
 * @property {string|null} operator - Operator name
 */

export default {
  MachineStatus,
  VALID_STATUSES,
};

