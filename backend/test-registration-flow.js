const { sendEmail, generateOTP } = require('./src/utils/finalEmailService');

async function testRegistrationFlow() {
    console.log('=== TESTING ACTUAL REGISTRATION FLOW ===');
    
    // Simulate the exact registration process
    const userData = {
        name: 'Test User',
        email: 'rvsaxena1821@gmail.com',
        password: 'testpassword123',
        role: 'student'
    };
    
    console.log('📝 Simulating registration for:', userData.email);
    
    // Generate OTP like in registration
    const otp = generateOTP();
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: white; margin: 0; font-size: 24px;">Email Verification</h2>
                <p style="color: rgba(255,255,255,0.9); margin: 20px 0; font-size: 16px;">
                    Your One-Time Password (OTP) for account verification is:
                </p>
                <div style="background: white; color: #333; font-size: 32px; font-weight: bold; 
                            padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: rgba(255,255,255,0.8); margin: 20px 0 0 0; font-size: 14px;">
                    This OTP expires in 10 minutes. Please do not share this code with anyone.
                </p>
            </div>
        </div>
    `;
    
    console.log('📧 Sending registration email...');
    
    // Send email exactly like in registration
    const result = await sendEmail(
        userData.email,
        'Verify Your Account - OTP Code',
        `Your OTP is ${otp}. It expires in 10 minutes.`,
        emailHtml
    );
    
    console.log('📊 Registration Email Result:', result);
    
    if (result.success) {
        console.log('✅ Registration email sent successfully!');
        console.log('📬 Service used:', result.service);
        console.log('🔐 OTP sent:', result.otp);
        console.log('📧 Message ID:', result.messageId);
        console.log('📬 Check your inbox for email from Brevo');
    } else {
        console.log('❌ Registration email failed:', result.error);
    }
}

testRegistrationFlow();
