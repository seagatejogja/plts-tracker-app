-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "reorder_point" INTEGER NOT NULL DEFAULT 5,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT
);

-- CreateTable
CREATE TABLE "installers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pic_name" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "price_scheme" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT
);

-- CreateTable
CREATE TABLE "stock_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_number" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "entry_date" DATETIME NOT NULL,
    "qty_in" INTEGER NOT NULL,
    "hpp_per_unit" REAL NOT NULL,
    "total_hpp" REAL NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT,
    CONSTRAINT "stock_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sales_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoice_number" TEXT NOT NULL,
    "sale_date" DATETIME NOT NULL,
    "installer_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "qty_sold" INTEGER NOT NULL,
    "hpp_per_unit" REAL NOT NULL,
    "selling_price_per_unit" REAL NOT NULL,
    "total_hpp" REAL NOT NULL,
    "total_revenue" REAL NOT NULL,
    "gross_profit" REAL NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'Belum Bayar',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT,
    CONSTRAINT "sales_transactions_installer_id_fkey" FOREIGN KEY ("installer_id") REFERENCES "installers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_transactions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "stock_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "monthly_summaries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year_month" TEXT NOT NULL,
    "total_revenue" REAL NOT NULL DEFAULT 0,
    "total_hpp" REAL NOT NULL DEFAULT 0,
    "gross_profit" REAL NOT NULL DEFAULT 0,
    "operational_cost" REAL NOT NULL DEFAULT 0,
    "net_profit" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "is_finalized" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT
);

-- CreateTable
CREATE TABLE "profit_sharing_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "party_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "share_percentage" REAL NOT NULL,
    "effective_from" DATETIME NOT NULL,
    "effective_to" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT
);

-- CreateTable
CREATE TABLE "profit_sharing_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monthly_summary_id" TEXT NOT NULL,
    "party_config_id" TEXT NOT NULL,
    "amount_due" REAL NOT NULL,
    "amount_paid" REAL NOT NULL DEFAULT 0,
    "paid_date" DATETIME,
    "payment_proof_url" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT,
    CONSTRAINT "profit_sharing_payments_monthly_summary_id_fkey" FOREIGN KEY ("monthly_summary_id") REFERENCES "monthly_summaries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "profit_sharing_payments_party_config_id_fkey" FOREIGN KEY ("party_config_id") REFERENCES "profit_sharing_config" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "installers_code_key" ON "installers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stock_batches_batch_number_key" ON "stock_batches"("batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_summaries_year_month_key" ON "monthly_summaries"("year_month");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
