const http = require('http');

async function testRegistrationEndpoint() {
    console.log('=== TESTING REGISTRATION ENDPOINT ===');
    
    const registrationData = {
        name: 'Test User',
        email: 'rvsaxena1821@gmail.com',
        password: 'testpassword123',
        role: 'student',
        rollNo: '700',
        year: '3',
        branch: 'CSE',
        phone: '5611561234'
    };
    
    try {
        console.log('📤 Sending registration request to backend...');
        
        const postData = JSON.stringify(registrationData);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📥 Registration Response Status:', res.statusCode);
                console.log('📊 Registration Response Body:', data);
                
                const result = JSON.parse(data);
                
                if (res.statusCode === 201) {
                    console.log('✅ Registration successful!');
                    console.log('📧 Email should be sent to:', registrationData.email);
                } else {
                    console.log('❌ Registration failed:', result.message);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request failed:', error);
        });
        
        req.write(postData);
        req.end();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testRegistrationEndpoint();
