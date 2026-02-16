require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('=== DEPLOYMENT CRASH RISK ANALYSIS ===\n');

let crashRisks = [];
let warnings = [];

// 1. Hardcoded Values Check
console.log('🔍 HARDCODED VALUES RISKS:');
const filesToCheck = [
  'src/server.js',
  'src/routes/authRoutes.js',
  'src/routes/uploadRoutes.js',
  'src/config/cloudinary.js',
  'src/utils/finalEmailService.js'
];

filesToCheck.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for hardcoded URLs, ports, secrets
    const riskyPatterns = [
      /localhost:\d+/g,
      /mongodb:\/\/[^\/]+/g,
      /sk-[a-zA-Z0-9]+/g,
      /['"`][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}['"`]/g,
      /password\s*[:=]\s*['"`][^'"`]+['"`]/gi
    ];
    
    let hasHardcodedValues = false;
    riskyPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        // Filter out the localhost:3000 that's now in a fallback context
        const filteredMatches = matches.filter(match => {
          if (match === 'localhost:3000') {
            // Check if it's in a fallback context (process.env.FRONTEND_URL || 'localhost:3000')
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(match) && lines[i].includes('process.env.FRONTEND_URL')) {
                return false; // This is acceptable fallback usage
              }
            }
          }
          return true;
        });
        
        if (filteredMatches.length > 0) {
          console.log(`⚠️  ${filePath}: Found ${filteredMatches.length} hardcoded values`);
          filteredMatches.forEach(match => console.log(`   - ${match}`));
          crashRisks.push(`HARDCODED_${filePath.replace(/\//g, '_')}_${index}`);
          hasHardcodedValues = true;
        }
      }
    });
    
    if (!content.match(/process\.env\./)) {
      console.log(`⚠️  ${filePath}: No environment variables found`);
      warnings.push(`NO_ENV_VARS_${filePath.replace(/\//g, '_')}`);
    } else {
      console.log(`✅ ${filePath}: Uses environment variables`);
    }
  } catch (error) {
    console.log(`❌ Cannot read ${filePath}:`, error.message);
    crashRisks.push(`FILE_NOT_FOUND_${filePath.replace(/\//g, '_')}`);
  }
});

// 2. Missing Error Handling
console.log('\n🚨 ERROR HANDLING RISKS:');
try {
  const serverContent = fs.readFileSync('src/server.js', 'utf8');
  if (!serverContent.includes('try') && !serverContent.includes('catch')) {
    console.log('⚠️  Server.js: Limited error handling');
    warnings.push('LIMITED_ERROR_HANDLING');
  } else {
    console.log('✅ Server.js: Has error handling');
  }
  
  const uploadContent = fs.readFileSync('src/routes/uploadRoutes.js', 'utf8');
  if (uploadContent.includes('await') && !uploadContent.includes('try')) {
    console.log('⚠️  Upload routes: Async operations without try-catch');
    crashRisks.push('ASYNC_WITHOUT_TRY_CATCH');
  } else {
    console.log('✅ Upload routes: Has error handling');
  }
} catch (error) {
  console.log('❌ Error checking error handling:', error.message);
}

// 3. Memory Leaks Check
console.log('\n💾 MEMORY LEAK RISKS:');
try {
  const authContent = fs.readFileSync('src/routes/authRoutes.js', 'utf8');
  if (authContent.includes('setInterval') || authContent.includes('setTimeout')) {
    console.log('⚠️  Auth routes: Uses timers - potential memory leaks');
    warnings.push('TIMER_USAGE');
  } else {
    console.log('✅ Auth routes: No timer usage');
  }
  
  const serverContent = fs.readFileSync('src/server.js', 'utf8');
  if (serverContent.includes('app.listen') && !serverContent.includes('process.on')) {
    console.log('⚠️  Server: No process event handlers');
    warnings.push('NO_PROCESS_HANDLERS');
  } else {
    console.log('✅ Server: Has process handlers');
  }
} catch (error) {
  console.log('❌ Error checking memory leaks:', error.message);
}

// 4. Security Risks
console.log('\n🔒 SECURITY RISKS:');
try {
  const authContent = fs.readFileSync('src/routes/authRoutes.js', 'utf8');
  if (authContent.includes('req.body') && !authContent.includes('express.json()')) {
    console.log('⚠️  Auth routes: Uses req.body without JSON middleware');
    crashRisks.push('MISSING_JSON_MIDDLEWARE');
  } else {
    console.log('✅ Auth routes: Proper middleware usage');
  }
  
  if (authContent.includes('JWT_SECRET') && !authContent.includes('process.env.JWT_SECRET')) {
    console.log('⚠️  Auth routes: JWT_SECRET not from environment');
    crashRisks.push('HARDCODED_JWT_SECRET');
  } else {
    console.log('✅ Auth routes: JWT_SECRET from environment');
  }
} catch (error) {
  console.log('❌ Error checking security:', error.message);
}

