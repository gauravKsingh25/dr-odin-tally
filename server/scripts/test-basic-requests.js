const axios = require('axios');

// Test the most basic requests to understand what Tally expects
async function testBasicRequests() {
    const tallyUrl = 'http://192.168.0.163:9000';
    
    console.log('🔍 Testing Basic Tally Requests...');

    // Test 1: GET request to see what Tally returns
    try {
        console.log('\n📡 Test 1: Simple GET Request');
        const response = await axios.get(tallyUrl, { timeout: 5000 });
        console.log('✅ GET request successful');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response data:', response.data);
    } catch (error) {
        console.log('❌ GET request failed:', error.message);
    }

    // Test 2: Minimal XML request
    const minimalXML = `<ENVELOPE><HEADER><VERSION>1</VERSION></HEADER></ENVELOPE>`;
    
    try {
        console.log('\n📡 Test 2: Minimal XML');
        const response = await axios.post(tallyUrl, minimalXML, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 5000
        });
        console.log('✅ Minimal XML successful');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ Minimal XML failed:', error.message);
    }

    // Test 3: Company list with simpler format
    const simpleCompanyXML = `
    <ENVELOPE>
        <HEADER>
            <VERSION>1</VERSION>
            <TALLYREQUEST>Export</TALLYREQUEST>
            <TYPE>Data</TYPE>
            <ID>CompanyInfo</ID>
        </HEADER>
        <BODY>
            <DESC>
                <TDL>
                    <TDLMESSAGE>
                        <COMPANY>*</COMPANY>
                    </TDLMESSAGE>
                </TDL>
            </DESC>
        </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n📡 Test 3: Simple Company XML');
        const response = await axios.post(tallyUrl, simpleCompanyXML, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 5000
        });
        console.log('✅ Simple company XML successful');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ Simple company XML failed:', error.message);
    }

    // Test 4: Try the format from tally-data.json structure
    const tallyDataFormat = `
    <ENVELOPE>
        <HEADER>
            <VERSION>1</VERSION>
            <STATUS>1</STATUS>
            <TALLYREQUEST>Export</TALLYREQUEST>
        </HEADER>
        <BODY>
            <EXPORTDATA>
                <REQUESTDESC>
                    <REPORTNAME>List of Accounts</REPORTNAME>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                </REQUESTDESC>
            </EXPORTDATA>
        </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n📡 Test 4: Tally Data Format');
        const response = await axios.post(tallyUrl, tallyDataFormat, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 5000
        });
        console.log('✅ Tally data format successful');
        console.log('Response:', response.data.substring(0, 1000));
    } catch (error) {
        console.log('❌ Tally data format failed:', error.message);
    }

    // Test 5: Test with exact format that might have worked before
    const workingFormat = `
    <ENVELOPE>
        <HEADER>
            <VERSION>1</VERSION>
            <TALLYREQUEST>Export</TALLYREQUEST>
            <TYPE>Data</TYPE>
            <ID>LedgerMaster</ID>
        </HEADER>
        <BODY>
            <DESC>
                <TDL>
                    <TDLMESSAGE>
                        <COLLECTION ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No" NAME="LedgerCollection">
                            <TYPE>Ledger</TYPE>
                            <CHILDOF>$$YesNo:No</CHILDOF>
                            <FETCH>Name, Parent, ClosingBalance</FETCH>
                        </COLLECTION>
                    </TDLMESSAGE>
                </TDL>
            </DESC>
            <DATA>
                <EXPORTDATA>
                    <REQUESTDESC>
                        <REPORTNAME>LedgerMaster</REPORTNAME>
                    </REQUESTDESC>
                </EXPORTDATA>
            </DATA>
        </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n📡 Test 5: Working Format');
        const response = await axios.post(tallyUrl, workingFormat, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000
        });
        console.log('✅ Working format successful');
        console.log('Response length:', response.data.length);
        console.log('Response:', response.data.substring(0, 1000));
    } catch (error) {
        console.log('❌ Working format failed:', error.message);
    }

    // Test 6: Check if Tally expects specific content-type or other headers
    const headers = [
        { 'Content-Type': 'text/xml' },
        { 'Content-Type': 'application/xml; charset=utf-8' },
        { 'Content-Type': 'text/xml; charset=utf-8' },
    ];

    for (let i = 0; i < headers.length; i++) {
        try {
            console.log(`\n📡 Test 6.${i + 1}: Different Content-Type:`, headers[i]['Content-Type']);
            const response = await axios.post(tallyUrl, minimalXML, {
                headers: headers[i],
                timeout: 5000
            });
            console.log('✅ Success with', headers[i]['Content-Type']);
            console.log('Response:', response.data);
        } catch (error) {
            console.log('❌ Failed with', headers[i]['Content-Type'], ':', error.message);
        }
    }
}

// Run the test
testBasicRequests().catch(console.error);
