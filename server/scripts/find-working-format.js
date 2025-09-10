const axios = require('axios');
const xml2js = require('xml2js');

// Test to find the working XML format that generates the tally-data.json structure
async function findWorkingFormat() {
    const tallyUrl = 'http://192.168.0.163:9000';
    const parser = new xml2js.Parser({ explicitArray: false });

    console.log('🔍 Finding Working XML Format for tally-data.json structure...');

    // The tally-data.json has this structure:
    // ENVELOPE > BODY > DESC > CMPINFO (with counts)
    // ENVELOPE > BODY > DATA > COLLECTION > LEDGER (array of ledgers)
    
    // This looks like a "Company Info" or "All Masters" request that worked
    
    // Try various formats that might generate this structure
    const testFormats = [
        {
            name: "All Masters Export",
            xml: `
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
                                    <TYPE>Ledger : Group : StockItem : StockGroup : Unit : Currency : VoucherType</TYPE>
                                    <CHILDOF>$$YesNo:No</CHILDOF>
                                </COLLECTION>
                            </TDLMESSAGE>
                        </TDL>
                    </DESC>
                </BODY>
            </ENVELOPE>`.trim()
        },
        {
            name: "Company Info with Collections",
            xml: `
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
                                <COLLECTION ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No" NAME="CompanyInfo">
                                    <TYPE>Company</TYPE>
                                    <CHILDOF>$$YesNo:No</CHILDOF>
                                </COLLECTION>
                            </TDLMESSAGE>
                        </TDL>
                    </DESC>
                </BODY>
            </ENVELOPE>`.trim()
        },
        {
            name: "Simple All Data Request",
            xml: `
            <ENVELOPE>
                <HEADER>
                    <VERSION>1</VERSION>
                    <TALLYREQUEST>Export</TALLYREQUEST>
                </HEADER>
                <BODY>
                    <DESC>
                        <TDL>
                            <TDLMESSAGE>
                                <COLLECTION ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No" NAME="AllData">
                                    <TYPE>Ledger</TYPE>
                                </COLLECTION>
                            </TDLMESSAGE>
                        </TDL>
                    </DESC>
                </BODY>
            </ENVELOPE>`.trim()
        }
    ];

    for (const format of testFormats) {
        try {
            console.log(`\n📊 Testing: ${format.name}`);
            console.log('Sending XML:', format.xml.substring(0, 200) + '...');
            
            const response = await axios.post(tallyUrl, format.xml, {
                headers: { 'Content-Type': 'application/xml' },
                timeout: 70000  // Longer timeout since these might take time
            });

            console.log(`✅ ${format.name} - Response length:`, response.data.length);
            
            if (response.data.includes('LINEERROR')) {
                console.log(`❌ ${format.name} - Error in response`);
                console.log('Error:', response.data);
            } else if (response.data.includes('Unknown Request')) {
                console.log(`❌ ${format.name} - Unknown request`);
            } else if (response.data.length > 1000) {
                console.log(`✅ ${format.name} - Success! Large response received`);
                
                // Check if response has the expected structure
                try {
                    const parsed = await parser.parseStringPromise(response.data);
                    
                    if (parsed.ENVELOPE && parsed.ENVELOPE.BODY) {
                        console.log(`📊 ${format.name} - Body structure:`, Object.keys(parsed.ENVELOPE.BODY));
                        
                        if (parsed.ENVELOPE.BODY.DATA && parsed.ENVELOPE.BODY.DATA.COLLECTION) {
                            const collection = parsed.ENVELOPE.BODY.DATA.COLLECTION;
                            console.log(`📋 ${format.name} - Collection keys:`, Object.keys(collection));
                            
                            // Check for ledgers
                            if (collection.LEDGER) {
                                const ledgers = Array.isArray(collection.LEDGER) ? collection.LEDGER : [collection.LEDGER];
                                console.log(`📊 ${format.name} - Found ${ledgers.length} ledgers!`);
                                if (ledgers.length > 0) {
                                    console.log('First ledger keys:', Object.keys(ledgers[0]));
                                }
                            }
                            
                            // Check for stock items
                            if (collection.STOCKITEM) {
                                const stockItems = Array.isArray(collection.STOCKITEM) ? collection.STOCKITEM : [collection.STOCKITEM];
                                console.log(`📦 ${format.name} - Found ${stockItems.length} stock items!`);
                            }
                        }
                        
                        // Check for CMPINFO structure
                        if (parsed.ENVELOPE.BODY.DESC && parsed.ENVELOPE.BODY.DESC.CMPINFO) {
                            console.log(`🏢 ${format.name} - Found CMPINFO structure!`);
                            console.log('CMPINFO:', parsed.ENVELOPE.BODY.DESC.CMPINFO);
                        }
                    }
                    
                } catch (parseError) {
                    console.log(`⚠️ ${format.name} - Parse error:`, parseError.message);
                    console.log('First 500 chars of response:', response.data.substring(0, 500));
                }
            } else {
                console.log(`⚠️ ${format.name} - Short response:`, response.data);
            }

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log(`⏰ ${format.name} - Timeout (this might mean it's working but slow)`);
            } else {
                console.log(`❌ ${format.name} - Request failed:`, error.message);
            }
        }
    }

    // Final test with the simplest possible request that might work with reduced timeout
    console.log('\n🔧 Testing Minimal Working Request...');
    
    const minimalWorking = `
    <ENVELOPE>
        <HEADER>
            <VERSION>1</VERSION>
            <TALLYREQUEST>Export</TALLYREQUEST>
        </HEADER>
        <BODY>
            <DESC>
                <TDL>
                    <TDLMESSAGE>
                        <COLLECTION NAME="LedgerList">
                            <TYPE>Ledger</TYPE>
                        </COLLECTION>
                    </TDLMESSAGE>
                </TDL>
            </DESC>
        </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n📊 Testing: Minimal Working Request');
        const response = await axios.post(tallyUrl, minimalWorking, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 15000
        });

        console.log('✅ Minimal request - Response length:', response.data.length);
        console.log('Response preview:', response.data.substring(0, 500));

    } catch (error) {
        console.log('❌ Minimal request failed:', error.message);
    }
}

// Run the test
findWorkingFormat().catch(console.error);
