# ⚡ QUICK REFERENCE - Copy This Into Terminal When You Need It

## 🔧 POSTGRESQL + PRISMA Quick Commands

```bash
# Install
npm install @prisma/client
npm install -D prisma

# Initialize
npx prisma init

# Create/Update schema at: prisma/schema.prisma

# Run migrations
npx prisma migrate dev --name description_of_change

# Deploy migrations to production
npx prisma migrate deploy

# Open database GUI
npx prisma studio

# Load seed data
npx prisma db seed

# Reset database (CAREFUL - deletes all data)
npx prisma migrate reset
```

## 🎬 MULTER + CLOUDINARY Quick Commands

```bash
# Install
npm install multer cloudinary

# Get Cloudinary free account
# 1. Go to https://cloudinary.com
# 2. Sign up
# 3. Get credentials from dashboard
# 4. Add to .env:
#    CLOUDINARY_CLOUD_NAME=xxx
#    CLOUDINARY_API_KEY=xxx
#    CLOUDINARY_API_SECRET=xxx
```

### Multer + Cloudinary Code Template
```javascript
// config/multer.js
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
module.exports = upload;

// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name, api_key, api_secret });
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      err ? reject(err) : resolve(result);
    });
    stream.end(buffer);
  });
};
module.exports = { uploadToCloudinary };

// Route
router.post('/upload', upload.single('file'), async (req, res) => {
  const result = await uploadToCloudinary(req.file.buffer, 'timebank');
  res.json({ url: result.secure_url });
});
```

## ✅ UNIT TESTING Quick Commands

```bash
# Install
npm install -D jest @types/jest supertest

# Run all tests
npm test

# Watch mode (rerun on file change)
npm run test:watch

# Coverage report
npm run test:coverage

# Run single test file
npm test -- __tests__/services/userService.test.js
```

### Jest Test Template
```javascript
describe('Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should do something', async () => {
    // Arrange: Setup
    const data = { name: 'test' };
    
    // Act: Execute
    const result = await function(data);
    
    // Assert: Verify
    expect(result.name).toBe('test');
  });
});
```

## 🚀 DEPLOYMENT Quick Commands

```bash
# Docker - Local Testing
docker-compose up -d              # Start
docker-compose down               # Stop
docker-compose logs -f            # View logs

# Render - Production
git push origin main              # Deploy (auto)
# Then: https://dashboard.render.com

# Vercel - Frontend
vercel deploy                     # Deploy
vercel --prod                     # Production

# Database Migrations (IMPORTANT!)
npx prisma migrate deploy         # Before deployment!
```

## 🌍 ENVIRONMENT VARIABLES (.env)

```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/timebank"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_name"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"

# Security
SESSION_SECRET="random_secret_here"
JWT_SECRET="another_secret_here"

# Server
PORT=3000
NODE_ENV="development"
```

---

## 📊 PRISMA CRUD Cheat Sheet

```javascript
// CREATE
await prisma.user.create({
  data: { name, email }
});

// READ - one
await prisma.user.findUnique({
  where: { id },
  include: { requests: true }
});

// READ - many
await prisma.user.findMany({
  where: { status: 'active' },
  skip: 0,
  take: 10
});

// UPDATE
await prisma.user.update({
  where: { id },
  data: { name: 'New' }
});

// DELETE
await prisma.user.delete({
  where: { id }
});

// INCREMENT
await prisma.user.update({
  where: { id },
  data: { credits: { increment: 10 } }
});

// DECREMENT
await prisma.user.update({
  where: { id },
  data: { credits: { decrement: 10 } }
});
```

---

## 🧪 TESTING Cheat Sheet

```javascript
// Mock a function
jest.mock('../module', () => ({
  function: jest.fn()
}));

// Mock Prisma
jest.mock('../config/prisma', () => ({
  user: {
    create: jest.fn().mockResolvedValue({ id: 1 }),
    findUnique: jest.fn().mockResolvedValue(null)
  }
}));

// Assertions
expect(result).toBe(value);
expect(result).toEqual({ key: 'value' });
expect(result).toContain('text');
expect(result).toBeNull();
expect(result).toBeDefined();
expect(result).toBeTruthy();
expect(function).toHaveBeenCalled();
expect(function).toHaveBeenCalledWith(arg);
```

---

## 🚨 COMMON ERRORS & FIXES

### "Database connection failed"
```bash
# Check CONNECTION
1. Is PostgreSQL running?
   - Windows: Services → PostgreSQL → Check status
   - Mac: brew services list
   - Linux: systemctl status postgresql
   
2. Is DATABASE_URL correct?
   postgresql://user:password@localhost:5432/dbname
   
3. Do credentials match?
   psql -U username -d dbname -h localhost
```

### "File upload fails"
```bash
# Check CLOUDINARY
1. Are credentials in .env?
2. Are credentials CORRECT?
3. Is file under 5MB?
4. Is file image format?
5. Did you npm install multer cloudinary?
```

