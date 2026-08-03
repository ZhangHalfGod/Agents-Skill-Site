@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\cron\run-weekly-lesson-digest-now.ps1" %*
exit /b %ERRORLEVEL%
