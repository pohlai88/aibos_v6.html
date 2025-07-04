"""
Unit tests for the journal entries module.
"""

import pytest
from decimal import Decimal
from uuid import uuid4, UUID
from datetime import datetime
from packages.modules.ledger.domain.tenant_service import TenantConfig, set_tenant_context, clear_tenant_context

from packages.modules.ledger.domain.journal_entries import (
    Account, AccountType, JournalEntry, LedgerService, TransactionType
)


@pytest.fixture(autouse=True)
def default_tenant_context():
    tenant_id = uuid4()
    tenant_config = TenantConfig(
        tenant_id=tenant_id,
        name="Test Tenant",
        default_currency="MYR",
        fiscal_year_start_month=1,
        fiscal_year_start_day=1,
        timezone="Asia/Kuala_Lumpur",
        country_code="MY"
    )
    set_tenant_context(tenant_id, tenant_config)
    yield
    clear_tenant_context()


class TestAccount:
    """Test Account class functionality."""
    
    def test_account_creation(self):
        """Test basic account creation."""
        account = Account(code="1000", name="Cash", type=AccountType.ASSET)
        assert account.code == "1000"
        assert account.name == "Cash"
        assert account.type == AccountType.ASSET


class TestJournalEntry:
    """Test JournalEntry class functionality."""
    
    def test_entry_creation(self):
        """Test basic entry creation."""
        entry = JournalEntry(reference="TEST-001", description="Test entry")
        assert entry.reference == "TEST-001"
        assert entry.description == "Test entry"
        assert entry.is_posted is False
    
    def test_add_line(self):
        """Test adding lines to an entry."""
        entry = JournalEntry(reference="TEST-001", description="Test entry")
        account_id = uuid4()
        
        line = entry.add_line(account_id, debit_amount=Decimal('100.00'))
        assert len(entry.lines) == 1
        assert line.account_id == account_id
        assert line.debit_amount == Decimal('100.00')
    
    def test_validate_balanced_entry(self, monkeypatch):
        """Test validation of a balanced entry."""
        monkeypatch.setattr(
            "packages.modules.ledger.domain.journal_entries.get_compliance_report",
            lambda entity_id: {"compliance_score": 100}
        )
        entry = JournalEntry(
            reference="TEST-001",
            description="Test entry",
            user_id="test_user",
            entity_id="test_entity",
            originating_module="test_module"
        )
        account1_id = uuid4()
        account2_id = uuid4()
        entry.add_line(account1_id, debit_amount=Decimal('100.00'))
        entry.add_line(account2_id, credit_amount=Decimal('100.00'))
        result = entry.validate()
        assert isinstance(result, dict)
        assert result["valid"] is True

    def test_validate_unbalanced_entry_raises_error(self):
        """Test that validation of unbalanced entry raises ValueError."""
        entry = JournalEntry(
            reference="TEST-001",
            description="Test entry",
            user_id="test_user",
            entity_id="test_entity",
            originating_module="test_module"
        )
        account1_id = uuid4()
        account2_id = uuid4()
        entry.add_line(account1_id, debit_amount=Decimal('100.00'))
        entry.add_line(account2_id, credit_amount=Decimal('50.00'))
        result = entry.validate()
        assert isinstance(result, dict)
        assert result["valid"] is False
        assert any("Debits and credits must balance." in err for err in result["errors"])


class TestLedgerService:
    """Test LedgerService class functionality."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = LedgerService()
    
    def test_create_account(self):
        """Test account creation."""
        account = self.service.create_account("1000", "Cash", AccountType.ASSET)
        assert account.code == "1000"
        assert account.name == "Cash"
        assert account.id in self.service.accounts
    
    def test_create_journal_entry(self):
        """Test journal entry creation."""
        entry = self.service.create_journal_entry("TEST-001", "Test entry")
        assert entry.reference == "TEST-001"
        assert entry.description == "Test entry"
    
    def test_post_journal_entry(self):
        """Test posting a journal entry."""
        account1 = self.service.create_account("1000", "Cash", AccountType.ASSET)
        account2 = self.service.create_account("2000", "Accounts Payable", AccountType.LIABILITY)
        
        entry = self.service.create_journal_entry("TEST-001", "Test entry")
        entry.add_line(account1.id, debit_amount=Decimal('100.00'))
        entry.add_line(account2.id, credit_amount=Decimal('100.00'))
        
        self.service.post_journal_entry(entry)
        assert entry.is_posted is True
        assert entry in self.service.journal_entries 