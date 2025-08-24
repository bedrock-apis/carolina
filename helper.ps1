Write-Host "Run Turbo build";
pnpm turbo run build
Write-Host "Run Node";
node.exe ./app/dist/main.js
