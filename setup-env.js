#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve)
  })
}

async function setupEnvironment() {
  console.log('🚀 MemeNova Environment Setup\n')
  console.log('This script will help you configure your environment variables.\n')
  
  // Database configuration
  console.log('📊 DATABASE CONFIGURATION')
  const dbPassword = await question('Enter your Supabase database password: ')
  const databaseUrl = `postgresql://postgres.muzjjabmqnevmviqntuo:${dbPassword}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`
  const directUrl = `postgresql://postgres.muzjjabmqnevmviqntuo:${dbPassword}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
  
  // Supabase configuration
  console.log('\n🏗️  SUPABASE CONFIGURATION')
  const supabaseUrl = await question('Enter your Supabase URL: ')
  const supabaseAnonKey = await question('Enter your Supabase Anon Key: ')
  const supabaseServiceKey = await question('Enter your Supabase Service Key: ')
  
  // AI API Keys
  console.log('\n🤖 AI PROVIDERS')
  const openaiKey = await question('Enter your OpenAI API key: ')
  const geminiKey = await question('Enter your Gemini API key: ')
  
  // Generate JWT secret
  const jwtSecret = require('crypto').randomBytes(32).toString('hex')
  
  // Create backend .env
  const backendEnv = `# Database
DATABASE_URL="${databaseUrl}"
DIRECT_URL="${directUrl}"

# AI Providers
OPENAI_API_KEY="${openaiKey}"
GEMINI_API_KEY="${geminiKey}"

# Supabase
SUPABASE_URL="${supabaseUrl}"
SUPABASE_ANON_KEY="${supabaseAnonKey}"
SUPABASE_SERVICE_ROLE="${supabaseServiceKey}"
SUPABASE_BUCKET="memenova-assets"

# App Configuration
NODE_ENV="development"
PORT=3001
JWT_SECRET="${jwtSecret}"
LOG_LEVEL="info"

# Redis (optional - for video processing)
# REDIS_URL="redis://localhost:6379"
`

  // Create frontend .env.local
  const frontendEnv = `# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Supabase (for client-side)
NEXT_PUBLIC_SUPABASE_URL="${supabaseUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${supabaseAnonKey}"

# Optional: Google Analytics
# NEXT_PUBLIC_GA_ID="your-ga-id"

# Optional: AdSense
# NEXT_PUBLIC_ADSENSE_CLIENT="your-adsense-client-id"
`

  // Write files
  try {
    fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv)
    console.log('✅ Created backend/.env')
    
    fs.writeFileSync(path.join(__dirname, 'frontend', '.env.local'), frontendEnv)
    console.log('✅ Created frontend/.env.local')
    
    console.log('\n🎉 Environment setup complete!')
    console.log('\nNext steps:')
    console.log('1. Run database migrations: cd backend && npx prisma migrate dev')
    console.log('2. Generate Prisma client: cd backend && npx prisma generate')
    console.log('3. Start the backend: cd backend && npm run dev')
    console.log('4. Start the frontend: cd frontend && npm run dev')
    console.log('\n📖 Your application will be available at:')
    console.log('   Frontend: http://localhost:3000')
    console.log('   Backend API: http://localhost:3001')
    
  } catch (error) {
    console.error('❌ Error creating environment files:', error.message)
  }
  
  rl.close()
}

setupEnvironment().catch(console.error)
