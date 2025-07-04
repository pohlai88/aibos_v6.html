# Revenue Module

## Overview
Comprehensive revenue recognition module for AIBOS, providing MFRS 15 compliance, contract analysis, and performance obligation management.

## Features
- **MFRS 15 Compliance**: Revenue from contracts with customers
- **Contract Analysis**: Performance obligation identification
- **Revenue Allocation**: Automated revenue recognition
- **SST Compliance**: Malaysian SST registration validation
- **Contract Management**: Contract lifecycle tracking
- **Revenue Forecasting**: Predictive revenue modeling
- **Audit Trail**: Complete revenue audit logging

## Structure
```
Revenue/
├── components/     # React components for UI
├── services/       # Business logic and API calls
├── types/          # TypeScript type definitions
└── README.md       # This file
```

## Revenue Recognition Process

### **MFRS 15 - Revenue from Contracts**
- Contract identification and analysis
- Performance obligation identification
- Transaction price determination
- Revenue allocation to obligations
- Revenue recognition timing

### **Performance Obligations**
- Distinct goods and services
- Series of distinct goods/services
- Stand-ready obligations
- Material rights

### **Revenue Allocation**
- Standalone selling price
- Adjusted market assessment
- Expected cost plus margin
- Residual approach

### **SST Compliance**
- SST registration threshold (RM 500,000)
- SST calculation and reporting
- Input tax credit management
- SST return filing

## Integration
- **Frontend**: React components with TypeScript
- **Backend**: Supabase functions and RLS policies
- **Database**: PostgreSQL with revenue audit trails
- **Security**: Row-level security and audit logging

## Development Status
🚧 **In Progress** - Converting from Python backend to AIBOS-compliant structure 