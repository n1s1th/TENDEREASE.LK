$envFilePath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFilePath) {
    Write-Host "Loading environment variables from backend/.env..." -ForegroundColor Gray
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split '=', 2
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $val = $parts[1].Trim()
                $val = $val -replace "^['`"]", "" -replace "['`"]$", ""
                [System.Environment]::SetEnvironmentVariable($name, $val, [System.EnvironmentVariableTarget]::Process)
            }
        }
    }
}
Write-Host "Starting bid-service..." -ForegroundColor Cyan
cd bid-service
& 'C:\Users\User\.m2\wrapper\dists\apache-maven-3.9.12\59fe215c0ad6947fea90184bf7add084544567b927287592651fda3782e0e798\bin\mvn.cmd' spring-boot:run
