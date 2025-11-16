-- CreateTable
CREATE TABLE "safety_areas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area_name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "ppe_required" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "last_inspection" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "safety_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area_name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "ppe_compliance" TEXT NOT NULL,
    "incident_type" TEXT,
    "description" TEXT,
    "reported_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "customer_name" TEXT,
    "stage" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "materials" TEXT,
    "eta" TEXT,
    "status" TEXT NOT NULL,
    "assigned_to" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "safety_areas_area_name_key" ON "safety_areas"("area_name");

-- CreateIndex
CREATE INDEX "safety_areas_area_name_idx" ON "safety_areas"("area_name");

-- CreateIndex
CREATE INDEX "safety_areas_zone_idx" ON "safety_areas"("zone");

-- CreateIndex
CREATE INDEX "safety_areas_status_idx" ON "safety_areas"("status");

-- CreateIndex
CREATE INDEX "safety_logs_area_name_idx" ON "safety_logs"("area_name");

-- CreateIndex
CREATE INDEX "safety_logs_created_at_idx" ON "safety_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_id_key" ON "orders"("order_id");

-- CreateIndex
CREATE INDEX "orders_order_id_idx" ON "orders"("order_id");

-- CreateIndex
CREATE INDEX "orders_stage_idx" ON "orders"("stage");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_priority_idx" ON "orders"("priority");
