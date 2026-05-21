# TimeBank Project - Technology Stack Explained

## Technology Matrix: What is used for What?

| Technology | Category | Purpose | Why TimeBank Uses It |
|------------|----------|---------|---------------------|
| **PostgreSQL** | Database | Stores relational data | Structure, reliability, transactions |
| **Prisma** | ORM | Query builder for database | Type-safe, easy, migrations |
| **Express.js** | Backend Framework | HTTP server & routing | Lightweight, proven, popular |
| **Multer** | Middleware | Process file uploads | Standard for form-data handling |
| **Cloudinary** | Cloud Storage | Store images in cloud | No server storage, CDN, free tier |
| **Jest** | Testing | Unit & integration tests | Detects bugs early, safe refactoring |
| **Render/Vercel** | Hosting | Deploy to cloud | Always running, scalable, managed |
| **Docker** | Containerization | Package app for deployment | Same environment everywhere |

---

## Part 1: PostgreSQL + Prisma - The Database Layer

### Why Move from MongoDB to PostgreSQL?

#### MongoDB (Current)
- ✓ Flexible schema (no strict structure)
- ✓ Easy to start
- ✗ No transactions (data corruption risk)
- ✗ No relationships (manual joins)
- ✗ Less reliable for critical data

#### PostgreSQL (New)
- ✓ ACID Transactions (data always safe)
- ✓ Strong relationships (like Excel with formulas)
- ✓ SQL is industry standard
- ✓ Better performance at scale
- ✓ Free & open source

### PostgreSQL CRUD Operations Explained

#### CREATE (Insert new data)
```javascript
// SQL equivalent:
// INSERT INTO users (name, email) VALUES ('John', 'john@example.com');

await prisma.user.create({
  data: {
    name: 'John',
    email: 'john@example.com'
  }
});
```
**WHAT HAPPENS**: New row added to user table

#### READ (Retrieve data)
```javascript
// SQL equivalent:
// SELECT * FROM users WHERE id = 1;

await prisma.user.findUnique({
  where: { id: 1 },
  include: { requestsCreated: true } // Join related data
});
```
**WHAT HAPPENS**: Gets user + all their requests

#### UPDATE (Modify existing data)
```javascript
// SQL equivalent:
// UPDATE users SET credits = credits + 10 WHERE id = 1;

await prisma.user.update({
  where: { id: 1 },
  data: { credits: { increment: 10 } }
});
```
**WHAT HAPPENS**: Safely adds 10 credits

#### DELETE (Remove data)
```javascript
// SQL equivalent:
// DELETE FROM users WHERE id = 1;

await prisma.user.delete({
  where: { id: 1 }
});
```
**WHAT HAPPENS**: Removes user (and related requests if cascade)

### Database Relationships (Why PostgreSQL is Better)

```prisma
// One User → Many Requests
model User {
  id        Int
  requests  Request[]  // This user's requests
}

model Request {
  id          Int
  createdById Int
  createdBy   User  // Links back to user
}
```

**SQL Query Equivalent**:
```sql
SELECT u.name, r.title 
FROM users u
JOIN requests r ON u.id = r.createdById
WHERE u.id = 1;
```

**Prisma Equivalent** (Type-safe!):
```javascript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { requestsCreated: true }
});
// user.requestsCreated = [{ title: "Fix my bike", ... }]
```

### Why Prisma Over Raw SQL?

| Feature | Raw SQL | Prisma |
|---------|---------|--------|
| Type Safety | ✗ No | ✓ Yes - catches errors! |
| Auto-complete | ✗ No | ✓ Yes - IDE suggests fields |
| Migrations | ✗ Manual | ✓ Automatic |
| Learning Curve | Steep | Easy |
| Performance | Similar | Similar |

---

## Part 2: Multer + Cloudinary - File Upload Workflow

### Problem We're Solving
**Without Multer + Cloudinary**: Users upload images → Server stores on disk → Disk fills up → Server runs out of space → ❌ App breaks

**With Multer + Cloudinary**: Users upload images → Cloud stores images → Unlimited space → ✓ Always works

### Multer: Intercepting File Uploads

```javascript
// Multer sits between user and server
// FLOW:
// User submits form with image
//   ↓
// Express receives request
//   ↓
// Multer middleware runs first
//   ↓
// Multer extracts file from form-data
//   ↓
// File stored in memory (req.file.buffer)
//   ↓
// Route handler receives req.file
//   ↓
// Route sends file to Cloudinary

router.post('/upload', upload.single('avatar'), async (req, res) => {
  // req.file = { buffer, mimetype, originalname }
  const result = await uploadToCloudinary(req.file.buffer);
});
```

