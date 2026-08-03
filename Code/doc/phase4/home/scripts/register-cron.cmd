@echo off
setlocal
REM Home: register weekly-lesson-digest. Example:
REM   register-cron.cmd chat:oc_xxxxxxxx
if "%~1"=="" (
  echo Usage: register-cron.cmd ^<FeishuTo^>
  echo Example: register-cron.cmd chat:oc_xxxxxxxx
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\cron\register-weekly-lesson-digest.ps1" -FeishuTo "%~1"
exit /b %ERRORLEVEL%
