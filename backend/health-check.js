require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

async function runHealthCheck() {
  console.log('=== COMPREHENSIVE SYSTEM HEALTH CHECK ===\n');

  // 1. Environment Variables Check
  console.log('🔧 ENVIRONMENT VARIABLES:');
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET', 
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FRONTEND_URL',
    'PORT'
  ];

  let envIssues = [];
  requiredEnvVars.forEach(varName => {
    const status = process.env[varName] ? '✅' : '❌';
    console.log(`${status} ${varName}: ${process.env[varName] ? 'SET' : 'MISSING'}`);
    if (!process.env[varName]) envIssues.push(varName);
  });

  // 2. MongoDB Connection Test
  console.log('\n🗄️  MONGODB CONNECTION:');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB: Connected successfully');
    
    // Test database operations
    const Student = require('./src/models/Student');
    const Company = require('./src/models/Company');
    
    const studentCount = await Student.countDocuments();
    const companyCount = await Company.countDocuments();
    
    console.log(`📊 Students: ${studentCount} records`);
    console.log(`🏢 Companies: ${companyCount} records`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ MongoDB Error:', error.message);
    envIssues.push('MONGODB_CONNECTION');
  }

  // 3. Cloudinary Connection Test
  console.log('\n☁️  CLOUDINARY CONNECTION:');
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    await new Promise((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) {
          console.log('❌ Cloudinary Error:', error.message);
          envIssues.push('CLOUDINARY_CONNECTION');
          reject(error);
        } else {
          console.log('✅ Cloudinary: Connected successfully');
          console.log(`📊 Rate Limit: ${result.rate_limit_remaining}/${result.rate_limit_allowed}`);
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.log('❌ Cloudinary Setup Error:', error.message);
    envIssues.push('CLOUDINARY_SETUP');
  }

  // 4. Upload Routes Test
  console.log('\n📁 UPLOAD ROUTES:');
  try {
    const uploadRoutes = require('./src/routes/uploadRoutes');
    console.log('✅ Upload routes: Loaded successfully');
    
    // Check if routes exist
    const express = require('express');
    const app = express();
    app.use('/api/upload', uploadRoutes);
    console.log('✅ Upload middleware: Applied successfully');
  } catch (error) {
    console.log('❌ Upload Routes Error:', error.message);
    envIssues.push('UPLOAD_ROUTES');
  }

  // 5. Email Service Test
  console.log('\n📧 EMAIL SERVICE:');
  try {
    const emailService = require('./src/utils/finalEmailService');
    console.log('✅ Email service: Loaded successfully');
    
    // Check email credentials
    const hasBrevo = process.env.BREVO_USER && process.env.BREVO_PASS;
    const hasGmail = process.env.GMAIL_USER && process.env.GMAIL_PASS;
    
    console.log(`${hasBrevo ? '✅' : '❌'} Brevo: ${hasBrevo ? 'Configured' : 'Not configured'}`);
    console.log(`${hasGmail ? '✅' : '❌'} Gmail: ${hasGmail ? 'Configured' : 'Not configured'}`);
    
    if (!hasBrevo && !hasGmail) {
      envIssues.push('EMAIL_SERVICE');
    }
  } catch (error) {
    console.log('❌ Email Service Error:', error.message);
    envIssues.push('EMAIL_SERVICE');
  }

  // 6. Dependencies Check
  console.log('\n📦 DEPENDENCIES:');
  const fs = require('fs');
  const packagePath = './package.json';
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const criticalDeps = ['express', 'mongoose', 'cloudinary', 'multer', 'nodemailer', 'jsonwebtoken', 'bcryptjs'];
    
    criticalDeps.forEach(dep => {
      const hasDep = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
      console.log(`${hasDep ? '✅' : '❌'} ${dep}: ${hasDep ? 'Installed' : 'Missing'}`);
      if (!hasDep) envIssues.push(`DEPENDENCY_${dep.toUpperCase()}`);
    });
  } catch (error) {
    console.log('❌ Package.json Error:', error.message);
    envIssues.push('PACKAGE_JSON');
  }

  // 7. Port and Server Configuration
  console.log('\n🚀 SERVER CONFIG:');
  console.log(`📡 Port: ${process.env.PORT || 5000}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`🔒 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);

  // 8. File System Permissions
  console.log('\n💾 FILE SYSTEM:');
  const dirs = ['uploads', 'uploads/temp', 'uploads/resumes', 'uploads/logos'];
  dirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created: ${dir}`);
      } else {
        console.log(`✅ Exists: ${dir}`);
      }
    } catch (error) {
      console.log(`❌ Directory Error (${dir}):`, error.message);
      envIssues.push(`FILE_PERMISSIONS_${dir.replace('/', '_')}`);
    }
  });

  // 9. Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 SYSTEM HEALTH SUMMARY:');
  if (envIssues.length === 0) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL');
    console.log('✅ Ready for deployment');
  } else {
    console.log(`⚠️  FOUND ${envIssues.length} ISSUES:`);
    envIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    console.log('\n🔧 Fix these issues before deployment');
  }

  console.log('\n📊 DEPLOYMENT READINESS:');
  console.log(`${envIssues.length === 0 ? '✅' : '❌'} Environment Variables: ${envIssues.length === 0 ? 'Ready' : 'Issues Found'}`);
  console.log(`${envIssues.filter(i => i.includes('MONGODB')).length === 0 ? '✅' : '❌'} Database: ${envIssues.filter(i => i.includes('MONGODB')).length === 0 ? 'Ready' : 'Issues Found'}`);
  console.log(`${envIssues.filter(i => i.includes('CLOUDINARY')).length === 0 ? '✅' : '❌'} Cloud Storage: ${envIssues.filter(i => i.includes('CLOUDINARY')).length === 0 ? 'Ready' : 'Issues Found'}`);
  console.log(`${envIssues.filter(i => i.includes('EMAIL')).length === 0 ? '✅' : '❌'} Email Service: ${envIssues.filter(i => i.includes('EMAIL')).length === 0 ? 'Ready' : 'Issues Found'}`);
  console.log(`${envIssues.filter(i => i.includes('DEPENDENCY')).length === 0 ? '✅' : '❌'} Dependencies: ${envIssues.filter(i => i.includes('DEPENDENCY')).length === 0 ? 'Ready' : 'Issues Found'}`);

  process.exit(envIssues.length === 0 ? 0 : 1);
}

runHealthCheck().catch(console.error);
