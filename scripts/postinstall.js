#!/usr/bin/env node

/**
 * Postinstall script for fortuning-ai
 * This runs after npm install to set up the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

console.log('🔮 Setting up Fortuning AI...\n');

// Check if .env.local exists
const envPath = path.join(projectRoot, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env.local found. Please run: fortuning-ai config');
  console.log('   or create .env.local manually from .env.example\n');
}

// Install dependencies if node_modules doesn't exist
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
  }
}

console.log('✅ Setup complete!\n');
console.log('Quick start:');
console.log('  fortuning-ai config    Configure API key');
console.log('  fortuning-ai start     Start the server');
console.log('  fortuning-ai dev       Development mode');
console.log('\nHappy fortune telling! 🔮\n');
