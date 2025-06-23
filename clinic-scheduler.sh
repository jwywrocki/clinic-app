#!/bin/bash

# Skrypt automatyzacji zadań dla systemu clinic-app
# Używany przez cron do automatycznego uruchamiania backupów i czyszczenia

# Konfiguracja
APP_URL="http://localhost:4000"  # Zmień na właściwy URL aplikacji
SECRET_KEY="Auto-Backup-Secret-2025-Clinic-App-jKw73D!"  # Musi być taki sam jak w .env.local
LOG_FILE="$(dirname "$0")/logs/scheduler.log"  # Lokalne logi w katalogu aplikacji

# Funkcja logowania
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Funkcja wykonania zadania schedulera
execute_scheduler_task() {
    local task_type="$1"
    local url="${APP_URL}/api/admin/scheduler?task=${task_type}"

    log_message "Uruchamianie zadania: $task_type"

    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $SECRET_KEY" \
        -H "Content-Type: application/json" \
        "$url")

    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        log_message "Zadanie $task_type zostało wykonane pomyślnie"
        log_message "Odpowiedź: $response_body"
        return 0
    else
        log_message "BŁĄD: Zadanie $task_type nie powiodło się (HTTP: $http_code)"
        log_message "Odpowiedź: $response_body"
        return 1
    fi
}

# Główna funkcja
main() {
    case "$1" in
        "backup")
            log_message "=== Uruchamianie automatycznego backupu ==="
            execute_scheduler_task "backup"
            ;;
        "cleanup")
            log_message "=== Uruchamianie czyszczenia starych backupów ==="
            execute_scheduler_task "cleanup"
            ;;
        "all")
            log_message "=== Uruchamianie wszystkich zadań schedulera ==="
            execute_scheduler_task "all"
            ;;
        "status")
            log_message "=== Sprawdzanie statusu schedulera ==="
            response=$(curl -s "${APP_URL}/api/admin/scheduler")
            log_message "Status: $response"
            ;;
        *)
            echo "Użycie: $0 {backup|cleanup|all|status}"
            echo ""
            echo "Zadania:"
            echo "  backup  - Uruchom automatyczny backup bazy danych"
            echo "  cleanup - Usuń stare kopie zapasowe zgodnie z polityką retencji"
            echo "  all     - Uruchom backup i cleanup"
            echo "  status  - Sprawdź status schedulera"
            echo ""
            echo "Przykłady cron:"
            echo "# Backup codziennie o 2:00"
            echo "0 2 * * * /path/to/clinic-scheduler.sh backup"
            echo ""
            echo "# Cleanup starych backupów codziennie o 3:00"
            echo "0 3 * * * /path/to/clinic-scheduler.sh cleanup"
            echo ""
            echo "# Backup co godzinę (jeśli włączone w ustawieniach)"
            echo "0 * * * * /path/to/clinic-scheduler.sh backup"
            exit 1
            ;;
    esac
}

# Sprawdź czy aplikacja jest dostępna
if ! curl -s "$APP_URL" > /dev/null; then
    log_message "BŁĄD: Aplikacja nie jest dostępna pod adresem $APP_URL"
    exit 1
fi

# Uruchom główną funkcję
main "$@"
