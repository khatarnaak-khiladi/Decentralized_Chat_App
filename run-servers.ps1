# Run the Recon app from scratch: install, build, and start both servers
# Usage: .\run-servers.ps1

Set-Location $PSScriptRoot

Write-Host "Installing dependencies..."
npm install

Write-Host "Building the app..."
npm run build

Write-Host "Starting local Gun relay server..."
$gunJob = Start-Job -Name GunServer -ScriptBlock {
    param($root)
    Set-Location $root
    npm run gun-server
} -ArgumentList $PSScriptRoot

Write-Host "Starting static app server..."
$serveJob = Start-Job -Name ServeApp -ScriptBlock {
    param($root)
    Set-Location $root
    npx serve -s build -l 5000
} -ArgumentList $PSScriptRoot

Write-Host ""
Write-Host "Gun relay: http://192.168.1.11:8765/gun"
Write-Host "App: http://192.168.1.11:5000"
Write-Host ""
Write-Host "To stop both servers, run: Stop-Job -Name GunServer, ServeApp"
Write-Host "To view logs, run: Receive-Job -Name GunServer, ServeApp -Keep"
Write-Host ""

Wait-Job -Name GunServer, ServeApp
