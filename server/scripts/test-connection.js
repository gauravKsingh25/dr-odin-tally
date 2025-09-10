const axios = require('axios');

async function testTallyConnection() {
    const tallyUrl = 'http://192.168.0.183:9000';
    
    console.log('🔍 Testing Tally server connection...');
    
    // Test 1: Simple connectivity
    try {
        console.log('\n1. Testing basic connectivity...');
        const response = await axios.get(tallyUrl, { timeout: 5000 });
        console.log('✅ Basic connection successful');
        console.log('Response status:', response.status);
    } catch (error) {
        console.log('❌ Basic connection failed:', error.message);
    }
    
    // Test 2: Simple XML request
    try {
        console.log('\n2. Testing simple XML request...');
        const simpleXml = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Test</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Test Company" ISMODIFY="No">
                                <TYPE>Company</TYPE>
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
        
        const response = await axios.post(tallyUrl, simpleXml, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000,
        });
        
        console.log('✅ Simple XML request successful');
        console.log('Response length:', response.data.length);
        console.log('First 200 chars:', response.data.substring(0, 200));
    } catch (error) {
        console.log('❌ Simple XML request failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data.substring(0, 500));
        }
    }
    
    // Test 3: Check if Tally is in correct mode
    try {
        console.log('\n3. Testing Tally server status...');
        const statusXml = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Data</TYPE>
                <ID>SystemInfo</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                </DESC>
            </BODY>
        </ENVELOPE>`;
        
        const response = await axios.post(tallyUrl, statusXml, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000,
        });
        
        console.log('✅ Tally status request successful');
        console.log('Response:', response.data.substring(0, 500));
    } catch (error) {
        console.log('❌ Tally status request failed:', error.message);
    }
}

// Run the test
testTallyConnection().catch(console.error);
