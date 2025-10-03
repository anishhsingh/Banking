# My Bank Application

A full-stack demo banking system built with:
- Backend: Spring Boot 3 (Java 21), Spring Data JPA, H2/PostgreSQL, Validation, BCrypt
- Frontend: Angular (components, services, routing, guards), Bootstrap styling
- Testing: JUnit 5, Spring Boot Test, Mockito, Jasmine/Karma

## Features
- User registration & secure login (BCrypt password hashing)
- Accounts (Savings & Current) with overdraft rules
- Deposits, withdrawals, transfers (transactional integrity & locking)
- Transaction history
- Password reset scaffolding (token model present)
- Seed data for a demo user and accounts
- OpenAPI/Swagger UI documentation (springdoc)

## Backend Structure
```
src/main/java/com/training/demobank/
  controller/    -> REST controllers (Auth, Account, Customer)
  service/       -> Business logic (BankingService)
  repository/    -> Spring Data JPA repositories
  model/         -> Entities (Customer, Account, BankTransaction, etc.)
  config/        -> Beans (BCrypt, DataInitializer, OpenAPI)
```

## Frontend Structure (Angular)
```
frontend/src/app/
  components/   -> UI components (login, register, accounts, transactions, transfer, dashboard)
  services/     -> auth.service, banking.service (HTTP abstraction)
  guards/       -> auth.guard (route protection)
  models/       -> user/account models
  shared/       -> alert component/service
  root/         -> app.component bootstrap
```

## Quick Start
### Prerequisites
- Java 21
- Maven wrapper included (./mvnw)
- Node.js 18+ & npm (for Angular frontend)

### Run Backend (Dev with H2)
```bash
./mvnw spring-boot:run
```
Backend runs at: http://localhost:8080
Swagger UI (if enabled): http://localhost:8080/swagger-ui.html

### Run Frontend
```bash
cd frontend
npm install
npm start            # default Angular dev server (likely http://localhost:4200)
```
If CORS origin differs, update `@CrossOrigin` in `AuthController` or configure proxy.

### Run Tests
```bash
# Backend tests
./mvnw test

# Frontend tests
cd frontend
npm test
```

## Auth & Security
- Passwords hashed using BCrypt (`BCryptPasswordEncoder` bean)
- Login requires correct email + password hash match
- Unified failure message: "Invalid credentials" (prevents user enumeration)
- (Future) Could swap pseudo token for JWT (add spring-boot-starter-security + JWT lib)

## Transactions & Concurrency
- Transfer uses ordered locking (`findWithLockingById`) to minimize deadlock risk
- Overdraft rules enforced for current accounts; savings cannot go below zero
- Each balance change is recorded via a `BankTransaction` entity

## Seed Data (DataInitializer)
- Demo user: `test@example.com` / `Password123!`
- Two demo accounts (savings + current) with initial transactions
- Controlled via properties `demobank.seed.*`

## Presentation (5‑Minute Outline)
1. Architecture: Angular SPA + Spring Boot REST + JPA (30s)
2. Backend layering & entities; BankingService responsibilities (60s)
3. Security: BCrypt hashing & credential validation (30s)
4. Transactions & consistency (withdraw/transfer flow & locking) (45s)
5. Frontend: components -> services -> HTTP -> backend (45s)
6. Testing: controller tests with @WebMvcTest + mocked beans; service integration tests (45s)
7. Extensibility & next steps (JWT, pagination, CI/CD) (30s)

## Common Commands
```bash
# Clean & build
./mvnw clean package

# Run with Postgres profile (example)
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres

# Lint Angular (if configured)
npm run lint
```

## Git Hygiene
Large build/cache folders are excluded:
- `frontend/.angular/`
- `frontend/dist/`
- `node_modules/` (backend & frontend)
- `target/`

If accidentally committed large blobs, recreate a clean orphan branch & force push (already applied here).

## Possible Enhancements
- JWT-based auth & refresh tokens
- Role-based authorization
- Pagination & filtering for transactions
- Docker Compose for full stack
- GitHub Actions CI (Maven + Angular build)

## License
Add a license file if required (MIT/Apache 2.0 recommended).

---
Feel free to extend or customize for your demo. Good luck with your presentation!

