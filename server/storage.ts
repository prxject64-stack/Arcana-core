import { db } from "./db";
import {
  users, wallets, transactions, blocks,
  type User, type InsertUser, type Wallet, type Transaction, type Block
} from "@shared/schema";
import { eq, desc, sql, or } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wallet
  getWallet(userId: number): Promise<Wallet | undefined>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  createWallet(userId: number): Promise<Wallet>;
  updateWalletBalance(id: number, newBalance: string): Promise<Wallet>;

  // Transactions
  createTransaction(tx: Omit<Transaction, "id" | "timestamp" | "blockHeight" | "status">): Promise<Transaction>;
  getTransactionsForAddress(address: string): Promise<Transaction[]>;

  // Network/Blocks
  createBlock(block: Omit<Block, "id" | "timestamp">): Promise<Block>;
  getLatestBlock(): Promise<Block | undefined>;
  getBlocks(limit: number): Promise<Block[]>;
  getBlockByHeight(height: number): Promise<(Block & { transactions: Transaction[] }) | undefined>;
  getTransactionByHash(hash: string): Promise<Transaction | undefined>;
  getTransactionsByBlockHeight(height: number): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getWallet(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address));
    return wallet;
  }

  async createWallet(userId: number): Promise<Wallet> {
    // Generate a fake Monero-like address (starts with '4' or '8', 95 chars)
    // For simplicity, we'll do 'arc' + random hex
    const address = 'arc' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const [wallet] = await db.insert(wallets).values({
      userId,
      address,
      balance: "0",
    }).returning();
    return wallet;
  }

  async updateWalletBalance(id: number, newBalance: string): Promise<Wallet> {
    const [wallet] = await db.update(wallets)
      .set({ balance: newBalance })
      .where(eq(wallets.id, id))
      .returning();
    return wallet;
  }

  async createTransaction(tx: Omit<Transaction, "id" | "timestamp" | "blockHeight" | "status">): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values({
      ...tx,
      status: 'confirmed', // Instant confirmation for demo
    }).returning();
    return transaction;
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(
        or(
          eq(transactions.fromAddress, address),
          eq(transactions.toAddress, address)
        )
      )
      .orderBy(desc(transactions.timestamp))
      .limit(50);
  }

  async createBlock(block: Omit<Block, "id" | "timestamp">): Promise<Block> {
    const [newBlock] = await db.insert(blocks).values(block).returning();
    return newBlock;
  }

  async getLatestBlock(): Promise<Block | undefined> {
    const [block] = await db.select()
      .from(blocks)
      .orderBy(desc(blocks.height))
      .limit(1);
    return block;
  }

  async getBlockByHeight(height: number): Promise<Block | undefined> {
    const [block] = await db.select()
      .from(blocks)
      .where(eq(blocks.height, height));
    return block;
  }

  async getTransactionsByBlock(height: number): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.blockHeight, height));
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    const [tx] = await db.select()
      .from(transactions)
      .where(eq(transactions.hash, hash));
    return tx;
  }

  async getBlocks(limit: number): Promise<Block[]> {
    return await db.select()
      .from(blocks)
      .orderBy(desc(blocks.height))
      .limit(limit);
  }

  async getBlockByHeight(height: number): Promise<(Block & { transactions: Transaction[] }) | undefined> {
    const [block] = await db.select().from(blocks).where(eq(blocks.height, height));
    if (!block) return undefined;
    const txs = await this.getTransactionsByBlockHeight(height);
    return { ...block, transactions: txs };
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.hash, hash));
    return tx;
  }

  async getTransactionsByBlockHeight(height: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.blockHeight, height));
  }
  async getBlock(height: number): Promise<Block & { transactions: Transaction[] }> {
    const [block] = await db.select().from(blocks).where(eq(blocks.height, height));
    if (!block) throw new Error("Block not found");
    const txs = await db.select().from(transactions).where(eq(transactions.blockHeight, height));
    return { ...block, transactions: txs };
  }

  async getTransaction(hash: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.hash, hash));
    return tx;
  }
  async getBlockByHeight(height: number): Promise<Block & { transactions: Transaction[] } | undefined> {
    const [block] = await db.select().from(blocks).where(eq(blocks.height, height));
    if (!block) return undefined;
    const txs = await db.select().from(transactions).where(eq(transactions.blockHeight, height));
    return { ...block, transactions: txs };
  }

  async getTransactionByHash(hash: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.hash, hash));
    return tx;
  }
}

export const storage = new DatabaseStorage();
