// Journal Entry Templates Service
// Converted from Python journal_entries.py

import { LedgerService } from './LedgerService';
import {
  JournalEntry,
  TransactionType,
  Currency,
  IJournalEntryTemplates
} from '../types';

export class JournalEntryTemplates implements IJournalEntryTemplates {
  private ledgerService: LedgerService;

  constructor(ledgerService: LedgerService) {
    this.ledgerService = ledgerService;
  }

  async saleEntry(
    customer_account_id: string,
    revenue_account_id: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.SALE
    );

    // Add debit to customer account (accounts receivable)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: customer_account_id,
      debit_amount: amount,
      credit_amount: 0,
      description: `Sale to customer - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to revenue account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: revenue_account_id,
      debit_amount: 0,
      credit_amount: amount,
      description: `Revenue from sale - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async paymentEntry(
    customer_account_id: string,
    bank_account_id: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.PAYMENT
    );

    // Add debit to bank account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: bank_account_id,
      debit_amount: amount,
      credit_amount: 0,
      description: `Payment received - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to customer account (accounts receivable)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: customer_account_id,
      debit_amount: 0,
      credit_amount: amount,
      description: `Payment from customer - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async monthlySaasRevenue(
    customer_account_id: string,
    revenue_account_id: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.SALE
    );

    // Add debit to customer account (accounts receivable)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: customer_account_id,
      debit_amount: amount,
      credit_amount: 0,
      description: `Monthly SaaS subscription - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to revenue account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: revenue_account_id,
      debit_amount: 0,
      credit_amount: amount,
      description: `SaaS subscription revenue - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async deferredRevenueRecognition(
    deferred_revenue_account_id: string,
    revenue_account_id: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.ADJUSTMENT
    );

    // Add debit to deferred revenue account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: deferred_revenue_account_id,
      debit_amount: amount,
      credit_amount: 0,
      description: `Deferred revenue recognition - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to revenue account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: revenue_account_id,
      debit_amount: 0,
      credit_amount: amount,
      description: `Revenue recognized - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async proratedSubscriptionBilling(
    customer_account_id: string,
    revenue_account_id: string,
    full_amount: number,
    prorated_amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.SALE
    );

    // Add debit to customer account (accounts receivable)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: customer_account_id,
      debit_amount: prorated_amount,
      credit_amount: 0,
      description: `Prorated subscription billing - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to revenue account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: revenue_account_id,
      debit_amount: 0,
      credit_amount: prorated_amount,
      description: `Prorated subscription revenue - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async subscriptionUpgrade(
    customer_account_id: string,
    revenue_account_id: string,
    old_amount: number,
    new_amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const upgrade_amount = new_amount - old_amount;
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.SALE
    );

    // Add debit to customer account (accounts receivable)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: customer_account_id,
      debit_amount: upgrade_amount,
      credit_amount: 0,
      description: `Subscription upgrade - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to revenue account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: revenue_account_id,
      debit_amount: 0,
      credit_amount: upgrade_amount,
      description: `Upgrade revenue - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async subscriptionCancellation(
    customer_account_id: string,
    revenue_account_id: string,
    refund_amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.ADJUSTMENT
    );

    // Add debit to revenue account (revenue reversal)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: revenue_account_id,
      debit_amount: refund_amount,
      credit_amount: 0,
      description: `Subscription cancellation - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to customer account (refund)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: customer_account_id,
      debit_amount: 0,
      credit_amount: refund_amount,
      description: `Refund to customer - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async annualSubscriptionPrepayment(
    customer_account_id: string,
    deferred_revenue_account_id: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.RECEIPT
    );

    // Add debit to customer account (accounts receivable)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: customer_account_id,
      debit_amount: amount,
      credit_amount: 0,
      description: `Annual prepayment received - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to deferred revenue account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: deferred_revenue_account_id,
      debit_amount: 0,
      credit_amount: amount,
      description: `Deferred revenue - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  // Additional utility templates
  async purchaseEntry(
    supplier_account_id: string,
    expense_account_id: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.PURCHASE
    );

    // Add debit to expense account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: expense_account_id,
      debit_amount: amount,
      credit_amount: 0,
      description: `Purchase expense - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to supplier account (accounts payable)
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: supplier_account_id,
      debit_amount: 0,
      credit_amount: amount,
      description: `Purchase from supplier - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }

  async bankTransfer(
    from_account_id: string,
    to_account_id: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<JournalEntry> {
    const entry = await this.ledgerService.createJournalEntry(
      reference,
      description,
      new Date().toISOString(),
      TransactionType.TRANSFER
    );

    // Add debit to destination account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: to_account_id,
      debit_amount: amount,
      credit_amount: 0,
      description: `Transfer to - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    // Add credit to source account
    await this.ledgerService.addLineToJournalEntry(entry.id, {
      account_id: from_account_id,
      debit_amount: 0,
      credit_amount: amount,
      description: `Transfer from - ${description}`,
      currency: Currency.MYR,
      fx_rate: 1.0
    });

    return entry;
  }
} 