package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

var (
	ErrUnbalancedJournal = errors.New("total debits must exactly equal total credits")
)

type JournalLineDTO struct {
	AccountID    uuid.UUID       `json:"account_id"`
	EntrySide    string          `json:"entry_side"` // "DEBIT" or "CREDIT"
	Amount       decimal.Decimal `json:"amount"`
	Memo         string          `json:"memo"`
	CostCenterID *uuid.UUID     `json:"cost_center_id,omitempty"`
}

type CreateJournalCommand struct {
	TenantID       uuid.UUID        `json:"tenant_id"`
	EntryNumber    string           `json:"entry_number"`
	FiscalPeriodID uuid.UUID        `json:"fiscal_period_id"`
	PostingDate    time.Time        `json:"posting_date"`
	SourceModule   string           `json:"source_module"`
	HeaderMemo     string           `json:"header_memo"`
	Lines          []JournalLineDTO `json:"lines"`
	CreatedBy      uuid.UUID        `json:"created_by"`
}

type FinanceServiceImpl struct {
	db *sql.DB
}

func NewFinanceService(db *sql.DB) *FinanceServiceImpl {
	return &FinanceServiceImpl{db: db}
}

func (s *FinanceServiceImpl) PostJournalEntry(ctx context.Context, cmd CreateJournalCommand) (uuid.UUID, error) {
	var totalDebit, totalCredit decimal.Decimal
	for _, line := range cmd.Lines {
		if line.Amount.LessThanOrEqual(decimal.Zero) {
			return uuid.Nil, errors.New("line amount must be strictly positive")
		}
		switch line.EntrySide {
		case "DEBIT":
			totalDebit = totalDebit.Add(line.Amount)
		case "CREDIT":
			totalCredit = totalCredit.Add(line.Amount)
		default:
			return uuid.Nil, fmt.Errorf("invalid entry side: %s", line.EntrySide)
		}
	}

	if !totalDebit.Equal(totalCredit) {
		return uuid.Nil, fmt.Errorf("%w: Debits (%s) != Credits (%s)", ErrUnbalancedJournal, totalDebit, totalCredit)
	}

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
	if err != nil {
		return uuid.Nil, fmt.Errorf("transaction begin failed: %w", err)
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, "SET LOCAL app.current_tenant_id = $1", cmd.TenantID.String())
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to set tenant context: %w", err)
	}

	journalID := uuid.New()
	queryHeader := `
		INSERT INTO finance.journal_entries (
			id, tenant_id, entry_number, fiscal_period_id, posting_date, document_date,
			source_module, header_memo, total_debit, total_credit, status, created_by, posted_at
		) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, 'POSTED', $10, NOW())
	`
	_, err = tx.ExecContext(ctx, queryHeader,
		journalID, cmd.TenantID, cmd.EntryNumber, cmd.FiscalPeriodID, cmd.PostingDate,
		cmd.SourceModule, cmd.HeaderMemo, totalDebit, totalCredit, cmd.CreatedBy,
	)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to insert journal header: %w", err)
	}

	queryLine := `
		INSERT INTO finance.journal_entry_lines (
			id, journal_entry_id, line_number, account_id, entry_side,
			amount_currency, amount_base_currency, line_memo, cost_center_id
		) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
	`
	stmtLine, err := tx.PrepareContext(ctx, queryLine)
	if err != nil {
		return uuid.Nil, fmt.Errorf("prepare line statement failed: %w", err)
	}
	defer stmtLine.Close()

	for idx, line := range cmd.Lines {
		lineID := uuid.New()
		_, err = stmtLine.ExecContext(ctx,
			lineID, journalID, idx+1, line.AccountID, line.EntrySide,
			line.Amount, line.Memo, line.CostCenterID,
		)
		if err != nil {
			return uuid.Nil, fmt.Errorf("failed to insert line #%d: %w", idx+1, err)
		}
	}

	eventPayload, _ := json.Marshal(map[string]interface{}{
		"journal_entry_id": journalID,
		"entry_number":     cmd.EntryNumber,
		"tenant_id":        cmd.TenantID,
		"total_amount":     totalDebit,
		"posting_date":     cmd.PostingDate,
	})

	queryOutbox := `
		INSERT INTO core.transactional_outbox (
			id, tenant_id, aggregate_type, aggregate_id, event_type, payload_json, status
		) VALUES ($1, $2, 'JOURNAL_ENTRY', $3, 'finance.journal.posted', $4, 'PENDING')
	`
	_, err = tx.ExecContext(ctx, queryOutbox, uuid.New(), cmd.TenantID, journalID.String(), eventPayload)
	if err != nil {
		return uuid.Nil, fmt.Errorf("outbox insert failed: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return uuid.Nil, fmt.Errorf("commit failed: %w", err)
	}

	return journalID, nil
}
