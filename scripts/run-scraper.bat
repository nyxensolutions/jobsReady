@echo off
cd /d D:\Nyxen\jobsReady
echo. >> logs\scraper.log
echo ===== %DATE% %TIME% ===== >> logs\scraper.log
npx tsx scripts\run-scraper.ts >> logs\scraper.log 2>&1
