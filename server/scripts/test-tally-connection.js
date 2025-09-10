const axios = require('axios');
const xml2js = require('xml2js');

// Test Tally connection and XML responses
async function testTallyConnection() {
    const tallyUrl = 'http://192.168.0.163:9000';
    const parser = new xml2js.Parser({ explicitArray: false });

    console.log('🔍 Testing Tally Connection...');
    console.log('Tally URL:', tallyUrl);

    // Test 1: Basic connection test
    try {
        console.log('\n📡 Test 1: Basic HTTP Connection');
        const response = await axios.get(tallyUrl, { timeout: 5000 });
        console.log('✅ Basic connection successful');
        console.log('Response status:', response.status);
    } catch (error) {
        console.log('❌ Basic connection failed:', error.message);
        return;
    }

    // Test 2: Company Info XML
    const companyInfoXML = `
    <ENVELOPE>
        <HEADER>
            <TALLYREQUEST>Export</TALLYREQUEST>
            <TYPE>Collection</TYPE>
            <ID>Company Info</ID>
        </HEADER>
        <BODY>
            <DESC>
                <STATICVARIABLES>
                    <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                </STATICVARIABLES>
                <TDL>
                    <TDLMESSAGE>
                        <COLLECTION NAME="Company Info" ISMODIFY="No">
                            <TYPE>Company</TYPE>
                            <NATIVEMETHOD>NAME</NATIVEMETHOD>
                            <NATIVEMETHOD>GUID</NATIVEMETHOD>
                            <NATIVEMETHOD>MAILINGNAME</NATIVEMETHOD>
                        </COLLECTION>
                    </TDLMESSAGE>
                </TDL>
            </DESC>
        </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n📋 Test 2: Company Info Request');
        console.log('Sending XML:', companyInfoXML);
        
        const response = await axios.post(tallyUrl, companyInfoXML, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000
        });

        console.log('✅ Company info request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 500 chars):', response.data.substring(0, 500));

        const parsed = await parser.parseStringPromise(response.data);
        console.log('📊 Parsed response:', JSON.stringify(parsed, null, 2));

    } catch (error) {
        console.log('❌ Company info request failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }

    // Test 3: Simple Ledger List XML
    const ledgerXML = `
    <ENVELOPE>
        <HEADER>
            <TALLYREQUEST>Export</TALLYREQUEST>
            <TYPE>Collection</TYPE>
            <ID>Ledger List</ID>
        </HEADER>
        <BODY>
            <DESC>
                <STATICVARIABLES>
                    <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                </STATICVARIABLES>
                <TDL>
                    <TDLMESSAGE>
                        <COLLECTION NAME="Ledger List" ISMODIFY="No">
                            <TYPE>Ledger</TYPE>
                            <NATIVEMETHOD>NAME</NATIVEMETHOD>
                            <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                        </COLLECTION>
                    </TDLMESSAGE>
                </TDL>
            </DESC>
        </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n📊 Test 3: Ledger List Request');
        console.log('Sending XML:', ledgerXML);
        
        const response = await axios.post(tallyUrl, ledgerXML, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000
        });

        console.log('✅ Ledger list request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 500 chars):', response.data.substring(0, 500));

        const parsed = await parser.parseStringPromise(response.data);
        console.log('📊 Parsed response:', JSON.stringify(parsed, null, 2));

    } catch (error) {
        console.log('❌ Ledger list request failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }

    // Test 4: Test with existing tally-data.json format
    const existingFormatXML = `
    <ENVELOPE>
        <HEADER>
            <VERSION>1</VERSION>
            <TALLYREQUEST>Export</TALLYREQUEST>
            <TYPE>Data</TYPE>
            <ID>All Masters</ID>
        </HEADER>
        <BODY>
            <DESC>
                <TDL>
                    <TDLMESSAGE>
                        <COLLECTION ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No" NAME="All Masters">
                            <TYPE>Ledger : VoucherType : StockItem : StockGroup : Unit : StockCategory : TaxUnit : CostCentre : CostCategory : Godown : Currency : Group</TYPE>
                            <CHILDOF>$$YesNo:No</CHILDOF>
                            <FETCH>*</FETCH>
                        </COLLECTION>
                    </TDLMESSAGE>
                </TDL>
            </DESC>
        </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n🔧 Test 4: Existing Format Request');
        console.log('Sending XML:', existingFormatXML);
        
        const response = await axios.post(tallyUrl, existingFormatXML, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 15000
        });

        console.log('✅ Existing format request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 1000 chars):', response.data.substring(0, 1000));

        const parsed = await parser.parseStringPromise(response.data);
        console.log('📊 Parsed response structure:', Object.keys(parsed));
        
        if (parsed.ENVELOPE && parsed.ENVELOPE.BODY) {
            console.log('Body structure:', Object.keys(parsed.ENVELOPE.BODY));
            if (parsed.ENVELOPE.BODY.DATA) {
                console.log('Data structure:', Object.keys(parsed.ENVELOPE.BODY.DATA));
                if (parsed.ENVELOPE.BODY.DATA.COLLECTION) {
                    console.log('Collection keys:', Object.keys(parsed.ENVELOPE.BODY.DATA.COLLECTION));
                }
            }
        }

    } catch (error) {
        console.log('❌ Existing format request failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data (first 500 chars):', error.response.data.substring(0, 500));
        }
    }
}

// Run the test
testTallyConnection().catch(console.error);
