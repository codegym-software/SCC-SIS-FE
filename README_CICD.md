# SCC-SIS Frontend CI/CD Setup

## 📋 Cấu trúc đã tạo

```
SCC-SIS-FE/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions workflow
├── src/
│   └── __tests__/              # Test files
│       ├── api/
│       │   └── http.test.ts
│       ├── components/
│       │   └── Button.test.tsx
│       ├── features/
│       │   └── students/
│       │       └── MyClasses.test.tsx
│       ├── stores/
│       │   └── userProfile.test.ts
│       └── utils/
│           └── format.test.ts
├── Dockerfile                  # Docker configuration
├── nginx.conf                  # Nginx configuration
└── docker-compose.yml          # Docker Compose
```

## 🚀 Các bước setup

### 1. Setup GitHub Secrets

Vào GitHub repo → **Settings** → **Secrets and variables** → **Actions** → Add:
- `DOCKER_USERNAME`: huy210205
- `DOCKER_PASSWORD`: your-docker-hub-password

### 2. Test locally

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### 3. Build Docker image locally

```bash
# Build
docker build -t scc-sis-fe:test .

# Run
docker run -p 5173:80 scc-sis-fe:test

# Test: Open http://localhost:5173
```

### 4. Deploy với docker-compose

```bash
docker-compose up -d
```

### 5. Push code lên GitHub

```bash
git add .
git commit -m "Add CI/CD pipeline with tests"
git push origin huy2.5
```

## 🎯 CI/CD Pipeline

Khi push code lên nhánh `huy2.5`:

1. ✅ **Test Stage**
   - Install dependencies
   - Run lint
   - Run tests (5 test files)
   - Build project
   - Upload artifacts

2. ✅ **Docker Stage**
   - Build Docker image
   - Push lên Docker Hub: `huy210205/scc-sis-fe:huy2.5`
   - Cache layers để build nhanh hơn

## 📦 Docker Images

- **Registry**: Docker Hub
- **Repository**: huy210205/scc-sis-fe
- **Tags**:
  - `huy2.5` (branch tag)
  - `huy2.5-<commit-sha>` (specific commit)
  - `latest` (latest from huy2.5)

## 🧪 Test Coverage

- **Utils**: Format và helper functions
- **Components**: UI components
- **API**: HTTP client utilities
- **Stores**: State management
- **Features**: Student features

## 🔧 Nginx Configuration

- ✅ SPA routing support
- ✅ Gzip compression
- ✅ Static assets caching
- ✅ Security headers

## 📝 Notes

- Frontend chạy trên port 80 trong container
- Mapping ra port 5173 ở host
- Tự động restart khi container crash
- Health check mỗi 30 giây
