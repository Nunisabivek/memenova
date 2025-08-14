import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // AI Providers
  OPENAI_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  
  // App Config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  JWT_SECRET: z.string().min(32).optional(),
  
  // Storage
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  
  // AWS S3 (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_BUCKET_NAME: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

// Only validate env in runtime, not during build
export const env = process.env.NODE_ENV === 'production' && !process.env.SKIP_ENV_VALIDATION 
  ? envSchema.parse(process.env)
  : envSchema.safeParse(process.env).data || {}
