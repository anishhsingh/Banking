My Bank Application
A full-stack demo banking system built with:

Backend: Spring Boot 3 (Java 21), Spring Data JPA, H2/PostgreSQL, Validation, BCrypt
Frontend: Angular (components, services, routing, guards), Bootstrap styling
Testing: JUnit 5, Spring Boot Test, Mockito, Jasmine/Karma
Features
User registration & secure login (BCrypt password hashing)
Accounts (Savings & Current) with overdraft rules
Deposits, withdrawals, transfers (transactional integrity & locking)
Transaction history
Password reset scaffolding (token model present)
Seed data for a demo user and accounts
OpenAPI/Swagger UI documentation (springdoc)
Database Schema (PostgreSQL)
Below is the logical model and concrete PostgreSQL DDL (matching the JPA entities). Enums are stored as VARCHAR (see spring.jpa.properties.hibernate.type.preferred_enum_jdbc_type=VARCHAR).

Entity relationships:

Customer 1..* Account
Account 1..* BankTransaction
Customer 1..* PasswordResetToken
ER Overview
customers (1) ──< accounts (1) ──< transactions
customers (1) ──< password_reset_tokens
DDL
CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20),
    created_at      TIMESTAMPTZ,
    dob             DATE,
    password_hash   VARCHAR(200)
);

CREATE TABLE accounts (
    id              BIGSERIAL PRIMARY KEY,
    account_number  VARCHAR(32) NOT NULL UNIQUE,
    customer_id     BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    account_type    VARCHAR(20) NOT NULL,          -- SAVINGS | CURRENT (enum stored as string)
    balance         NUMERIC(18,2) NOT NULL DEFAULT 0,
    opened_at       TIMESTAMPTZ,
    interest_rate   NUMERIC(5,4),                  -- e.g. 0.0250 = 2.50%
    overdraft_limit NUMERIC(18,2),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    txn_type    VARCHAR(20) NOT NULL,              -- DEPOSIT | WITHDRAWAL | TRANSFER_IN | TRANSFER_OUT
    amount      NUMERIC(18,2) NOT NULL,
    txn_date    TIMESTAMPTZ,
    note        VARCHAR(255)
);
CREATE INDEX idx_txn_account_date ON transactions(account_id, txn_date DESC);

CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(120) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_prt_expires ON password_reset_tokens(expires_at);
Notes
TIMESTAMPTZ (timestamp with time zone) suits the Instant fields.
spring.jpa.hibernate.ddl-auto=update will let Hibernate evolve the schema; for production prefer validate + migrations (Flyway/Liquibase).
Add explicit partial indexes (e.g., unused tokens) if you implement password reset flows:
CREATE INDEX idx_prt_unused ON password_reset_tokens(token) WHERE used = false;
Sample Data Seed
The DataInitializer inserts:

A demo customer (test@example.com) with two accounts (SAVINGS & CURRENT)
Opening deposit transactions
Backend Structure
src/main/java/com/training/demobank/
  controller/    -> REST controllers (Auth, Account, Customer)
  service/       -> Business logic (BankingService)
  repository/    -> Spring Data JPA repositories
  model/         -> Entities (Customer, Account, BankTransaction, etc.)
  config/        -> Beans (BCrypt, DataInitializer, OpenAPI)
Frontend Structure (Angular)
frontend/src/app/
  components/   -> UI components (login, register, accounts, transactions, transfer, dashboard)
  services/     -> auth.service, banking.service (HTTP abstraction)
  guards/       -> auth.guard (route protection)
  models/       -> user/account models
  shared/       -> alert component/service
  root/         -> app.component bootstrap
Quick Start
Prerequisites
Java 21
Maven wrapper included (./mvnw)
Node.js 18+ & npm (for Angular frontend)
Run Backend (Dev with H2)
./mvnw spring-boot:run
Backend runs at: http://localhost:8080 Swagger UI (if enabled): http://localhost:8080/swagger-ui.html

Run Frontend
cd frontend
npm install
npm start            # default Angular dev server (likely http://localhost:4200)
If CORS origin differs, update @CrossOrigin in AuthController or configure proxy.

Run Tests
# Backend tests
./mvnw test

# Frontend tests
cd frontend
npm test
Auth & Security
Passwords hashed using BCrypt (BCryptPasswordEncoder bean)
Login requires correct email + password hash match
Unified failure message: "Invalid credentials" (prevents user enumeration)
(Future) Could swap pseudo token for JWT (add spring-boot-starter-security + JWT lib)
Transactions & Concurrency
Transfer uses ordered locking (findWithLockingById) to minimize deadlock risk
Overdraft rules enforced for current accounts; savings cannot go below zero
Each balance change is recorded via a BankTransaction entity
Seed Data (DataInitializer)
Demo user: test@example.com / Password123!
Two demo accounts (savings + current) with initial transactions
Controlled via properties demobank.seed.*
Presentation (5‑Minute Outline)
Architecture: Angular SPA + Spring Boot REST + JPA (30s)
Backend layering & entities; BankingService responsibilities (60s)
Security: BCrypt hashing & credential validation (30s)
Transactions & consistency (withdraw/transfer flow & locking) (45s)
Frontend: components -> services -> HTTP -> backend (45s)
Testing: controller tests with @WebMvcTest + mocked beans; service integration tests (45s)
Extensibility & next steps (JWT, pagination, CI/CD) (30s)
Common Commands
# Clean & build
./mvnw clean package

# Run with Postgres profile (example)
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres

# Lint Angular (if configured)
npm run lint
Git Hygiene
Large build/cache folders are excluded:

frontend/.angular/
frontend/dist/
node_modules/ (backend & frontend)
target/
If accidentally committed large blobs, recreate a clean orphan branch & force push (already applied here).

Possible Enhancements
JWT-based auth & refresh tokens
Role-based authorization
Pagination & filtering for transactions
Docker Compose for full stack
GitHub Actions CI (Maven + Angular build)
