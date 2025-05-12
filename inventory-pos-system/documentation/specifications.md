# Inventory & POS System for Cold-Chain Juice Distribution - Specifications

## Overview
A web-based application to manage users, branches, product stock, sales transactions, and inter-branch deliveries in real-time and accurately, specifically for fresh juice products sensitive to time and temperature.

## Technologies
- Frontend: React.js with TailwindCSS and React Router
- Backend: Node.js (Express) with Prisma ORM and PostgreSQL
- Authentication: JWT Token
- Image Upload: Cloudinary or local folder
- Database: Relational, normalized schema

## Features

### 1. User Level Access Management
- User registration and management with roles: Admin, Head Branch, Staff, Finance
- Role-based access control
- Branch creation and user assignment

### 2. Inventory Management
- Product categories: Products, Raw Materials, Others
- Product registration with expiry and production dates
- Inventory dashboard per branch with stock, expired, waste, tester, in/out counts
- Opening and closing stock reports

### 3. Stock Transfer Between Branches
- Transfer input with stock availability check
- Delivery note (PDF) generation
- Receiving process with condition checks and waste recording

### 4. Sales Transactions
- Product selection and cart management
- Payment methods: Cash and QRIS Static
- Transaction recording and stock deduction
- Sales reports and printing

### 5. Delivery Note Template
- Item name, expiry date, quantity sent/received, condition notes, signatures

### 6. SOP Implementation
- Stock sending and receiving procedures

### 7. Delivery Schedule
- Production and branch demand rates
- Scheduled deliveries

## End Goal
- Multi-branch inventory with expiry-sensitive stock
- Role-based access
- Internal branch POS system
- Complete transaction and logistics recording
