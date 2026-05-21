# 💻 LOCAL DEVELOPMENT SETUP GUIDE

## Prerequisites Check

Before starting, verify you have:

```bash
# Node.js 18+ installed
node --version          # Should be v18.0.0 or higher

# npm installed
npm --version          # Should be 9+

# Git installed
git --version          # Any recent version

# PostgreSQL installed (local) OR Docker (simpler)
# Option 1 (Windows):
#   - Download from https://www.postgresql.org/download/windows/
#   - Install with default settings
#   - Note the password you set
#
# Option 2 (Docker - Recommended):
#   - Install Docker Desktop from https://www.docker.com
#   - No need to install PostgreSQL separately!
```

---

## Step 1: Clone/Setup Your Project

```bash
# Navigate to your project
cd "d:\TimeBank Project\TimeBank Project"

# Initialize git if not done
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Final evaluation setup"
```

---

## Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list | head -20

# Expected packages:
# ✓ express
# ✓ @prisma/client       (PostgreSQL ORM)
# ✓ multer               (File uploads)
# ✓ cloudinary           (Cloud storage)
# ✓ jest                 (Testing)
```

---

## Step 3: Setup Environment Variables

### Option 1: Simple (Development Only)

Create `.env` file in project root:

```bash
# Copy template
cp .env.example .env

# Edit .env with your settings
```

Edit the `.env` file and set:

```
# Local PostgreSQL (if running locally)
DATABASE_URL="postgresql://postgres:password@localhost:5432/timebank"

# Or PostgreSQL in Docker (easier)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/timebank"

# Cloudinary (get free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"  
CLOUDINARY_API_SECRET="your_api_secret"

# Session
SESSION_SECRET="your_random_secret_key_change_this"

# Server
PORT=3000
NODE_ENV="development"
```

---

## Step 4: Setup PostgreSQL Database

### Option A: Docker (Recommended - Easier)

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Verify it started
docker ps
# Should show "timebank_db" container running

# Check database is accessible
docker exec timebank_db psql -U postgres -c "SELECT version();"

# If working, you'll see PostgreSQL version output
```

### Option B: Local PostgreSQL (Windows)

```bash
# Verify PostgreSQL service is running
# Windows: Services (Ctrl+R → services.msc) → PostgreSQL

# Create database
psql -U postgres -c "CREATE DATABASE timebank;"

# Verify
psql -U postgres -l | grep timebank
```

### Option C: Local PostgreSQL (Mac)

```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb timebank

# Verify
psql -l | grep timebank
```

---

## Step 5: Initialize Prisma

```bash
# Generate Prisma client
npx prisma generate

# Create tables from schema
npx prisma migrate dev --name init

# When prompted, create "init" migration

# You should see:
# ✓ Environment variables loaded from .env
# ✓ Prisma schema loaded from prisma/schema.prisma
# ✓ SQLite database created
# ✓ Migration init created
```

---

## Step 6: Load Test Data

```bash
# Seed database with test data
npx prisma db seed

# Expected output:
# 🌱 Seeding database...
# ✓ Created 3 test users
# ✓ Created 3 test requests
# ✓ Created transaction
# ✓ Created review
# ✓ Created notifications
# ✓ Created coupon
# ✅ Database seeding complete!
```

---

## Step 7: Verify Database

```bash
# Open Prisma GUI (awesome database viewer!)
npx prisma studio

# This opens: http://localhost:5555
# You can:
# - View all tables
# - See relationships
# - Add/edit data
# - Export data

# Keep this running in one terminal while developing!
```

---

## Step 8: Setup Cloudinary (Free)

1. Go to https://cloudinary.com
2. Click "Sign Up" (FREE tier!)
3. Complete registration
4. Go to Dashboard
5. Copy these values:
   - Cloud Name
   - API Key
   - API Secret (keep this secret!)
6. Add to .env:
   ```
   CLOUDINARY_CLOUD_NAME=your_value
   CLOUDINARY_API_KEY=your_value
   CLOUDINARY_API_SECRET=your_value
   ```

---

## Step 9: Test Application

```bash
# Start development server
npm run dev

# Expected output:
# ╔════════════════════════════════════╗
# ║   TimeBank Server Running          ║
# ╠════════════════════════════════════╣
# ║ URL: http://localhost:3000
# ║ Environment: development
# ║ Database: PostgreSQL with Prisma
# ║ File Storage: Cloudinary
# ║ Testing: Jest
# ╚════════════════════════════════════╝

# Visit: http://localhost:3000 in browser
# Should see homepage
```

---

## Step 10: Run Tests

```bash
# Run all tests
npm test

# Expected: 6+ tests passing
# ✓ userService tests
# ✓ CRUD operation tests
# ✓ Mocking tests

# View coverage
npm run test:coverage

# Should show something like:
# -------|---------|---------|---------|---------|---------|
# File   | % Stmts | % Branch| % Funcs | % Lines | Uncov...
# -------|---------|---------|---------|---------|---------|
# All files | 45.2  | 32.1    | 50      | 45.8    |
```

