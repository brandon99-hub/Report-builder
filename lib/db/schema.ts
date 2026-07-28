import { pgTable, text, timestamp, boolean, jsonb, integer, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Helper function to generate IDs - using nanoid-like approach
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(generateId),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("email_idx").on(table.email),
}))

// Sessions table (for NextAuth)
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().$defaultFn(generateId),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
}, (table) => ({
  sessionTokenIdx: uniqueIndex("session_token_idx").on(table.sessionToken),
  userIdIdx: index("user_id_idx").on(table.userId),
}))

// Accounts table (for OAuth providers)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(generateId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
}, (table) => ({
  userIdIdx: index("account_user_id_idx").on(table.userId),
  providerIdx: uniqueIndex("provider_idx").on(table.provider, table.providerAccountId),
}))

// Verification tokens (for NextAuth)
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex("verification_token_idx").on(table.identifier, table.token),
}))

// Templates table
export const templates = pgTable("templates", {
  id: text("id").primaryKey().$defaultFn(generateId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("SIMPLE"), // SIMPLE, MODERN, CORPORATE, etc.
  thumbnail: text("thumbnail"),
  schema: jsonb("schema").notNull(), // InvoiceSchema
  templateId: text("template_id").notNull(), // "simple", "modern", "corporate"
  modules: jsonb("modules"), // RDLModule[]
  calculatedFields: jsonb("calculated_fields"), // CalculatedField[]
  rdlXml: text("rdl_xml"),
  isPublic: boolean("is_public").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  rating: integer("rating"), // 1-5 stars
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("template_user_id_idx").on(table.userId),
  createdAtIdx: index("template_created_at_idx").on(table.createdAt),
  categoryIdx: index("template_category_idx").on(table.category),
}))

// Invoices table
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(generateId),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: text("template_id").references(() => templates.id, { onDelete: "set null" }),
  invoiceNumber: text("invoice_number").notNull(),
  schema: jsonb("schema").notNull(), // InvoiceSchema
  rdlXml: text("rdl_xml").notNull(),
  pdfUrl: text("pdf_url"),
  status: text("status").notNull().default("DRAFT"), // DRAFT, GENERATED, SENT, PAID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("invoice_user_id_idx").on(table.userId),
  templateIdIdx: index("invoice_template_id_idx").on(table.templateId),
  statusIdx: index("invoice_status_idx").on(table.status),
  createdAtIdx: index("invoice_created_at_idx").on(table.createdAt),
  invoiceNumberIdx: uniqueIndex("invoice_number_idx").on(table.invoiceNumber),
}))

// Invoice Items table (line items for each invoice)
export const invoiceItems = pgTable("invoice_items", {
  id: text("id").primaryKey().$defaultFn(generateId),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  itemCode: text("item_code"), // SKU/Product ID
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull().default(0), // Store as cents/smallest unit
  discount: integer("discount").default(0), // Store as cents
  taxRate: integer("tax_rate").default(0), // Store as basis points (e.g., 1600 = 16%)
  lineTotal: integer("line_total").notNull(), // Store as cents
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  invoiceIdIdx: index("invoice_item_invoice_id_idx").on(table.invoiceId),
  sortOrderIdx: index("invoice_item_sort_order_idx").on(table.sortOrder),
}))

// Template versions table
export const templateVersions = pgTable("template_versions", {
  id: text("id").primaryKey().$defaultFn(generateId),
  templateId: text("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  schema: jsonb("schema").notNull(),
  rdlXml: text("rdl_xml"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  templateIdIdx: index("version_template_id_idx").on(table.templateId),
  createdAtIdx: index("version_created_at_idx").on(table.createdAt),
}))

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates),
  invoices: many(invoices),
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  versions: many(templateVersions),
  invoices: many(invoices),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  template: one(templates, {
    fields: [invoices.templateId],
    references: [templates.id],
  }),
  items: many(invoiceItems),
}))

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}))

export const templateVersionsRelations = relations(templateVersions, ({ one }) => ({
  template: one(templates, {
    fields: [templateVersions.templateId],
    references: [templates.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

