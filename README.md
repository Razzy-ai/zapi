# Zapier – Automation Platform

A full-stack workflow automation platform inspired by Zapier that allows users to create automated workflows between different services using triggers and actions.

---

## 🚀 Project Overview

This project enables users to build automation workflows where an event (Trigger) in one application results in an automated task (Action) in another application.

Currently the platform supports the following real workflows:

- When a webhook trigger is received → **Send an Email**
- When a webhook trigger is received → **Execute Solana Transaction**
- Custom event trigger → Perform configured backend action
---

## 🛠 Tech Stack

**Frontend:**
- Next.js  
- TypeScript  
- Tailwind CSS  

**Backend:**
- Node.js  
- Express.js  
- TypeScript  
- Prisma ORM  
- PostgreSQL  

**Messaging & Queues:**
- Kafka (for event processing)

**Authentication:**
- JWT based authentication

**Other Tools:**
- Docker  
- Postman  
- Git & GitHub  

---

## ✨ Features

- User Authentication (Login / Register)
- Create custom workflows
- Multiple triggers and actions
- Webhook integration
- Kafka-based event processing
- Real-time workflow execution
- Dashboard to manage automations
- Secure API endpoints
- Scalable architecture

---

## 🏗 Architecture

The system follows a microservice-inspired architecture:

1. Frontend for user interaction  
2. Backend API for workflow management  
3. Kafka for event streaming  
4. Worker service for processing tasks  
5. Database for storing users, workflows, logs  

---

## 📌 How It Works

1. User logs into the platform  
2. Creates a Zap (workflow)  
3. Selects a Trigger  
4. Selects an Action  
5. System listens for trigger events  
6. Once trigger occurs → action executes automatically  

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js  
- PostgreSQL  
- Kafka  
- Docker (optional)

### Clone the Repository

```bash
git clone https://github.com/Razzy-ai/zapi.git
cd zapier-clone
```
### 🔧 Backend Setup
You need to start multiple backend services separately.

#### A. Primary Backend
```bash
cd primary-backend
npm install
npm run dev
```
This service handles:
- Authentication
- Zap creation
- User management
- API endpoints

#### B. Hooks Service
```bash
cd hooks
npm install
npm run dev
```
This service handles incoming webhook triggers.

#### C. Processor
```bash
cd processor
npm install
npm run dev
```
This service read event entries from database and push them into kafka topic.

#### D. Worker Service
```bash
cd worker
npm install
npm run dev
```
This service executes the actual actions:
- Sending Emails
- Executing Solana transactions

### 💻 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
---

### 🧪 Environment Variables
Each service requires its own .env file.

#### hooks/.env
```bash
DATABASE_URL=
```
#### primary-backend/.env
```bash
DATABASE_URL=
```
#### processor/.env
```bash
DATABASE_URL=
```
#### worker/.env
```bash
DATABASE_URL=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_ENDPOINT=
SOL_PRIVATE_KEY=
```
--- 

### 📂 Project Structure
```php
ZAPIER/
│── frontend/
│── primary-backend/
│── worker/
│── processor/
│── hooks/
│── README.md
```

