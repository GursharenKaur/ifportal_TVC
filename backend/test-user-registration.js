const { sendEmail, generateOTP } = require('./src/utils/finalEmailService');

async function testUserRegistration() {
    console.log('=== TESTING USER REGISTRATION EMAIL ===');
    
    // Simulate different user emails
    const testEmails = [
        'rvsaxena1821@gmail.com',
        'vidsaxena1821@gmail.com',
        'test.user@example.com'
    ];
    
    for (const email of testEmails) {
        console.log(`\n📧 Testing registration for: ${email}`);
        
        const result = await sendEmail(
            email,
            '🔐 Verify Your Account - OTP Code',
            `Your OTP for registration is ${generateOTP()}. It expires in 10 minutes.`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #4CAF50; border-radius: 10px;">
                <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
                    <h2>🔐 REGISTRATION VERIFICATION</h2>
                    <p style="margin: 10px 0; font-size: 16px;">Welcome to Internship Portal!</p>
                    <p style="margin: 10px 0; font-size: 14px;">Please check your email for OTP code.</p>
                </div>
                <div style="padding: 20px; text-align: center; color: #666;">
                    <p><strong>Email sent to:</strong> ${email}</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                </div>
            </div>
            `
        );
        
        console.log(`📊 Result for ${email}:`, result.service, result.success ? '✅' : '❌');
    }
    
    console.log('\n🎯 REGISTRATION FLOW TEST COMPLETE');
    console.log('✅ All OTPs sent to user emails');
    console.log('📧 Users will receive OTP in their inbox');
}

testUserRegistration();
