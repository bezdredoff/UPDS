param(
  [switch]$Publish,
  [switch]$BrowserGate,
  [string]$Workflow = 'ci.yml'
)
$ErrorActionPreference = 'Stop'
$gh = if (Test-Path 'C:\Program Files\GitHub CLI\gh.exe') { 'C:\Program Files\GitHub CLI\gh.exe' } else { 'gh' }

if (-not $Publish) {
  Write-Host 'Dry run only. Re-run with -Publish after reviewing git diff and explicitly authorizing a push.'
  git status --short --branch
  git diff --check
  exit 2
}

& $gh auth status
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI is not authenticated. Run gh auth login manually, then retry.' }

$branch = (git branch --show-current).Trim()
if (-not $branch) { throw 'Not on a named branch.' }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace errors found; refusing to publish.' }

git push --set-upstream origin $branch
if ($LASTEXITCODE -ne 0) { throw 'git push failed.' }

& $gh workflow run $Workflow --ref $branch
if ($LASTEXITCODE -ne 0) { throw "Could not dispatch $Workflow." }

Start-Sleep -Seconds 3
$run = (& $gh run list --workflow $Workflow --branch $branch --limit 1 --json databaseId,url,status,conclusion) | ConvertFrom-Json
if (-not $run) { throw "No run appeared for $Workflow on $branch." }

Write-Host "Watching $($run.url)"
& $gh run watch $run.databaseId --exit-status
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($BrowserGate) {
  & $gh workflow run browser-gate.yml --ref $branch
  if ($LASTEXITCODE -ne 0) { throw 'Could not dispatch browser-gate.yml.' }
  Start-Sleep -Seconds 3
  $browserRun = (& $gh run list --workflow browser-gate.yml --branch $branch --limit 1 --json databaseId,url) | ConvertFrom-Json
  if (-not $browserRun) { throw 'No browser-gate run appeared.' }
  Write-Host "Watching $($browserRun.url)"
  & $gh run watch $browserRun.databaseId --exit-status
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host 'GitHub Actions workflow passed.'
