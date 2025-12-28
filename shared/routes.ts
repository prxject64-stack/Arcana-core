import { z } from 'zod';
import { insertUserSchema, insertTransactionSchema, users, wallets, transactions, blocks } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), username: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), username: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({ id: z.number(), username: z.string() }).nullable(),
      },
    }
  },
  wallet: {
    get: {
      method: 'GET' as const,
      path: '/api/wallet',
      responses: {
        200: z.custom<typeof wallets.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/wallet',
      responses: {
        201: z.custom<typeof wallets.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  transactions: {
    send: {
      method: 'POST' as const,
      path: '/api/transactions/send',
      input: z.object({ toAddress: z.string(), amount: z.string() }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  network: {
    mine: {
      method: 'POST' as const,
      path: '/api/mine',
      responses: {
        200: z.object({ 
          message: z.string(), 
          reward: z.string(), 
          block: z.custom<typeof blocks.$inferSelect>() 
        }),
        401: errorSchemas.unauthorized,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/network/stats',
      responses: {
        200: z.object({
          hashrate: z.string(),
          difficulty: z.string(),
          height: z.number(),
          supply: z.string(),
        }),
      },
    },
    blocks: {
      method: 'GET' as const,
      path: '/api/blocks',
      responses: {
        200: z.array(z.custom<typeof blocks.$inferSelect>()),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LoginRequest = z.infer<typeof api.auth.login.input>;
export type RegisterRequest = z.infer<typeof api.auth.register.input>;
export type SendTransactionRequest = z.infer<typeof api.transactions.send.input>;
