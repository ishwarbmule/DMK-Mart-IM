package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/algolsoft/engine/services/finance/internal/service"
)

func main() {
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "algolsoft_admin")
	dbPass := getEnv("DB_PASS", "enterprise_secure_password_2026")
	dbName := getEnv("DB_NAME", "algolsoft_erp")
	httpPort := getEnv("PORT", "8080")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to open DB connection: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(50)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	financeSvc := service.NewFinanceService(db)

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":    "HEALTHY",
			"service":   "finance-service",
			"version":   "4.5.0-PROD",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	http.HandleFunc("/api/v1/finance/journals", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}

		var cmd service.CreateJournalCommand
		if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"bad request","details":"%v"}`, err), http.StatusBadRequest)
			return
		}

		id, err := financeSvc.PostJournalEntry(r.Context(), cmd)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"posting failed","details":"%v"}`, err), http.StatusUnprocessableEntity)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"journal_entry_id": id,
			"status":           "POSTED",
			"message":          "Journal entry committed to general ledger with ACID integrity.",
		})
	})

	log.Printf("Starting ALGOLSOFT Finance Service on port %s...", httpPort)
	if err := http.ListenAndServe(":"+httpPort, nil); err != nil {
		log.Fatalf("Server terminated unexpectedly: %v", err)
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
