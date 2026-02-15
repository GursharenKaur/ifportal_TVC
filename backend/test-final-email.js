const { sendEmail, generateOTP } = require('./src/utils/finalEmailService');

async function testFinalEmail() {
    console.log('=== TESTING FINAL EMAIL SERVICE ===');
    
    try {
        const result = await sendEmail(
            'rvsaxena1821@gmail.com',
            '🎯 FINAL TEST - Working Email Service',
            'This is the final test email service with Brevo.',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #FF6B6B; border-radius: 10px;">
                <div style="background: #FF6B6B; color: white; padding: 20px; text-align: center;">
                    <h2>🎯 FINAL EMAIL SERVICE TEST</h2>
                    <p style="margin: 10px 0; font-size: 16px;">This should work with Brevo!</p>
                    <p style="margin: 10px 0; font-size: 14px;">Check your Gmail inbox now.</p>
                </div>
                <div style="padding: 20px; text-align: center; color: #666;">
                    <p>From: Final Email Service</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                </div>
            </div>
            `
        );
        
        console.log('📧 Final Test Result:', result);
        
        if (result.success) {
            console.log('✅ SUCCESS! Email service is working with:', result.service);
            console.log('📬 Check your Gmail inbox for the test email.');
            console.log('🔐 OTP shown in console:', result.otp);
        } else {
            console.log('❌ FAILED:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testFinalEmail();
