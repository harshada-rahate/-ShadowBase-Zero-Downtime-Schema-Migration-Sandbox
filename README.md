# -ShadowBase-Zero-Downtime-Schema-Migration-Sandbox
# ShadowBase

## Zero-Downtime Schema Migration Sandbox

ShadowBase is a database migration testing platform that allows developers to safely test SQL schema changes in an isolated PostgreSQL environment before applying them to a production database.

The project creates a shadow database environment where database migrations can be executed and verified without directly affecting production data.

---

## 🚀 Features

- Start and manage an isolated PostgreSQL database container
- Seed database with sample customer data
- Execute SQL schema migrations safely
- View customer records from the shadow database
- Track database migration operations
- Test schema changes before production deployment
- React-based dashboard
- Monaco SQL Editor for writing migration queries
- Docker-based database environment

---

## 🏗️ Architecture

```text
                    ShadowBase
                        |
          +-------------+-------------+
          |                           |
     React Frontend              Spring Boot Backend
          |                           |
          |                    REST API Endpoints
          |                           |
          +-------------+-------------+
                        |
                  PostgreSQL
                  Shadow Database
                        |
                     Docker
