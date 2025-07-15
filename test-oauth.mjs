#!/usr/bin/env node
// OAuth Setup Test Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 OAuth Setup Test Script');
console.log('==========================');

// Check if Supabase is configured
const supabaseClientPath = path.join(__dirname, 'src', 'integrations', 'supabase', 'client.ts');
if (fs.existsSync(supabaseClientPath)) {
  console.log('✅ Supabase client is configured');
  const clientContent = fs.readFileSync(supabaseClientPath, 'utf8');
  
  if (clientContent.includes('wvpaewutdxxkpxtokfkl')) {
    console.log('✅ Supabase URL is set');
  } else {
    console.log('❌ Supabase URL not found');
  }
  
  if (clientContent.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
    console.log('✅ Supabase anon key is set');
  } else {
    console.log('❌ Supabase anon key not found');
  }
} else {
  console.log('❌ Supabase client not found');
}

console.log('\nChecking OAuth components...');

// Check for OAuth component
const oauthComponentPath = path.join(__dirname, 'src', 'components', 'auth', 'EcoConnect.tsx');
if (fs.existsSync(oauthComponentPath)) {
  console.log('✅ OAuth component (EcoConnect.tsx) exists');
  const componentContent = fs.readFileSync(oauthComponentPath, 'utf8');
  
  if (componentContent.includes('signInWithOAuth')) {
    console.log('✅ OAuth handler is implemented');
  } else {
    console.log('❌ OAuth handler not found');
  }
  
  if (componentContent.includes("handleSocialLogin('google')")) {
    console.log('✅ Google OAuth button is present');
  } else {
    console.log('❌ Google OAuth button not found');
  }
  
  if (componentContent.includes("handleSocialLogin('github')")) {
    console.log('✅ GitHub OAuth button is present');
  } else {
    console.log('❌ GitHub OAuth button not found');
  }
} else {
  console.log('❌ OAuth component not found');
}

console.log('\nNext steps:');
console.log('1. 📖 Read the OAUTH_SETUP_GUIDE.md file');
console.log('2. 🔧 Configure Google and GitHub OAuth in Supabase dashboard');
console.log('3. 🧪 Test the OAuth flow in your application');
console.log('4. 🚀 Deploy and test in production');
