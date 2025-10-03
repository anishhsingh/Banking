# My Bank Application

A full‑stack **demo banking system** built with an Angular frontend and a Spring Boot backend. It demonstrates secure authentication, account management, transactional integrity, and a small seed dataset for demo purposes.

---

## 🔧 Tech Stack

* **Backend:** Spring Boot 3 (Java 21), Spring Data JPA
* **Database:** H2 (dev) / PostgreSQL (prod)
* **Security:** BCrypt password hashing
* **Frontend:** Angular (components, services, routing, guards), Bootstrap
* **Testing:** JUnit 5, Spring Boot Test, Mockito (backend); Jasmine/Karma (frontend)
* **API docs:** OpenAPI / Swagger (springdoc)

---

## ✨ Main Features

* User registration & secure login (BCrypt)
* Accounts: SAVINGS and CURRENT with overdraft rules
* Deposits, withdrawals, and transfers with transactional integrity and locking
* Transaction history with indexes for fast lookups
* Password reset scaffolding (token model implemented)
* Demo seed data (demo customer + accounts)
* Swagger UI for API exploration

---

## ER Overview

```
customers (1) ──< accounts (1) ──< transactions
customers (1) ──< password_reset_tokens
```

### High level relationships

* Customer (1) -> Account (many)
* Account (1) -> BankTransaction (many)
* Customer (1) -> PasswordResetToken (many)

---

## Database DDL (PostgreSQL)

```sql
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ,
  dob DATE,
  password_hash VARCHAR(200)
);

CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  account_number VARCHAR(32) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  account_type VARCHAR(20) NOT NULL,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  opened_at TIMESTAMPTZ,
  interest_rate NUMERIC(5,4),
  overdraft_limit NUMERIC(18,2),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  txn_type VARCHAR(20) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  txn_date TIMESTAMPTZ,
  note VARCHAR(255)
);
CREATE INDEX idx_txn_account_date ON transactions(account_id, txn_date DESC);

CREATE TABLE password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(120) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_prt_expires ON password_reset_tokens(expires_at);

-- Optional partial index useful for active tokens
CREATE INDEX idx_prt_unused ON password_reset_tokens(token) WHERE used = false;
```

> Enums are stored as `VARCHAR` (configured via `spring.jpa.properties.hibernate.type.preferred_enum_jdbc_type=VARCHAR`).

---

## Project Structure (backend)

```
src/main/java/com/training/demobank/
  controller/   -> REST controllers (Auth, Account, Customer)
  service/      -> Business logic (BankingService)
  repository/   -> Spring Data JPA repos
  model/        -> JPA entities (Customer, Account, BankTransaction, ...)
  config/       -> Beans (BCrypt, DataInitializer, OpenAPI)
```

## Frontend structure (Angular)

```
frontend/src/app/
  components/ -> login, register, accounts, transactions, transfer, dashboard
  services/   -> auth.service, banking.service
  guards/     -> auth.guard
  models/     -> DTOs / models
  shared/     -> alert component/service
```

---

## Quick Start

### Prerequisites

* Java 21
* Maven (wrapper included: `./mvnw`)
* Node.js 18+ & npm (for Angular)

### Run backend (dev with H2)

```bash
./mvnw spring-boot:run
# Backend runs at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Run frontend (Angular dev server)

```bash
cd frontend
npm install
npm start
# Default: http://localhost:4200
```

> If frontend and backend are on different origins, either configure CORS in the backend or use an Angular proxy config.

---

## Tests

**Backend**

```bash
./mvnw test
```

**Frontend**

```bash
cd frontend
npm test
```

---

## Auth & Security

* Passwords hashed using `BCryptPasswordEncoder`.
* Login returns a unified failure message: `Invalid credentials` to prevent user enumeration.
* Current setup uses session / server-side authentication; JWT is a suggested enhancement.

---

## Transactions & Concurrency

* Transfers and withdrawals use transactional service methods and DB locking (`findWithLockingById`) to ensure consistency and reduce deadlocks.
* Overdraft rules are enforced for `CURRENT` accounts; `SAVINGS` accounts cannot go below zero.
* Every balance change is recorded as a `BankTransaction` for auditability.

---

## Seed data

`DataInitializer` seeds a demo customer (`test@example.com`) with password `Password123!` and two accounts (SAVINGS & CURRENT) along with opening transactions. Configurable via application properties `demobank.seed.*`.

---

## Git hygiene & large-file guidance

* Add these to `.gitignore`:

```
frontend/.angular/
frontend/node_modules/
frontend/dist/
target/
.DS_Store
.idea/
.vscode/
```

* If large blobs were accidentally committed (build caches, node_modules), remove them from history using `git filter-repo` or the **BFG Repo-Cleaner** and then force-push a cleaned branch.

---

## Presentation (5-minute outline)

1. Architecture: Angular SPA + Spring Boot REST + JPA (30s)
2. Backend layering & entities; BankingService responsibilities (60s)
3. Security: BCrypt hashing & credential validation (30s)
4. Transactions & consistency (withdraw/transfer flow, locking) (45s)
5. Frontend: components → services → HTTP → backend (45s)
6. Testing & extensibility: JWT, pagination, CI/CD (30s)

---

## Possible enhancements

* JWT-based authentication with access/refresh tokens
* Role-based authorization (ADMIN / USER)
* Pagination & filtering on transaction endpoints
* Docker Compose (Postgres + backend + frontend) for local full-stack runs
* GitHub Actions CI to run backend & frontend tests

---

## Troubleshooting

* **Large file rejected by GitHub:** run BFG or `git filter-repo` to remove large files from history, then `git push --force-with-lease` or push cleaned branch and merge via web UI.
* **CORS issues:** add `@CrossOrigin` to controllers during dev or configure a global `CorsFilter` bean.

---

## Contributing

Pull requests are welcome. For big changes, open an issue first to discuss the design and migration strategy (esp. if it affects DB schema or auth).
