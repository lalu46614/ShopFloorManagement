/**
 * Service layer for Shop Floor Management
 * Contains business logic for machine operations
 */

import { PrismaClient } from '@prisma/client';
import { applyStatusValidation } from './utils.js';

const prisma = new PrismaClient();

// Valid machine statuses
const VALID_STATUSES = ['Running', 'Idle', 'Maintenance', 'Error'];

/**
 * Get all machines
 * @returns {Promise<Array>} Array of all machines
 */
export async function getAllMachines() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: {
        last_updated: 'desc',
      },
    });
    return machines;
  } catch (error) {
    throw new Error(`Failed to fetch machines: ${error.message}`);
  }
}

/**
 * Get a single machine by machine_id
 * @param {string} machineId - The machine ID
 * @returns {Promise<Object|null>} Machine object or null if not found
 */
export async function getMachine(machineId) {
  try {
    const machine = await prisma.machine.findUnique({
      where: {
        machine_id: machineId,
      },
    });
    return machine;
  } catch (error) {
    throw new Error(`Failed to fetch machine ${machineId}: ${error.message}`);
  }
}

/**
 * Update a single machine
 * @param {string} machineId - The machine ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated machine object
 */
export async function updateMachine(machineId, updateData) {
  try {
    // Validate status if provided
    if (updateData.status && !VALID_STATUSES.includes(updateData.status)) {
      throw new Error(
        `Invalid status: ${updateData.status}. Must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }

    // Apply status validation rules
    updateData = applyStatusValidation(updateData);

    // Ensure last_updated is set to current time
    const dataToUpdate = {
      ...updateData,
      last_updated: new Date(),
    };

    const machine = await prisma.machine.upsert({
      where: {
        machine_id: machineId,
      },
      update: dataToUpdate,
      create: {
        machine_id: machineId,
        name: updateData.name || `Machine ${machineId}`,
        status: updateData.status || 'Idle',
        output: updateData.output ?? 0,
        error_message: updateData.error_message ?? null,
        operator: updateData.operator ?? null,
        last_updated: new Date(),
      },
    });

    return machine;
  } catch (error) {
    throw new Error(`Failed to update machine ${machineId}: ${error.message}`);
  }
}

/**
 * Batch update multiple machines
 * @param {Array} machinesData - Array of machine update objects
 * @returns {Promise<Array>} Array of updated machines
 */
export async function batchUpdateMachines(machinesData) {
  try {
    if (!Array.isArray(machinesData)) {
      throw new Error('Expected an array of machines');
    }

    const results = [];

    // Process each machine update
    for (const machineData of machinesData) {
      if (!machineData.machine_id) {
        results.push({
          success: false,
          machine_id: machineData.machine_id || 'unknown',
          error: 'machine_id is required',
        });
        continue;
      }

      try {
        const updated = await updateMachine(machineData.machine_id, machineData);
        results.push({
          success: true,
          machine: updated,
        });
      } catch (error) {
        results.push({
          success: false,
          machine_id: machineData.machine_id,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to batch update machines: ${error.message}`);
  }
}

/**
 * Get Prisma client instance (for advanced queries if needed)
 * @returns {PrismaClient} Prisma client instance
 */
export function getPrismaClient() {
  return prisma;
}