### Cloudinary: Cloud Storage

```javascript
// WHAT CLOUDINARY DOES:
// 1. Receives file from your server
const result = await uploadToCloudinary(fileBuffer);

// 2. Returns object with:
result.secure_url   // "https://res.cloudinary.com/.../image.jpg"
result.public_id    // "timebank/avatars/abc123"
result.width        // 200 (auto-resized)
result.height       // 200 (auto-cropped)

// 3. Stores in cloud (never uses server disk)
// 4. Serves via CDN (fast worldwide)
// 5. Auto-optimizes for web
```

### Multer vs Cloudinary vs Server Storage

| Approach | Space | Speed | Cost | Scalability |
|----------|-------|-------|------|-------------|
| Save to server | ❌ Limited | ❌ Slow | ✓ Free | ❌ Can't scale |
| Multer only | ❌ Still needs disk | ❌ Slow | ✓ Free | ❌ Same problem |
| Multer + Cloudinary | ✓ Unlimited | ✓ Fast (CDN) | ✓ Free tier! | ✓ Infinite |

### Image Optimization (Cloudinary Bonus)

```javascript
// User uploads 5MB JPEG
uploadToCloudinary(fileBuffer, 'timebank/avatars', {
  width: 200,
  height: 200,
  crop: 'fill',
  quality: 'auto',
  fetch_format: 'auto'  // Converts to WebP for modern browsers
});

// Result: 200x200 WebP, ~30KB
// Benefits:
// - 99% smaller file
// - Loads instantly
// - Auto-formats for each browser
// - Free image CDN
```

---

## Part 3: Unit Testing with Jest

### Why Test Code?

Without tests:
- Change 1 line → break 5 other features
- Can't refactor safely
- Bugs discovered by users 😭
- Hard to debug

With tests:
- Change 1 line → tests verify all still works
- Refactor fearlessly
- Catch bugs before users 😊
- Easy to debug

### Jest Workflow

```javascript
// Test Structure
describe('User Service', () => {        // Test group
  beforeEach(() => {                    // Setup before each test
    jest.clearAllMocks();
  });

  test('should create user', () => {    // Individual test
    // Arrange: Setup data
    const userData = { name: 'John', email: 'john@example.com' };

    // Act: Do the thing
    const result = userService.createUser(userData);

    // Assert: Check result
    expect(result.name).toBe('John');
  });
});
```

### Types of Tests

#### 1. Unit Tests (Single Function)
```javascript
// Test ONLY the addCredits function
test('should add 10 credits to user', () => {
  const user = { id: 1, credits: 50 };
  const result = addCredits(user, 10);
  expect(result.credits).toBe(60);
});
```
✓ Fast, isolated, easy to debug

#### 2. Integration Tests (Multiple Functions)
```javascript
// Test upload → save → database
test('should upload avatar and save to database', async () => {
  const buffer = Buffer.from('image');
  const result = await uploadUserAvatar(1, buffer);
  expect(result.avatarUrl).toContain('cloudinary.com');
});
```
✓ Catches component interactions

#### 3. E2E Tests (Full Workflow)
```javascript
// Test: User -> Upload -> Database -> Display
test('should upload and display avatar', async () => {
  const response = await request(app)
    .post('/profile/upload-avatar')
    .attach('avatar', buffer);
  
  expect(response.status).toBe(200);
  // Check database has new avatar
  // Check page displays it
});
```
✓ Tests real user workflows

### Mocking (Why We Fake Things in Tests)

```javascript
// PROBLEM: We don't want to:
// - Hit real database during tests (slow)
// - Upload to real Cloudinary (costs money)
// - Send real emails (might spam users)

// SOLUTION: Mock them (fake them)

jest.mock('../../config/prisma', () => ({
  user: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test User'
    })
  }
}));

// Now Prisma is fake - tests run instantly!
```

### Coverage Reports

```bash
npm run test:coverage

# Output:
# Statements   : 75.2%  // 75% of code executed
# Branches     : 62.1%  // 62% of if/else paths tested
# Functions    : 80%    // 80% of functions called
# Lines        : 76.4%  // 76% of lines executed

# Goal: Get to 80%+ coverage
```

---

## Part 4: Deployment - Getting Your App Live