// 5. Database Connection Risks
console.log('\n🗄️  DATABASE CONNECTION RISKS:');
try {
  const serverContent = fs.readFileSync('src/server.js', 'utf8');
  if (serverContent.includes('mongoose.connect') && !serverContent.includes('mongoose.connection.on')) {
    console.log('⚠️  Database: No connection event handlers');
    warnings.push('NO_DB_EVENT_HANDLERS');
  } else {
    console.log('✅ Database: Has connection event handlers');
  }
  
  if (!serverContent.includes('process.on(\'uncaughtException\')') && !serverContent.includes('process.on(\'unhandledRejection\')')) {
    console.log('⚠️  Process: No uncaught exception handlers');
    crashRisks.push('NO_UNCAUGHT_EXCEPTION_HANDLERS');
  } else {
    console.log('✅ Process: Has exception handlers');
  }
} catch (error) {
  console.log('❌ Error checking database risks:', error.message);
}

// 6. File System Risks
console.log('\n💾 FILE SYSTEM RISKS:');
try {
  const uploadContent = fs.readFileSync('src/routes/uploadRoutes.js', 'utf8');
  if (uploadContent.includes('fs.unlinkSync') && !uploadContent.includes('try')) {
    console.log('⚠️  Upload routes: File operations without error handling');
    crashRisks.push('FILE_OPS_WITHOUT_TRY_CATCH');
  } else {
    console.log('✅ Upload routes: File operations have error handling');
  }
  
  if (uploadContent.includes('uploads/') && !uploadContent.includes('fs.existsSync')) {
    console.log('⚠️  Upload routes: Directory existence not checked');
    warnings.push('NO_DIR_CHECK');
  } else {
    console.log('✅ Upload routes: Directory existence checked');
  }
} catch (error) {
  console.log('❌ Error checking file system risks:', error.message);
}

// 7. Production Environment Risks
console.log('\n🚀 PRODUCTION ENVIRONMENT RISKS:');
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  Environment: Not in production mode');
  warnings.push('NOT_PRODUCTION_ENV');
} else {
  console.log('✅ Environment: Production mode');
}

if (process.env.PORT === '5000' && process.env.NODE_ENV === 'production') {
  console.log('⚠️  Port: Using default port 5000 in production');
  warnings.push('DEFAULT_PRODUCTION_PORT');
} else {
  console.log('✅ Port: Production port configured');
}

// 8. Summary
console.log('\n' + '='.repeat(60));
console.log('📋 DEPLOYMENT CRASH RISK SUMMARY:');
console.log(`🔴 Critical Crash Risks: ${crashRisks.length}`);
console.log(`🟡 Warnings: ${warnings.length}`);

if (crashRisks.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES (MUST FIX):');
  crashRisks.forEach(risk => console.log(`   🔴 ${risk}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (RECOMMENDED FIXES):');
  warnings.forEach(warning => console.log(`   🟡 ${warning}`));
}

if (crashRisks.length === 0 && warnings.length === 0) {
  console.log('🎉 NO DEPLOYMENT RISKS DETECTED');
  console.log('✅ Safe for production deployment');
} else if (crashRisks.length === 0) {
  console.log('\n✅ NO CRITICAL CRASH RISKS');
  console.log('🟡 Minor warnings - deployment should work');
} else {
  console.log('\n🚨 CRITICAL CRASH RISKS FOUND');
  console.log('❌ Fix critical issues before deployment');
}

console.log('\n📊 DEPLOYMENT SAFETY SCORE:');
const totalIssues = crashRisks.length + (warnings.length * 0.5);
const safetyScore = Math.max(0, 100 - (totalIssues * 10));
console.log(`🎯 Safety Score: ${safetyScore.toFixed(0)}%`);

if (safetyScore >= 90) {
  console.log('✅ Excellent: Ready for production');
} else if (safetyScore >= 70) {
  console.log('⚠️  Good: Minor issues, should work');
} else if (safetyScore >= 50) {
  console.log('🟡 Fair: Some risks, test thoroughly');
} else {
  console.log('🔴 Poor: High risk of crashes');
}

process.exit(crashRisks.length === 0 ? 0 : 1);
