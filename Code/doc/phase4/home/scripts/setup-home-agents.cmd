@echo off
setlocal
set SITE=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site
powershell -NoProfile -ExecutionPolicy Bypass -File "%SITE%\Code\orchestration\openclaw\setup-agents.ps1" %*
exit /b %ERRORLEVEL%
