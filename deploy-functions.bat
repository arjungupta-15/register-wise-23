@echo off
echo ========================================
echo Deploying Supabase Edge Functions
echo ========================================
echo.

echo Step 1: Deploying create-payment function...
call npx supabase functions deploy create-payment --no-verify-jwt
echo.

echo Step 2: Deploying verify-payment function...
call npx supabase functions deploy verify-payment --no-verify-jwt
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set secrets in Supabase Dashboard
echo 2. Test payment flow
echo.
pause
