@echo off
setlocal
set SITE=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site
REM Pass-through: -WorkDir -Goal [-TimeoutSec] [-Model]
powershell -NoProfile -ExecutionPolicy Bypass -File "%SITE%\Code\orchestration\openclaw\invoke-cursor-agent.ps1" %*
exit /b %ERRORLEVEL%
