@echo off
REM Backup Script for Inventory & POS System

REM Set backup directory and filenames
set BACKUP_DIR=%~dp0backups
set DATE_STR=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%
set BACKUP_FILE=inventory-pos-backup-%DATE_STR%.zip

REM Create backup directory if not exists
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

REM Zip the entire project folder excluding backups folder
powershell -Command "Compress-Archive -Path '%~dp0*' -DestinationPath '%BACKUP_DIR%\%BACKUP_FILE%' -Force -Exclude 'backups/*'"

echo Backup created at %BACKUP_DIR%\%BACKUP_FILE%

REM Database backup using pg_dump (PostgreSQL must be in PATH)
set PGPASSWORD=your_db_password
pg_dump -U your_db_user -F c -b -v -f "%BACKUP_DIR%\db-backup-%DATE_STR%.backup" inventory_pos_db

echo Database backup created at %BACKUP_DIR%\db-backup-%DATE_STR%.backup

pause