---

## Daily Development Workflow

### Morning: Start Development

```bash
# Terminal 1: Database viewer
npx prisma studio

# Terminal 2: Database monitoring (optional)
docker logs -f timebank_db  # Only if using Docker

# Terminal 3: Development server
npm run dev

# Terminal 4: Run tests in watch mode
npm run test:watch
```

### During Development

```bash
# Make changes to code

# See logs in Terminal 3

# Tests auto-run in Terminal 4

# View database in Prisma Studio (http://localhost:5555)
```

### Before Committing

```bash
# Run all tests and make sure they pass
npm test

# Check code style
npm run lint  # (if configured)

# Commit changes
git add .
git commit -m "Description of changes"
```

---

## Troubleshooting Setup

### "Cannot connect to database"

```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL  # Should show postgresql://...

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If using Docker:
docker ps  # Should show timebank_db running

# If not running:
docker-compose up -d
```

### "Module not found: @prisma/client"

```bash
# Reinstall Prisma
npm install @prisma/client
npm install -D prisma

# Generate client
npx prisma generate
```

### "Migration failed"

```bash
# Reset database (CAUTION: loses all data)
npx prisma migrate reset

# Or resolve manually:
npx prisma migrate dev

# Check migration status
npx prisma migrate status
```

### "Port 3000 already in use"

```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# Kill it or use different port:
PORT=3001 npm run dev
```

### "Prisma studio won't open"

```bash
# Make sure no other instance running
npx prisma studio --browser chrome

# Or access directly: http://localhost:5555
```

---

## Important Environment Variables

### Required for All Environments

```
DATABASE_URL          ← Your PostgreSQL connection string
NODE_ENV             ← "development" or "production"
SESSION_SECRET       ← Random string for session security
```

### Required for File Upload

```
CLOUDINARY_CLOUD_NAME    ← From cloudinary.com dashboard
CLOUDINARY_API_KEY       ← From cloudinary.com dashboard
CLOUDINARY_API_SECRET    ← From cloudinary.com dashboard
```

### Optional

```
PORT                 ← Default 3000
HOST                 ← Default localhost
JWT_SECRET          ← For JWT tokens (if using)
SMTP_*              ← For email (if using)
```

---

## Database Migrations

### When You Change Schema

```bash
# 1. Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name describe_change

# 3. Your changes are automatically applied

# 4. Verify with Prisma studio
npx prisma studio
```

### Example: Add New Field

```prisma
// In prisma/schema.prisma
model User {
  // ... existing fields
  newField String? @default("default")
}
```

```bash
# Run migration
npx prisma migrate dev --name add_new_field

# Check Prisma studio - new field appears!
```

---

## Performance Tips

### Development

```bash
# Use watch mode for tests
npm run test:watch

# Keep Prisma studio open
npx prisma studio

# Use VS Code REST Client for API testing
# Create: test.http file
GET http://localhost:3000/api/users
```

### Before Production

```bash
# Check coverage
npm run test:coverage   # Aim for 70%+

# Check for security issues
npm audit

# Check performance
npm run build          # If applicable

# Check logs for errors
npm run dev 2>&1 | grep error
```

---

## Useful Commands Cheat Sheet

```bash
# Database
npx prisma studio           # Open database GUI
npx prisma db seed          # Load test data
npx prisma migrate reset    # Reset database (⚠️ loses data!)
npx prisma generate         # Generate Prisma client

# Development
npm run dev                 # Start development server
npm test                    # Run tests
npm run test:watch          # Tests in watch mode
npm run test:coverage       # Coverage report

# Docker
docker-compose up -d        # Start containers
docker-compose down         # Stop containers
docker-compose logs -f      # View logs
docker ps                   # List running containers

# Git
git status                  # Check changes
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push                    # Push to GitHub
```

---

## Next Steps After Setup

1. ✅ **Verify everything works**
   - [ ] npm run dev starts server
   - [ ] npm test passes
   - [ ] Prisma studio opens
   - [ ] Database has seed data

2. 📝 **Start implementing**
   - [ ] Follow IMPLEMENTATION_CHECKLIST.md
   - [ ] Implement remaining services
   - [ ] Write tests for services
   - [ ] Create upload routes

3.🚀 **Ready for deployment**
   - [ ] All tests passing
   - [ ] Docker setup working
   - [ ] Ready to push to GitHub
   - [ ] Ready to deploy to Render

---

## Getting Help

If you're stuck:

1. Check error message carefully
2. Look in QUICK_REFERENCE.md
3. Check Docker logs: `docker logs timebank_db`
4. Try Prisma studio: `npx prisma studio`
5. Check environment variables: `echo $DATABASE_URL`
6. Run fresh migration: `npx prisma migrate reset`

**Everything has a solution. Don't give up!** 💪

---

*Setup Guide: May 20, 2026*
*Estimated Setup Time: 30 minutes*
*Difficulty: Beginner-friendly*
