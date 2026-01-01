import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  address: text("address").notNull().unique(),
  balance: numeric("balance", { precision: 20, scale: 8 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  fromAddress: text("from_address"), // Null for mining rewards (coinbase)
  toAddress: text("to_address").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  fee: numeric("fee", { precision: 20, scale: 8 }).default("0"),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status", { enum: ["pending", "confirmed", "failed"] }).default("pending"),
  blockHeight: integer("block_height"),
});

export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  height: integer("height").notNull().unique(),
  hash: text("hash").notNull().unique(),
  previousHash: text("previous_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  difficulty: numeric("difficulty"),
  nonce: integer("nonce"),
  merkleRoot: text("merkle_root"),
  transactionCount: integer("transaction_count").default(0),
  size: integer("size").default(0),
});

// === RELATIONS ===
export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, userId: true, createdAt: true, balance: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, hash: true, timestamp: true, status: true, blockHeight: true });

// === EXPLICIT API CONTRACT TYPES ===
export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Block = typeof blocks.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;

// Request types
export type CreateTransactionRequest = {
  toAddress: string;
  amount: string;
};

export type MineBlockRequest = {
  minerAddress: string;
};

export type BlockWithTransactions = Block & {
  transactions: Transaction[];
};

// Response types
export type WalletResponse = Wallet & {
  recentTransactions?: Transaction[];
};

export type TransactionResponse = Transaction;
export type BlockResponse = Block;

export type NetworkStatsResponse = {
  hashrate: string;
  difficulty: string;
  height: number;
  supply: string;
};
