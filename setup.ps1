Write-Host "=============================================="
Write-Host "Setting up your local environment..."
Write-Host "=============================================="
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install it from https://nodejs.org/"
    Pause
    exit 1
}

Write-Host "Copying template files..."
Get-ChildItem -Recurse -Include "*.template.json", "*.example" | ForEach-Object {
    $target = $_.FullName `
        -replace "\.template\.json$", ".json" `
        -replace "\.example$", ""
    if (-not (Test-Path $target)) {
        Copy-Item $_.FullName $target
        Write-Host "Created $($target) from $($_.Name)"
    }
    else {
        Write-Host "$($target) already exists. Skipping."
    }
}

Write-Host ""
Write-Host "Creating environment files if missing..."

$devEnvPath = ".env.development"
$prodEnvPath = ".env.production"

if (-not (Test-Path $devEnvPath)) {
    @"
# Development Environment
NODE_ENV=development
VITE_STORAGE_MODE=
VITE_LOCAL_API=
"@ | Out-File -Encoding utf8 $devEnvPath
    Write-Host "Created $devEnvPath with empty values."
} else {
    Write-Host "$devEnvPath already exists. Skipping."
}

if (-not (Test-Path $prodEnvPath)) {
    @"
# Production Environment
NODE_ENV=production
VITE_STORAGE_MODE=
VITE_AWS_API=
VITE_S3_BUCKET_URL=
"@ | Out-File -Encoding utf8 $prodEnvPath
    Write-Host "Created $prodEnvPath with empty values."
} else {
    Write-Host "$prodEnvPath already exists. Skipping."
}

Write-Host ""
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."

    if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
        Write-Host "Yarn not found. Installing globally via npm..."
        try {
            npm install -g yarn
            Write-Host "Yarn installed successfully."
        } catch {
            Write-Host "[ERROR] Failed to install Yarn. Please check your npm setup." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Yarn is already installed."
    }

    try {
        Write-Host "Running 'yarn install'..."
        yarn install
    } catch {
        Write-Host "[ERROR] Failed to run 'yarn install'. Make sure you are in a valid project directory." -ForegroundColor Red
        exit 1
    }

    try {
        Write-Host "Setting up ShadCn"
        npx shadcn@latest init
    } catch {
        Write-Host "[ERROR] Failed to run 'npx shadcn@latest init'."
        exit 1
    }
} else {
    Write-Host "node_modules folder already exists. Skipping dependency installation."
}


Write-Host ""
Write-Host "=============================================="
Write-Host "Setup complete! You can now run the project."
Write-Host "=============================================="
Pause
