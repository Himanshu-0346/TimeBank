# TimeBank Project - Final Evaluation Implementation Guide

## Overview
This guide covers the four critical topics for your final evaluation:
1. PostgreSQL + Prisma (Lessons 49-52)
2. Multer + Cloudinary (Lessons 53-56)
3. Unit Testing (Lessons 57-58)
4. Deployment (Lessons 59-60)

---

## Part 1: PostgreSQL + Prisma (CRUD & Database)

### What is PostgreSQL?
- **Relational Database**: Stores data in structured tables with relationships
- **Why use it**: More robust than MongoDB for transactional integrity, better for relational data
- **Features**: ACID compliance, complex queries, better performance at scale

### What is Prisma?
- **ORM (Object-Relational Mapping)**: Bridges your code and database
- **Why use it**: Type-safe, auto-generated API, excellent migrations, better than raw SQL
- **Features**: Built-in query builders, automatic migrations, schema definitions

### Setup Steps:

#### 1. Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma
```

#### 2. Initialize Prisma
```bash
npx prisma init
```

This creates:
- `.env` file for database credentials
- `prisma/schema.prisma` for your database schema

#### 3. Configure PostgreSQL Connection
Edit `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/timebank?schema=public"
```

#### 4. Define Your Schema (prisma/schema.prisma)
```prisma
// This file replaces Mongoose models

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String
  avatar    String?
  skills    String[]  // Array in PostgreSQL
  location  String?
  bio       String?
  credits   Int       @default(50)
  ratingAvg Float     @default(0)
  isVerified Boolean  @default(false)
  helpsCount Int      @default(0)
  
  // Relations
  requestsCreated  Request[]   @relation("CreatedBy")
  requestsAccepted Request[]   @relation("AcceptedBy")
  reviews          Review[]
  transactions     Transaction[]
  notifications    Notification[]
  disputes         Dispute[]
  coupons          Coupon[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Request {
  id          Int     @id @default(autoincrement())
  title       String
  description String
  category    String
  status      String  @default("open") // "open", "accepted", "completed"
  credits     Int
  
  // Foreign Keys
  createdById Int
  createdBy   User     @relation("CreatedBy", fields: [createdById], references: [id], onDelete: Cascade)
  
  acceptedById Int?
  acceptedBy   User?    @relation("AcceptedBy", fields: [acceptedById], references: [id], onDelete: SetNull)
  
  reviews     Review[]
  transaction Transaction?
  disputes    Dispute[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Transaction {
  id          Int     @id @default(autoincrement())
  from        User    @relation(fields: [fromId], references: [id])
  fromId      Int
  to          User    @relation("To", fields: [toId], references: [id])
  toId        Int
  amount      Int
  request     Request @relation(fields: [requestId], references: [id])
  requestId   Int     @unique
  status      String
  createdAt   DateTime @default(now())
}

model Review {
  id          Int     @id @default(autoincrement())
  rating      Int     // 1-5
  comment     String
  user        User    @relation(fields: [userId], references: [id])
  userId      Int
  request     Request @relation(fields: [requestId], references: [id])
  requestId   Int
  createdAt   DateTime @default(now())
}

model Notification {
  id          Int     @id @default(autoincrement())
  type        String  // "request_accepted", "payment_received", etc.
  message     String
  user        User    @relation(fields: [userId], references: [id])
  userId      Int
  read        Boolean @default(false)
  createdAt   DateTime @default(now())
}

model Dispute {
  id          Int     @id @default(autoincrement())
  reason      String
  status      String  @default("open")
  user        User    @relation(fields: [userId], references: [id])
  userId      Int
  request     Request @relation(fields: [requestId], references: [id])
  requestId   Int
  createdAt   DateTime @default(now())
}

model Coupon {
  id          Int     @id @default(autoincrement())
  code        String  @unique
  discount    Int     // percentage
  expiresAt   DateTime
  users       User[]
}
```

### CRUD Operations with Prisma

#### Create
```javascript
// Create a new user
const user = await prisma.user.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    password: hashedPassword,
    skills: ["JavaScript", "React"]
  }
});
```

#### Read
```javascript
// Get user by ID
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { requestsCreated: true, reviews: true }
});

// Get all users
const users = await prisma.user.findMany({
  where: { isVerified: true },
  select: { id: true, name: true, email: true }
});

// Get with pagination
const users = await prisma.user.findMany({
  skip: 0,
  take: 10
});
```

#### Update
```javascript
// Update user
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    credits: { increment: 10 }, // Add 10 credits
    bio: "New bio"
  }
});
```

#### Delete
```javascript
// Delete user
await prisma.user.delete({
  where: { id: 1 }
});

// Delete many
await prisma.user.deleteMany({
  where: { isVerified: false }
});
```

### Run Migrations
```bash
# Create migration
npx prisma migrate dev --name add_user_table

# Apply migration to production
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

---

## Part 2: Multer + Cloudinary (File Upload Handling)

### What is Multer?
- **Middleware for file uploads**: Processes multipart/form-data
- **Why use it**: Handles form submissions with files attached
- **Use case**: When users upload images, documents, etc.

### What is Cloudinary?
- **Cloud Storage Service**: Stores images/videos in the cloud
- **Why use it**: 
  - Don't need server storage (no disk space used)
  - CDN delivery (fast globally)
  - Auto image optimization
  - Free tier: 25GB storage
- **Features**: Image transformation, optimization, compression

### Setup Steps:

#### 1. Install Dependencies
```bash
npm install multer cloudinary next-cloudinary
# OR
npm install multer cloudinary
```

