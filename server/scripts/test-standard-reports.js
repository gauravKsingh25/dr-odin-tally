const axios = require('axios');
const xml2js = require('xml2js');

// Test with standard Tally report names
async function testStandardReports() {
    const tallyUrl = 'http://192.168.0.163:9000';
    const parser = new xml2js.Parser({ explicitArray: false });

    console.log('🔍 Testing Standard Tally Reports...');

    // List of standard Tally reports to try
    const reports = [
        'Trial Balance',
        'Profit and Loss',
        'Balance Sheet', 
        'Day Book',
        'Ledger',
        'Stock Summary',
        'Group Summary',
        'Account Books',
        'List of Accounts',
        'All Items',
        'All Masters',
        'Voucher Register'
    ];

    for (const reportName of reports) {
        const xmlPayload = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Data</TYPE>
                <ID>${reportName}</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <TDL>
                        <TDLMESSAGE>
                            <REPORT NAME="${reportName}"/>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
                <DATA>
                    <EXPORTDATA>
                        <REQUESTDESC>
                            <REPORTNAME>${reportName}</REPORTNAME>
                        </REQUESTDESC>
                    </EXPORTDATA>
                </DATA>
            </BODY>
        </ENVELOPE>`.trim();

        try {
            console.log(`\n📊 Testing: ${reportName}`);
            const response = await axios.post(tallyUrl, xmlPayload, {
                headers: { 'Content-Type': 'application/xml' },
                timeout: 8000
            });

            console.log(`✅ ${reportName} - Response length:`, response.data.length);
            
            if (response.data.includes('LINEERROR')) {
                console.log(`❌ ${reportName} - Error in response`);
                console.log('Response:', response.data.substring(0, 200));
            } else if (response.data.includes('Unknown Request')) {
                console.log(`❌ ${reportName} - Unknown request`);
            } else {
                console.log(`✅ ${reportName} - Success! Response:`, response.data.substring(0, 300));
                
                // Try to parse and see structure
                try {
                    const parsed = await parser.parseStringPromise(response.data);
                    if (parsed.ENVELOPE && parsed.ENVELOPE.BODY && parsed.ENVELOPE.BODY.DATA) {
                        console.log(`📊 ${reportName} - Data structure:`, Object.keys(parsed.ENVELOPE.BODY.DATA));
                    }
                } catch (parseError) {
                    console.log(`⚠️ ${reportName} - Parse error, but got data`);
                }
            }

        } catch (error) {
            console.log(`❌ ${reportName} - Request failed:`, error.message);
        }
    }

    // Also try the collection-based approach for masters
    console.log('\n🔧 Testing Collection-based Master Data Requests...');

    const masterTypes = [
        'Company',
        'Ledger', 
        'Group',
        'StockItem',
        'StockGroup',
        'Unit',
        'VoucherType',
        'Currency'
    ];

    for (const masterType of masterTypes) {
        const xmlPayload = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Data</TYPE>
                <ID>Collection of ${masterType}</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No" NAME="${masterType}Collection">
                                <TYPE>${masterType}</TYPE>
                                <CHILDOF>$$YesNo:No</CHILDOF>
                                <FETCH>*</FETCH>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
                <DATA>
                    <EXPORTDATA>
                        <REQUESTDESC>
                            <REPORTNAME>Collection of ${masterType}</REPORTNAME>
                        </REQUESTDESC>
                    </EXPORTDATA>
                </DATA>
            </BODY>
        </ENVELOPE>`.trim();

        try {
            console.log(`\n📋 Testing Collection: ${masterType}`);
            const response = await axios.post(tallyUrl, xmlPayload, {
                headers: { 'Content-Type': 'application/xml' },
                timeout: 10000
            });

            if (response.data.includes('LINEERROR')) {
                console.log(`❌ ${masterType} Collection - Error`);
            } else if (response.data.includes('Unknown Request')) {
                console.log(`❌ ${masterType} Collection - Unknown request`);
            } else if (response.data.length > 300) {
                console.log(`✅ ${masterType} Collection - Success! Response length:`, response.data.length);
                console.log('First 300 chars:', response.data.substring(0, 300));
                
                // Try to count items if possible
                const itemCount = (response.data.match(new RegExp(`<${masterType.toUpperCase()}>`, 'g')) || []).length;
                if (itemCount > 0) {
                    console.log(`📊 Found approximately ${itemCount} ${masterType} items`);
                }
            } else {
                console.log(`⚠️ ${masterType} Collection - Short response:`, response.data);
            }

        } catch (error) {
            console.log(`❌ ${masterType} Collection failed:`, error.message);
        }
    }
}

// Run the test
testStandardReports().catch(console.error);