### "Tests fail"
```bash
# Check MOCKS
1. Are Prisma mocks setup?
2. Did you jest.clearAllMocks() in beforeEach?
3. Are imports correct?
4. Did you mock all dependencies?
```

### "Deployment fails"
```bash
# Check PRODUCTION
1. npx prisma migrate deploy ✓
2. Environment variables set ✓
3. DATABASE_URL correct ✓
4. CLOUDINARY_* set ✓
5. Node version 18+ ✓
6. npm ci (not npm install) ✓
```

---

## 📝 FILE LOCATION REFERENCE

```
Project Root/
├─ .env                          ← Your secrets (git ignore!)
├─ .env.example                  ← Template (share this)
├─ package.json                  ← Dependencies
├─ app.js                        ← Main server
│
├─ config/
│  ├─ prisma.js                  ← Database client
│  ├─ multer.js                  ← File upload
│  └─ cloudinary.js              ← Cloud storage
│
├─ prisma/
│  ├─ schema.prisma              ← Database structure
│  └─ seed.js                    ← Test data
│
├─ services/
│  ├─ userService.js             ← User CRUD
│  └─ profileService.js          ← Profile + uploads
│
├─ routes/
│  ├─ auth.js                    ← Login/signup
│  ├─ profile-upload.js          ← Avatar upload
│  └─ ...
│
├─ __tests__/
│  └─ services/
│     └─ userService.test.js     ← Tests
│
├─ jest.config.js                ← Test config
├─ Dockerfile                    ← Container image
├─ docker-compose.yml            ← Local dev
├─ render.yaml                   ← Render deploy
└─ vercel.json                   ← Vercel deploy
```

---

## 🎯 EXECUTION CHECKLIST (Copy to Trello/Notion)

### Week 1: PostgreSQL Setup
- [ ] Read FINAL_EVALUATION_GUIDE.md Part 1
- [ ] npm install @prisma/client && npm install -D prisma
- [ ] npx prisma init
- [ ] Setup PostgreSQL (local or Docker)
- [ ] Set DATABASE_URL in .env
- [ ] Create prisma/schema.prisma
- [ ] npx prisma migrate dev --name init
- [ ] npx prisma db seed
- [ ] Write userService.js CRUD
- [ ] Test all operations
- [ ] Document what you learned

### Week 2: File Upload Setup
- [ ] Read FINAL_EVALUATION_GUIDE.md Part 2
- [ ] npm install multer cloudinary
- [ ] Get Cloudinary credentials (free at cloudinary.com)
- [ ] Add CLOUDINARY_* to .env
- [ ] Create config/multer.js
- [ ] Create config/cloudinary.js
- [ ] Create upload route
- [ ] Test file uploads
- [ ] Verify images in Cloudinary
- [ ] Document workflow

### Week 3: Testing Setup
- [ ] Read FINAL_EVALUATION_GUIDE.md Part 3
- [ ] npm install -D jest @types/jest supertest
- [ ] Create jest.config.js
- [ ] Write userService tests
- [ ] Write route tests
- [ ] Setup Prisma mocking
- [ ] Run npm test
- [ ] Get 70%+ coverage
- [ ] Fix failing tests
- [ ] Document test strategy

### Week 4: Deployment
- [ ] Read FINAL_EVALUATION_GUIDE.md Part 4
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Test locally: docker-compose up
- [ ] Push to GitHub
- [ ] Deploy to Render/Vercel
- [ ] Set environment variables
- [ ] Test live app
- [ ] Setup monitoring
- [ ] Document deployment
- [ ] Create rollback plan

---

## 🔗 USEFUL LINKS

- Prisma Docs: https://www.prisma.io/docs/
- Multer: https://github.com/expressjs/multer
- Cloudinary: https://cloudinary.com/documentation
- Jest: https://jestjs.io/
- Render: https://render.com/docs
- Docker: https://docs.docker.com/
- PostgreSQL: https://www.postgresql.org/docs/

---

## 💡 PRO TIPS

1. **Commit frequently**: `git add . && git commit -m "message"`
2. **Test often**: `npm test` before each commit
3. **Read error logs**: 99% of errors have solutions in logs
4. **Ask GitHub Copilot**: When stuck, ask your assistant!
5. **Deploy early**: Don't wait until the end to test deployment
6. **Document as you go**: Don't leave documentation for the end
7. **Use `.env`**: Never commit secrets!
8. **Check coverage**: `npm run test:coverage` regularly

---

## 📞 GETTING HELP

If stuck:
1. Check error message carefully
2. Google the error
3. Check TECHNOLOGY_EXPLAINED.md
4. Check IMPLEMENTATION_CHECKLIST.md
5. Review example code in this package
6. Ask GitHub Copilot

**Remember**: Every error has a solution. Never give up! 💪

---

*Last Updated: May 20, 2026*
