@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo   Senna Recicla - Automatizador de Upload Git
echo ==================================================

:: Verifica se o Git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Git nao foi encontrado. Por favor, instale o Git antes de continuar.
    pause
    exit /b
)

:: Inicializa o repositório local se a pasta .git não existir
if not exist .git (
    echo [INFO] Inicializando repositorio Git local...
    git init
    git branch -M main
)

:: Solicita a mensagem do commit
set /p msg="Digite a mensagem do seu commit (ex: 'Versao inicial'): "
if "%msg%"=="" set msg="Atualizacao Senna Recicla"

:: Adiciona e commita os arquivos
git add .
git commit -m "%msg%"

:: Verifica se o remote 'origin' ja existe
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 goto :DEFINIR_URL
goto :FAZER_PUSH

:DEFINIR_URL
echo.
set /p repo_url="Digite a URL do seu repositorio (ex: https://github.com/usuario/projeto.git): "
if "!repo_url!"=="" (
    echo [ERRO] A URL nao pode ser vazia.
    goto :DEFINIR_URL
)
git remote add origin !repo_url!
goto :FAZER_PUSH

:FAZER_PUSH

:: Faz o upload dos arquivos
echo [INFO] Enviando arquivos para o GitHub...
git push -u origin main

echo.
echo [SUCESSO] Upload concluido!
pause