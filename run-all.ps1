# ──────────────────────────────────────────────────────────────
# TenderEase — Run All Services Script
# ──────────────────────────────────────────────────────────────

param(
    [string]$Choice = "",
    [switch]$Headless = $false
)

$ErrorActionPreference = "Stop"

# Clear host
Clear-Host

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "           Tenderease.lk E-Procurement            " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Check local ports for RabbitMQ and Redis
function Test-PortListening ($port) {
    $conn = New-Object System.Net.Sockets.TcpClient
    try {
        $conn.Connect("127.0.0.1", $port)
        $conn.Close()
        return $true
    } catch {
        return $false
    }
}

Write-Host "Checking infrastructure dependencies..." -ForegroundColor Gray
$rabbitRunning = Test-PortListening 5672
$redisRunning = Test-PortListening 6379

if ($rabbitRunning) {
    Write-Host "[✓] RabbitMQ is running on port 5672" -ForegroundColor Green
} else {
    Write-Host "[✗] RabbitMQ is NOT running on port 5672" -ForegroundColor Red
}

if ($redisRunning) {
    Write-Host "[✓] Redis is running on port 6379" -ForegroundColor Green
} else {
    Write-Host "[✗] Redis is NOT running on port 6379" -ForegroundColor Red
}

if (-not $rabbitRunning -or -not $redisRunning) {
    Write-Host "`n[!] Missing Infrastructure Dependency" -ForegroundColor Yellow
    Write-Host "Please start Redis and RabbitMQ. If you use Docker, you can run:" -ForegroundColor Yellow
    if (-not $redisRunning) {
        Write-Host "  docker run -d --name tenderease-redis -p 6379:6379 redis:alpine" -ForegroundColor Cyan
    }
    if (-not $rabbitRunning) {
        Write-Host "  docker run -d --name tenderease-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management" -ForegroundColor Cyan
    }
    Write-Host ""
}

# 2. Load Environment Variables from backend\.env
$envFilePath = Join-Path $PSScriptRoot "backend\.env"
if (Test-Path $envFilePath) {
    Write-Host "Loading environment variables from backend\.env..." -ForegroundColor Gray
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split '=', 2
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $val = $parts[1].Trim()
                # Remove quotes if present
                $val = $val -replace "^['`"]", "" -replace "['`"]$", ""
                [System.Environment]::SetEnvironmentVariable($name, $val, [System.EnvironmentVariableTarget]::Process)
            }
        }
    }
} else {
    Write-Warning "backend\.env file not found! Using default values."
}

# 3. Define microservices
$services = @(
    @{ name = "eureka-server"; path = "backend\eureka-server" },
    @{ name = "api-gateway"; path = "backend\api-gateway" },
    @{ name = "user-service"; path = "backend\user-service" },
    @{ name = "tender-service"; path = "backend\tender-service" },
    @{ name = "bid-service"; path = "backend\bid-service" },
    @{ name = "evaluation-service"; path = "backend\evaluation-service" },
    @{ name = "workflow-service"; path = "backend\workflow-service" },
    @{ name = "contract-service"; path = "backend\contract-service" },
    @{ name = "payment-service"; path = "backend\payment-service" },
    @{ name = "document-service"; path = "backend\document-service" },
    @{ name = "notification-service"; path = "backend\notification-service" },
    @{ name = "clarification-service"; path = "backend\clarification-service" },
    @{ name = "qa-service"; path = "backend\qa-service" },
    @{ name = "appeal-service"; path = "backend\appeal-service" },
    @{ name = "reporting-service"; path = "backend\reporting-service" }
)

if (-not $Choice) {
    Write-Host "`nOptions:" -ForegroundColor Cyan
    Write-Host "1. Start Core Services only (Eureka, Gateway, User Service, Tender Service + Frontend)" -ForegroundColor White
    Write-Host "2. Start ALL Services (15 backend microservices + Frontend)" -ForegroundColor White
    Write-Host "3. Start Frontend only" -ForegroundColor White
    Write-Host "4. Exit" -ForegroundColor White

    $Choice = Read-Host "`nEnter choice [1-4]"
}

if ($Choice -eq "1") {
    $selected = @("eureka-server", "api-gateway", "user-service", "tender-service")
} elseif ($Choice -eq "2") {
    $selected = $services | ForEach-Object { $_.name }
} elseif ($Choice -eq "3") {
    $selected = @()
} else {
    Write-Host "Exiting."
    Exit
}

# Launch Backend Services
if ($selected.Count -gt 0) {
    if ($Headless) {
        Write-Host "`nLaunching backend services in background..." -ForegroundColor Cyan
        $logsDir = Join-Path $PSScriptRoot "logs"
        if (-not (Test-Path $logsDir)) {
            New-Item -ItemType Directory -Path $logsDir | Out-Null
        }
    } else {
        Write-Host "`nLaunching backend services in separate windows..." -ForegroundColor Cyan
    }

    foreach ($srvName in $selected) {
        $srv = $services | Where-Object { $_.name -eq $srvName }
        if ($srv) {
            $workingDir = Join-Path $PSScriptRoot $srv.path
            Write-Host "Starting $($srv.name)..." -ForegroundColor Gray
            if ($Headless) {
                $outLog = Join-Path $logsDir "$($srv.name).log"
                $errLog = Join-Path $logsDir "$($srv.name)-error.log"
                Start-Process cmd -ArgumentList "/c mvn spring-boot:run" -WorkingDirectory $workingDir -NoNewWindow -RedirectStandardOutput $outLog -RedirectStandardError $errLog
            } else {
                Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run" -WorkingDirectory $workingDir
            }
            Start-Sleep -Seconds 2 # Stagger startup
        }
    }
}

# Launch Frontend
Write-Host "`nStarting Next.js Frontend..." -ForegroundColor Cyan
$frontendDir = Join-Path $PSScriptRoot "frontend"
if ($Headless) {
    $logsDir = Join-Path $PSScriptRoot "logs"
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir | Out-Null
    }
    $outLog = Join-Path $logsDir "frontend.log"
    $errLog = Join-Path $logsDir "frontend-error.log"
    Start-Process cmd -ArgumentList "/c npm run dev" -WorkingDirectory $frontendDir -NoNewWindow -RedirectStandardOutput $outLog -RedirectStandardError $errLog
    Write-Host "`nAll selected services have been launched in the background!" -ForegroundColor Green
    Write-Host "Logs are being redirected to the 'logs/' folder in the project root." -ForegroundColor Green
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cmd /c npm run dev" -WorkingDirectory $frontendDir
    Write-Host "`nAll selected services have been launched!" -ForegroundColor Green
    Write-Host "Check the new PowerShell windows for logs." -ForegroundColor Green
}
