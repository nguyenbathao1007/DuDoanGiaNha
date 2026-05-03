param(
    [string]$ProjectName = "project-name"
)

$Root = Join-Path -Path (Get-Location) -ChildPath $ProjectName

$Directories = @(
    "data",
    "notebooks",
    "models",
    "frontend",
    "frontend/src",
    "backend",
    "report",
    "screenshots",
    "weekly-reports",
    "docs"
)

$Files = @(
    "README.md",
    "requirements.txt",
    "wandb_link.txt",
    "data/dataset.csv",
    "notebooks/project_analysis.ipynb",
    "models/model_package.joblib",
    "frontend/package.json",
    "report/report.pdf",
    "screenshots/demo_fe_be.png",
    "screenshots/wandb_dashboard.png",
    "weekly-reports/week-1.md",
    "docs/api-docs.md"
)

if (-not (Test-Path -Path $Root)) {
    New-Item -Path $Root -ItemType Directory | Out-Null
}

foreach ($dir in $Directories) {
    $dirPath = Join-Path -Path $Root -ChildPath $dir
    if (-not (Test-Path -Path $dirPath)) {
        New-Item -Path $dirPath -ItemType Directory -Force | Out-Null
    }
}

foreach ($file in $Files) {
    $filePath = Join-Path -Path $Root -ChildPath $file
    if (-not (Test-Path -Path $filePath)) {
        New-Item -Path $filePath -ItemType File -Force | Out-Null
    }
}

Write-Host "Project structure created at: $Root"
