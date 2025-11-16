-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "machine_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "output" INTEGER NOT NULL DEFAULT 0,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "operator" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "machines_machine_id_key" ON "machines"("machine_id");

-- CreateIndex
CREATE INDEX "machines_machine_id_idx" ON "machines"("machine_id");

-- CreateIndex
CREATE INDEX "machines_status_idx" ON "machines"("status");
