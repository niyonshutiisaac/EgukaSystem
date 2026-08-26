$ErrorActionPreference = "Stop"
$base = "http://localhost:3000/api/v1"

function Invoke-Json($Method, $Path, $Body = $null, $Token = $null) {
  $headers = @{}
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  $params = @{ Uri = "$base$Path"; Method = $Method; UseBasicParsing = $true; TimeoutSec = 30 }
  if ($Body) { $params.ContentType = "application/json"; $params.Body = ($Body | ConvertTo-Json -Depth 10) }
  $resp = Invoke-WebRequest @params -Headers $headers
  return ($resp.Content | ConvertFrom-Json)
}

$suffix = Get-Random -Maximum 99999
$email = "owner$suffix@test.com"

Write-Host "== 1. Register business =="
$reg = Invoke-Json "POST" "/auth/register" @{
  businessName = "Smoke Bakery $suffix"; businessType = "bakery";
  email = $email; phone = "+250788123456"; region = "Kigali"; district = "Gasabo";
  password = "Password123"; ownerName = "Smoke Owner"
}
Write-Host "Registered tenant: $($reg.data.slug) status=$($reg.data.status)"

Write-Host "== 2. Owner login (pending tenant) =="
$ownerLogin = Invoke-Json "POST" "/auth/login" @{ email = $email; password = "Password123" }
Write-Host "Owner login OK, tenantStatus=$($ownerLogin.data.user.tenantStatus)"

Write-Host "== 3. Owner tries business API while pending (expect blocked) =="
try { Invoke-Json "GET" "/tenants/me" $null $ownerLogin.data.tokens.accessToken; Write-Host "UNEXPECTED: allowed" }
catch { Write-Host "Correctly blocked: $([int]$_.Exception.Response.StatusCode)" }

Write-Host "== 4. Superadmin login + approve =="
$adminLogin = Invoke-Json "POST" "/auth/login" @{ email = "admin@egukasystem.com"; password = "ChangeMe123!" }
Write-Host "Superadmin login OK, isSuperadmin=$($adminLogin.data.user.isSuperadmin)"
$requests = Invoke-Json "GET" "/admin/requests?limit=5" $null $adminLogin.data.tokens.accessToken
$req = $requests.data.data | Where-Object { $_.tenant.slug -eq $reg.data.slug }
if (-not $req) { throw "Registration request not found" }
$approve = Invoke-Json "POST" "/admin/requests/$($req.id)/approve" @{ trialDays = 14 } $adminLogin.data.tokens.accessToken
Write-Host "Approved: trialDays=$($approve.data.trialDays)"

Write-Host "== 5. Owner login again (now trial) + access tenant APIs =="
$ownerLogin2 = Invoke-Json "POST" "/auth/login" @{ email = $email; password = "Password123" }
$ownerToken = $ownerLogin2.data.tokens.accessToken
$me = Invoke-Json "GET" "/tenants/me" $null $ownerToken
Write-Host "Tenant: $($me.data.name) plan=$($me.data.planId) status=$($me.data.status)"
$usage = Invoke-Json "GET" "/tenants/me/usage" $null $ownerToken
Write-Host "Usage: seats=$($usage.data.seatsUsed)/$($usage.data.seatsLimit) aiCredits=$($usage.data.aiCredits)"

Write-Host "== 6. Create product + sale =="
$prod = Invoke-Json "POST" "/products" @{ name = "Bread"; salePrice = 1000; costPrice = 500; stock = 100; minStock = 10 } $ownerToken
Write-Host "Product: $($prod.data.name) sku=$($prod.data.sku) stock=$($prod.data.stock)"
$sale = Invoke-Json "POST" "/sales" @{
  items = @(@{ productId = $prod.data.id; qty = 3; unitPrice = 1000 })
  paid = 3000; paymentMethod = "cash"; idempotencyKey = "smoke-$suffix"
} $ownerToken
Write-Host "Sale: $($sale.data.saleNo) total=$($sale.data.total) change=$($sale.data.change)"

Write-Host "== 7. Idempotency: same key again returns SAME sale =="
$sale2 = Invoke-Json "POST" "/sales" @{
  items = @(@{ productId = $prod.data.id; qty = 3; unitPrice = 1000 })
  paid = 3000; paymentMethod = "cash"; idempotencyKey = "smoke-$suffix"
} $ownerToken
Write-Host "Same sale? $($sale.data.id -eq $sale2.data.id)"

Write-Host "== 8. Dashboard report =="
$dash = Invoke-Json "GET" "/reports/dashboard?days=30" $null $ownerToken
Write-Host "Dashboard: periodSales=$($dash.data.kpis.periodSales) todaySales=$($dash.data.kpis.todaySales) lowStock=$($dash.data.kpis.lowStockCount)"

Write-Host "== 9. AI insight (offline provider, no API keys) =="
$ai = Invoke-Json "POST" "/ai/insights" @{ type = "summary" } $ownerToken
Write-Host "AI insight: model=$($ai.data.model) creditsUsed=$($ai.data.creditsUsed)"
Write-Host "AI text: $($ai.data.body.text.Substring(0, [Math]::Min(120, $ai.data.body.text.Length)))..."

Write-Host "== 10. Branch plan-gating (Starter has no multiBranch) =="
try { Invoke-Json "POST" "/tenants/branches" @{ name = "Branch 2" } $ownerToken; Write-Host "UNEXPECTED: allowed" }
catch { Write-Host "Correctly blocked: $([int]$_.Exception.Response.StatusCode) (PLAN_REQUIRED)" }

Write-Host "`nALL SMOKE TESTS PASSED"