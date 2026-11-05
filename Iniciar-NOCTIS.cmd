@echo off
setlocal
title NOCTIS - Preview local
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js/npm nao foi encontrado neste terminal do Windows.
  echo Instale Node.js LTS e abra este arquivo novamente.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Dependencias ausentes. Execute npm ci nesta pasta antes de continuar.
  pause
  exit /b 1
)
echo NOCTIS - mantenha esta janela aberta enquanto usa o site.
echo Quando aparecer Local, abra http://127.0.0.1:5180/ no Brave.
echo Para encerrar, pressione Ctrl+C nesta janela.
echo.
call npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
echo.
echo A previa foi encerrada. Se houve erro, copie a mensagem acima.
pause
