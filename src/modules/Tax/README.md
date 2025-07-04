# Tax Module

## Overview
Comprehensive tax management module for AIBOS, providing MFRS 112 compliance, GST/SST calculations, and Malaysian tax regulations.

## Features
- **MFRS 112 Compliance**: Income tax provisions and deferred tax calculations
- **GST/SST Management**: Sales and Service Tax calculations
- **Withholding Tax**: Monthly Tax Deduction (MTD) calculations
- **Corporate Tax**: CP204 installment calculations
- **Tax Reporting**: Automated tax return generation
- **Compliance Monitoring**: Real-time tax compliance status
- **Audit Trail**: Complete tax transaction logging

## Structure
```
Tax/
├── components/     # React components for UI
├── services/       # Business logic and API calls
├── types/          # TypeScript type definitions
└── README.md       # This file
```

## Tax Types Supported

### **MFRS 112 - Income Taxes**
- Deferred tax calculations
- Tax base determination
- Temporary differences
- Tax provision calculations

### **GST/SST (Goods & Services Tax / Sales & Service Tax)**
- 10% SST rate calculations
- Input tax credits
- Output tax calculations
- Tax reporting

### **Withholding Tax (MTD - Monthly Tax Deduction)**
- Progressive tax rates
- Monthly calculations
- Annual reconciliation

### **Corporate Tax**
- CP204 installment calculations (24% rate)
- Corporate tax provisions
- Tax planning tools

## Integration
- **Frontend**: React components with TypeScript
- **Backend**: Supabase functions and RLS policies
- **Database**: PostgreSQL with tax audit trails
- **Security**: Row-level security and audit logging

## Development Status
🚧 **In Progress** - Converting from Python backend to AIBOS-compliant structure 