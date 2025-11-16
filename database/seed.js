/**
 * Seed script to populate database with sample machine data
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const sampleMachines = [
  {
    machine_id: 'M01',
    name: 'CNC Machine 01',
    status: 'Running',
    output: 150,
    error_message: null,
    operator: 'Marudhachalam',
    last_updated: new Date(),
  },
  {
    machine_id: 'M02',
    name: 'Assembly Line 02',
    status: 'Idle',
    output: 0,
    error_message: null,
    operator: 'somasundram',
    last_updated: new Date(),
  },
  {
    machine_id: 'M03',
    name: 'Packaging Unit 03',
    status: 'Running',
    output: 120,
    error_message: null,
    operator: 'palanisamy',
    last_updated: new Date(),
  },
  {
    machine_id: 'M04',
    name: 'Quality Control Station 04',
    status: 'Maintenance',
    output: 0,
    error_message: 'Scheduled maintenance - calibration check',
    operator: "D raghavan",
    last_updated: new Date(),
  },
];

const sampleSafetyAreas = [
  {
    area_name: 'WeldingZone_Area',
    zone: 'WeldingZone',
    ppe_required: 'Helmet,Gloves,Safety Shoes,Protective Apron',
    risk_level: 'High',
    status: 'Safe',
    notes: null,
    last_inspection: new Date(),
  },
  {
    area_name: 'AssemblyZone_Area',
    zone: 'AssemblyZone',
    ppe_required: 'Helmet,Gloves,Safety Shoes',
    risk_level: 'Medium',
    status: 'Safe',
    notes: null,
    last_inspection: new Date(),
  },
  {
    area_name: 'PackagingZone_Area',
    zone: 'PackagingZone',
    ppe_required: 'Gloves,Safety Shoes',
    risk_level: 'Low',
    status: 'Warning',
    notes: 'Increased activity - monitor PPE compliance',
    last_inspection: new Date(),
  },
];

const sampleOrders = [
  {
    order_id: 'ORD1001',
    customer_name: 'Durai Kannan',
    stage: 'Production',
    priority: 'High',
    quantity: 500,
    materials: 'Steel,Plastic,Electronic Components',
    eta: 'Nov-20',
    status: 'Active',
    assigned_to: 'Production Team A',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    order_id: 'ORD1002',
    customer_name: 'Tech Solutions Inc',
    stage: 'Quality',
    priority: 'Medium',
    quantity: 200,
    materials: 'Aluminum,Plastic',
    eta: 'Nov-18',
    status: 'Active',
    assigned_to: 'Quality Team B',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    order_id: 'ORD1003',
    customer_name: 'Global Industries',
    stage: 'Packaging',
    priority: 'Urgent',
    quantity: 1000,
    materials: 'Steel,Plastic,Wood',
    eta: 'Nov-17',
    status: 'Active',
    assigned_to: 'Packaging Team C',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    order_id: 'ORD1004',
    customer_name: 'Local Manufacturing',
    stage: 'Planning',
    priority: 'Low',
    quantity: 150,
    materials: 'Steel,Plastic',
    eta: 'Nov-25',
    status: 'Active',
    assigned_to: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const sampleSafetyLogs = [
  {
    area_name: 'WeldingZone_Area',
    zone: 'WeldingZone',
    ppe_compliance: 'Compliant',
    incident_type: 'Inspection',
    description: 'Routine safety inspection - all PPE requirements met',
    reported_by: 'Safety Officer',
    created_at: new Date(),
  },
  {
    area_name: 'PackagingZone_Area',
    zone: 'PackagingZone',
    ppe_compliance: 'Partial',
    incident_type: 'NearMiss',
    description: 'Worker forgot safety glasses - reminder issued',
    reported_by: 'Supervisor',
    created_at: new Date(),
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Machines
  console.log('\n📦 Seeding machines...');
  for (const machine of sampleMachines) {
    const result = await prisma.machine.upsert({
      where: { machine_id: machine.machine_id },
      update: machine,
      create: machine,
    });
    console.log(`✓ Seeded machine: ${result.machine_id} - ${result.name}`);
  }

  // Seed Safety Areas
  console.log('\n🛡️ Seeding safety areas...');
  for (const area of sampleSafetyAreas) {
    const result = await prisma.safetyArea.upsert({
      where: { area_name: area.area_name },
      update: area,
      create: area,
    });
    console.log(`✓ Seeded safety area: ${result.area_name} - ${result.zone}`);
  }

  // Seed Orders
  console.log('\n📋 Seeding orders...');
  for (const order of sampleOrders) {
    const result = await prisma.order.upsert({
      where: { order_id: order.order_id },
      update: order,
      create: order,
    });
    console.log(`✓ Seeded order: ${result.order_id} - ${result.customer_name}`);
  }

  // Seed Safety Logs
  console.log('\n📝 Seeding safety logs...');
  for (const log of sampleSafetyLogs) {
    const result = await prisma.safetyLog.create({
      data: log,
    });
    console.log(`✓ Created safety log: ${result.id} - ${result.area_name}`);
  }

  console.log('\n✅ Database seeding completed!');
  console.log(`   - ${sampleMachines.length} machines`);
  console.log(`   - ${sampleSafetyAreas.length} safety areas`);
  console.log(`   - ${sampleOrders.length} orders`);
  console.log(`   - ${sampleSafetyLogs.length} safety logs`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

