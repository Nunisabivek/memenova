@echo off
echo Creating environment files for MemeNova...
echo.

REM Create backend .env file
echo # ============================================================================= > backend\.env
echo # BACKEND ENVIRONMENT CONFIGURATION >> backend\.env
echo # ============================================================================= >> backend\.env
echo # Replace the placeholder values below with your actual credentials >> backend\.env
echo. >> backend\.env
echo # DATABASE CONFIGURATION >> backend\.env
echo # Replace [YOUR-PASSWORD] with your actual Supabase database password >> backend\.env
echo DATABASE_URL="postgresql://postgres.muzjjabmqnevmviqntuo:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres" >> backend\.env
echo DIRECT_URL="postgresql://postgres.muzjjabmqnevmviqntuo:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" >> backend\.env
echo. >> backend\.env
echo # AI PROVIDERS >> backend\.env
echo OPENAI_API_KEY="sk-your-openai-api-key-here" >> backend\.env
echo GEMINI_API_KEY="your-gemini-api-key-here" >> backend\.env
echo. >> backend\.env
echo # SUPABASE >> backend\.env
echo SUPABASE_URL="https://your-project.supabase.co" >> backend\.env
echo SUPABASE_ANON_KEY="your-supabase-anon-key-here" >> backend\.env
echo SUPABASE_SERVICE_ROLE="your-supabase-service-role-key-here" >> backend\.env
echo SUPABASE_BUCKET="memenova-assets" >> backend\.env
echo. >> backend\.env
echo # APP CONFIGURATION >> backend\.env
echo NODE_ENV="development" >> backend\.env
echo PORT=3001 >> backend\.env
echo JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long" >> backend\.env
echo LOG_LEVEL="info" >> backend\.env
echo. >> backend\.env
echo # OPTIONAL >> backend\.env
echo # REDIS_URL="redis://localhost:6379" >> backend\.env

REM Create frontend .env.local file
echo # ============================================================================= > frontend\.env.local
echo # FRONTEND ENVIRONMENT CONFIGURATION >> frontend\.env.local
echo # ============================================================================= >> frontend\.env.local
echo # Replace the placeholder values below with your actual credentials >> frontend\.env.local
echo. >> frontend\.env.local
echo # API CONFIGURATION >> frontend\.env.local
echo NEXT_PUBLIC_API_URL="http://localhost:3001" >> frontend\.env.local
echo. >> frontend\.env.local
echo # SUPABASE CLIENT >> frontend\.env.local
echo NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" >> frontend\.env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here" >> frontend\.env.local
echo. >> frontend\.env.local
echo # OPTIONAL >> frontend\.env.local
echo # NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX" >> frontend\.env.local
echo # NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-xxxxxxxxxx" >> frontend\.env.local

echo.
echo ✅ Environment files created successfully!
echo.
echo 📝 Next steps:
echo 1. Edit backend\.env and replace placeholder values with your actual credentials
echo 2. Edit frontend\.env.local and replace placeholder values with your actual credentials
echo 3. Run: cd backend ^&^& npx prisma migrate dev
echo 4. Run: cd backend ^&^& npx prisma generate
echo 5. Start backend: cd backend ^&^& npm run dev
echo 6. Start frontend: cd frontend ^&^& npm run dev
echo.
echo 🔐 Remember: Never commit .env files to git!
echo.
pause
