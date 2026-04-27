# TheGreat Store — Deployment Script (Windows PowerShell)

Write-Host "Starting Deployment Check..." -ForegroundColor Cyan

# 1. Backend Preparation
Write-Host "Preparing Backend..." -ForegroundColor Yellow
cd backend
npm install
npx prisma generate
npx prisma db push
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Backend Build Failed! Please fix errors before deploying." -ForegroundColor Red
    exit 
}
cd ..

# 2. Frontend Preparation
Write-Host "Preparing Frontend..." -ForegroundColor Yellow
cd frontend
npm install
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Frontend Build Failed! Please fix errors before deploying." -ForegroundColor Red
    exit 
}
cd ..

# 3. Git Push
Write-Host "Ready to push to GitHub?" -ForegroundColor Green
$choice = Read-Host "Type 'Y' to commit and push all changes"
if ($choice -eq 'Y') {
    git add .
    git commit -m "Final production stabilization and feature updates"
    git push
    Write-Host "Successfully pushed! Check Render and Vercel for status." -ForegroundColor Green
} else {
    Write-Host "Push skipped. You can push manually when ready." -ForegroundColor Gray
}

Write-Host "Deployment Script Finished!" -ForegroundColor Cyan
