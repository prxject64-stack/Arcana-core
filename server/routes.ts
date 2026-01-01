import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- AUTH SETUP ---
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000,
      }),
      cookie: { secure: false }, // set to true in production with https
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false);

        const [salt, hash] = user.password.split(".");
        const hashBuf = (await scryptAsync(password, salt, 64)) as Buffer;
        
        if (timingSafeEqual(Buffer.from(hash, "hex"), hashBuf)) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // --- API ROUTES ---

  // Auth
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const salt = randomBytes(16).toString("hex");
      const hash = (await scryptAsync(input.password, salt, 64)) as Buffer;
      const hashedPassword = `${salt}.${hash.toString("hex")}`;

      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      // Create wallet for new user
      await storage.createWallet(user.id);

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ id: user.id, username: user.username });
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        next(err);
      }
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    if (req.user) {
      res.status(200).json({ id: (req.user as any).id, username: (req.user as any).username });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.status(200).send();
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ id: (req.user as any).id, username: (req.user as any).username });
    } else {
      res.json(null);
    }
  });

  // Wallet
  app.get(api.wallet.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    
    const wallet = await storage.getWallet((req.user as any).id);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.json(wallet);
  });

  app.post(api.wallet.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const wallet = await storage.createWallet((req.user as any).id);
    res.status(201).json(wallet);
  });

  // Transactions
  app.get(api.transactions.history.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const wallet = await storage.getWallet((req.user as any).id);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    
    const txs = await storage.getTransactionsForAddress(wallet.address);
    res.json(txs);
  });

  app.post(api.transactions.send.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    
    try {
      const { toAddress, amount } = api.transactions.send.input.parse(req.body);
      const fromWallet = await storage.getWallet((req.user as any).id);
      
      if (!fromWallet) return res.status(404).json({ message: "No wallet found" });
      if (parseFloat(fromWallet.balance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      const toWallet = await storage.getWalletByAddress(toAddress);
      if (!toWallet) return res.status(400).json({ message: "Recipient address invalid" });

      // Update balances
      const newFromBalance = (parseFloat(fromWallet.balance) - parseFloat(amount)).toFixed(8);
      const newToBalance = (parseFloat(toWallet.balance) + parseFloat(amount)).toFixed(8);

      await storage.updateWalletBalance(fromWallet.id, newFromBalance);
      await storage.updateWalletBalance(toWallet.id, newToBalance);

      const tx = await storage.createTransaction({
        hash: 'tx' + randomBytes(32).toString('hex'),
        fromAddress: fromWallet.address,
        toAddress: toAddress,
        amount: amount,
        fee: "0.001",
      });

      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Network / Mining
  app.get(api.network.blocks.path, async (req, res) => {
    const blocks = await storage.getBlocks(20);
    res.json(blocks);
  });

  app.post(api.network.mine.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    
    const wallet = await storage.getWallet((req.user as any).id);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Simulate mining reward
    const reward = "10.00000000";
    const newBalance = (parseFloat(wallet.balance) + parseFloat(reward)).toFixed(8);
    
    await storage.updateWalletBalance(wallet.id, newBalance);

    const latestBlock = await storage.getLatestBlock();
    const newHeight = (latestBlock?.height || 0) + 1;
    const previousHash = latestBlock?.hash || "00000000000000000000000000000000";
    const newHash = '00' + randomBytes(30).toString('hex');

    const block = await storage.createBlock({
      height: newHeight,
      hash: newHash,
      previousHash: previousHash,
      difficulty: "123456",
      nonce: Math.floor(Math.random() * 1000000),
    });

    // Create coinbase transaction
    await storage.createTransaction({
      hash: 'cb' + randomBytes(32).toString('hex'),
      fromAddress: null, // Coinbase
      toAddress: wallet.address,
      amount: reward,
      fee: "0",
    });

    res.json({ message: "Block found!", reward, block });
  });

  app.get(api.network.stats.path, async (req, res) => {
    const latest = await storage.getLatestBlock();
    res.json({
      hashrate: (Math.random() * 50 + 100).toFixed(2) + " MH/s",
      difficulty: latest?.difficulty || "1000",
      height: latest?.height || 0,
      supply: "18000000.00", // Fake fixed supply
    });
  });

  app.get(api.network.block.path, async (req, res) => {
    const height = parseInt(req.params.height);
    if (isNaN(height)) return res.status(400).json({ message: "Invalid block height" });
    const block = await storage.getBlockByHeight(height);
    if (!block) return res.status(404).json({ message: "Block not found" });
    res.json(block);
  });

  app.get(api.network.transaction.path, async (req, res) => {
    const tx = await storage.getTransactionByHash(req.params.hash);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.json(tx);
  });

  // Seed genesis block if empty
  const latest = await storage.getLatestBlock();
  if (!latest) {
    await storage.createBlock({
      height: 0,
      hash: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
      previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
      difficulty: "1",
      nonce: 0
    });
    console.log("Genesis block created");
  }

  return httpServer;
}