#### 2. Get Cloudinary Credentials
- Sign up at https://cloudinary.com
- Copy: Cloud Name, API Key, API Secret
- Add to `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 3. Setup Multer Configuration
Create `config/multer.js`:

```javascript
const multer = require('multer');
const path = require('path');

// Storage configuration (temporary - will upload to Cloudinary)
const storage = multer.memoryStorage(); // Keep in memory before sending to Cloudinary

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

module.exports = upload;
```

#### 4. Setup Cloudinary Configuration
Create `config/cloudinary.js`:

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer, folder = 'timebank') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

module.exports = { cloudinary, uploadToCloudinary };
```

#### 5. Create Upload Route
In `routes/profile.js`:

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { uploadToCloudinary } = require('../config/cloudinary');
const { auth } = require('../middleware/auth');

// Upload avatar
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'timebank/avatars');
    
    // Update user with new avatar URL
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: result.secure_url }
    });

    res.json({ success: true, avatarUrl: user.avatar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 6. Frontend Form (HTML)
```html
<form action="/profile/upload-avatar" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar" accept="image/*" required>
  <button type="submit">Upload Avatar</button>
</form>
```

### Multer vs Traditional Upload:
| Feature | Multer Only | Multer + Cloudinary |
|---------|-------------|-------------------|
| Storage | Server disk | Cloud (no disk used) |
| Cost | High (storage) | Low (free tier available) |
| Speed | Slow | Fast (CDN) |
| Scalability | Limited | Unlimited |
| Image Optimization | Manual | Automatic |

---

## Part 3: Unit Testing (Jest)

### What is Unit Testing?
- **Testing individual functions**: Test one piece of code at a time
- **Why do it**: Catch bugs early, ensure code works as expected, safe refactoring
- **Types**: Unit (function), Integration (multiple modules), E2E (full flow)

### Setup Jest:

#### 1. Install Dependencies
```bash
npm install -D jest @types/jest
npm install -D supertest # For API testing
npm install -D prisma-mock-extended # Mock Prisma
```

#### 2. Configure Jest (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['controllers/**', 'services/**'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000
};
```

#### 3. Update package.json scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### 4. Example Test - User Service (`services/__tests__/userService.test.js`)
```javascript
const userService = require('../userService');
const prisma = require('../../config/prisma');

// Mock Prisma
jest.mock('../../config/prisma', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password'
    };

    prisma.user.create.mockResolvedValue({
      id: 1,
      ...newUser
    });

    const result = await userService.createUser(newUser);
    
    expect(result.name).toBe('John Doe');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: newUser
    });
  });

  test('should get user by ID', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    });

    const result = await userService.getUserById(1);
    
    expect(result.email).toBe('john@example.com');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });
  });

  test('should update user credits', async () => {
    prisma.user.update.mockResolvedValue({
      id: 1,
      credits: 60
    });

    const result = await userService.addCredits(1, 10);
    
    expect(result.credits).toBe(60);
  });

  test('should throw error if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(userService.getUserById(999)).rejects.toThrow('User not found');
  });
});
```

#### 5. Example Test - API Route (`routes/__tests__/auth.test.js`)
```javascript
const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/prisma');

jest.mock('../../config/prisma');

describe('Auth Routes', () => {
  test('POST /auth/signup should create user', async () => {
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    });

    const response = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('POST /auth/login should authenticate user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      comparePassword: jest.fn().mockResolvedValue(true)
    });

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.statusCode).toBe(200);
  });
});
```

### Run Tests:
```bash
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

## Part 4: Deployment (Vercel/Render/AWS)

### Deployment Options Comparison:

| Platform | Best For | Cost | Scalability |
|----------|----------|------|-------------|
| **Vercel** | Frontend + Next.js | Free tier | High |
| **Render** | Full-stack Node.js | Free tier | High |
| **Railway** | Quick deployment | Pay-as-you-go | Medium |
| **AWS** | Enterprise | Variable | Very High |
| **Heroku** | Simple apps | Paid | Medium |

### Deploy on Render (Recommended for Node.js)

#### 1. Prepare your project
```bash
# Add to package.json
{
  "engines": {
    "node": "18"
  }
}
```

#### 2. Create `render.yaml`
```yaml
services:
  - type: web
    name: timebank
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: timebank_db
          property: connectionString
      - key: CLOUDINARY_CLOUD_NAME
        value: your_cloud_name
      - key: CLOUDINARY_API_KEY
        sync: false

databases:
  - name: timebank_db
    databaseName: timebank
    user: timebank_user
    plan: free
```

#### 3. Deploy Steps
- Push to GitHub
- Go to https://render.com
- Connect GitHub repo
- Select the repo and `render.yaml`
- Click Deploy

### Deploy on Vercel (Frontend)

#### 1. If using Next.js
```bash
# Install Next.js
npm install next react react-dom

# Create pages directory
mkdir pages
```

#### 2. Deploy
```bash
npm install -g vercel
vercel
```

### Environment Variables for Production

Create `.env.production`:
```
DATABASE_URL=postgresql://user:password@host:port/dbname
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SESSION_SECRET=strong_random_secret
NODE_ENV=production
```

### Pre-deployment Checklist
- [ ] All tests pass: `npm test`
- [ ] Build works: `npm run build`
- [ ] No hardcoded secrets
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Environment variables set in deployment platform
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] CORS configured properly
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting enabled

---

## Implementation Order

1. **Week 1**: PostgreSQL + Prisma migration
2. **Week 2**: Multer + Cloudinary implementation
3. **Week 3**: Unit tests
4. **Week 4**: Deployment setup