### Deployment Platforms Compared

| Platform | Best For | Difficulty | Cost | Uptime |
|----------|----------|------------|------|--------|
| **Render** | Full Node.js apps | Easy | Free tier! | 99.9% |
| **Vercel** | Frontend/Next.js | Very Easy | Free tier! | 99.99% |
| **Railway** | Quick deploy | Easy | Pay-as-you-go | 99% |
| **AWS** | Enterprise | Hard | Pay-as-you-go | 99.99%+ |
| **Heroku** | Simple apps | Easy | Paid | 99.5% |

### Step-by-Step Deployment (Render)

#### 1. Prepare Code
```bash
# Make sure everything works locally
npm test              # Tests pass ✓
npm run build         # Build succeeds ✓
npm start             # Starts without errors ✓
```

#### 2. Setup Environment Variables
Create `.env.production`:
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
```

#### 3. Push to GitHub
```bash
git add .
git commit -m "Final evaluation submission"
git push origin main
```

#### 4. Deploy on Render
- Go to render.com
- Click "New" → "Web Service"
- Connect GitHub repo
- Set environment variables
- Click Deploy
- Wait 5-10 minutes
- App is live! 🎉

### Pre-Deployment Checklist

```
BEFORE YOU DEPLOY:
☐ npm test passes
☐ No console errors
☐ No hardcoded secrets (use .env)
☐ Database migrations run successfully
☐ All user inputs validated
☐ Error pages created
☐ Logging configured
☐ CORS headers set
☐ Rate limiting enabled
☐ SSL/HTTPS enabled
☐ Backup plan if deployment fails
```

### Post-Deployment Monitoring

```javascript
// Add to app.js
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  // Send to monitoring service
  logErrorToService(err);
  res.status(500).render('error', { error: err });
});
```

---

## Implementation Timeline

### Week 1: PostgreSQL + Prisma (Lessons 49-52)
- Day 1-2: Install Prisma, create schema
- Day 3-4: Migrate Mongoose models → Prisma models
- Day 5: Implement CRUD operations
- Day 6-7: Test all operations

### Week 2: Multer + Cloudinary (Lessons 53-56)
- Day 1-2: Setup Multer + Cloudinary configs
- Day 3-4: Create upload routes
- Day 5: Add image optimization
- Day 6-7: Test file uploads

### Week 3: Unit Testing (Lessons 57-58)
- Day 1-2: Setup Jest
- Day 3-4: Write tests for services
- Day 5-6: Write tests for routes
- Day 7: Achieve 80% coverage

### Week 4: Deployment (Lessons 59-60)
- Day 1-2: Create Docker setup
- Day 3-4: Deploy to Render
- Day 5-6: Setup monitoring/logging
- Day 7: Final testing in production

---

## Evaluation Scoring Guide

### PostgreSQL + Prisma (25 points)
- ✓ Schema defined correctly (5 pts)
- ✓ CRUD operations work (5 pts)
- ✓ Relationships implemented (5 pts)
- ✓ Migrations run cleanly (5 pts)
- ✓ Code examples documented (5 pts)

### Multer + Cloudinary (25 points)
- ✓ File upload route created (5 pts)
- ✓ Files upload to Cloudinary (5 pts)
- ✓ Database stores URLs (5 pts)
- ✓ Old files deleted (5 pts)
- ✓ Error handling implemented (5 pts)

### Unit Testing (25 points)
- ✓ Tests written for services (5 pts)
- ✓ Tests written for routes (5 pts)
- ✓ Mocking setup correctly (5 pts)
- ✓ Coverage 70%+ (5 pts)
- ✓ All tests pass (5 pts)

### Deployment (25 points)
- ✓ App deployed to cloud (5 pts)
- ✓ Environment variables set (5 pts)
- ✓ Database migrations run (5 pts)
- ✓ SSL working (5 pts)
- ✓ Monitoring/logging enabled (5 pts)

**Total: 100 points**

---

## Quick Reference Commands

```bash
# PostgreSQL + Prisma
npx prisma migrate dev --name init
npx prisma studio                    # GUI database viewer
npx prisma db seed                   # Load test data

# Testing
npm test                             # Run all tests
npm run test:watch                   # Watch mode (rerun on change)
npm run test:coverage                # Coverage report

# Docker
docker-compose up -d                 # Start locally
docker-compose down                  # Stop containers

# Deployment
git push                             # Deploy to Render
npm run build                        # Production build
```

