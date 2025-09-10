const axios = require('axios');
const xml2js = require('xml2js');

// Test the exact XML formats from the working fetch-tally.js script
async function testOriginalFormats() {
    const tallyUrl = 'http://192.168.0.163:9000';
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    console.log('🔍 Testing Original XML Formats from fetch-tally.js...');

    // Format 1: Companies payload (from the working script)
    const companiesPayload = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>List of Companies</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES><SVEXPORTFORMAT>XML</SVEXPORTFORMAT></STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="List of Companies" ISMODIFY="No">
            <COMPANYNAME/>
            <COMPANYID/>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`.trim();

    // Format 2: Stock Items payload
    const stockItemsPayload = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>List of StockItems</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES><SVEXPORTFORMAT>XML</SVEXPORTFORMAT></STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="List of StockItems" ISMODIFY="No">
            <TYPE>StockItem</TYPE>
            <NATIVEMETHOD>NAME</NATIVEMETHOD>
            <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
            <NATIVEMETHOD>CLOSINGBALANCEQTY</NATIVEMETHOD>
            <NATIVEMETHOD>BASEUNITS</NATIVEMETHOD>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`.trim();

    // Format 3: Ledgers payload (the first commented one that probably worked)
    const ledgersPayload = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>List of Ledgers</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="List of Ledgers" ISMODIFY="No">
            <TYPE>Ledger</TYPE>
            <NATIVEMETHOD>NAME</NATIVEMETHOD>
            <NATIVEMETHOD>PARENT</NATIVEMETHOD>
            <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
            <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
            <NATIVEMETHOD>RESERVEDNAME</NATIVEMETHOD>
            <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`.trim();

    // Format 4: Day Book / Vouchers
    const vouchersPayload = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Report</TYPE>
    <ID>Day Book</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <REPORT>Day Book</REPORT>
    </DESC>
  </BODY>
</ENVELOPE>`.trim();

    const testFormats = [
        { name: "Companies", xml: companiesPayload },
        { name: "Stock Items", xml: stockItemsPayload },
        { name: "Ledgers", xml: ledgersPayload },
        { name: "Vouchers (Day Book)", xml: vouchersPayload }
    ];

    for (const format of testFormats) {
        try {
            console.log(`\n📊 Testing: ${format.name}`);
            console.log('XML Preview:', format.xml.substring(0, 150) + '...');
            
            const response = await axios.post(tallyUrl, format.xml, {
                headers: { 'Content-Type': 'application/xml' },
                timeout: 30000
            });

            console.log(`✅ ${format.name} - Response length:`, response.data.length);
            
            if (response.data.includes('LINEERROR')) {
                console.log(`❌ ${format.name} - Error in response`);
                console.log('Error:', response.data.substring(0, 500));
            } else if (response.data.includes('Unknown Request')) {
                console.log(`❌ ${format.name} - Unknown request`);
                console.log('Response:', response.data);
            } else if (response.data.length > 1000) {
                console.log(`🎉 ${format.name} - SUCCESS! Large response received`);
                
                // Parse and analyze structure
                try {
                    const parsed = await parser.parseStringPromise(response.data);
                    console.log(`📊 ${format.name} - Parsed structure:`);
                    
                    if (parsed.ENVELOPE && parsed.ENVELOPE.BODY) {
                        console.log('  BODY keys:', Object.keys(parsed.ENVELOPE.BODY));
                        
                        if (parsed.ENVELOPE.BODY.DATA) {
                            console.log('  DATA keys:', Object.keys(parsed.ENVELOPE.BODY.DATA));
                            
                            if (parsed.ENVELOPE.BODY.DATA.COLLECTION) {
                                const collection = parsed.ENVELOPE.BODY.DATA.COLLECTION;
                                console.log('  COLLECTION keys:', Object.keys(collection));
                                
                                // Count items based on format
                                if (format.name === "Companies" && collection.COMPANY) {
                                    const companies = Array.isArray(collection.COMPANY) ? collection.COMPANY : [collection.COMPANY];
                                    console.log(`  📊 Found ${companies.length} companies!`);
                                    if (companies.length > 0) {
                                        console.log('  First company:', JSON.stringify(companies[0], null, 2));
                                    }
                                }
                                
                                if (format.name === "Stock Items" && collection.STOCKITEM) {
                                    const stockItems = Array.isArray(collection.STOCKITEM) ? collection.STOCKITEM : [collection.STOCKITEM];
                                    console.log(`  📦 Found ${stockItems.length} stock items!`);
                                    if (stockItems.length > 0) {
                                        console.log('  First stock item:', JSON.stringify(stockItems[0], null, 2));
                                    }
                                }
                                
                                if (format.name === "Ledgers" && collection.LEDGER) {
                                    const ledgers = Array.isArray(collection.LEDGER) ? collection.LEDGER : [collection.LEDGER];
                                    console.log(`  📋 Found ${ledgers.length} ledgers!`);
                                    if (ledgers.length > 0) {
                                        console.log('  First ledger:', JSON.stringify(ledgers[0], null, 2));
                                    }
                                }
                                
                                if (format.name === "Vouchers (Day Book)" && collection.VOUCHER) {
                                    const vouchers = Array.isArray(collection.VOUCHER) ? collection.VOUCHER : [collection.VOUCHER];
                                    console.log(`  📄 Found ${vouchers.length} vouchers!`);
                                    if (vouchers.length > 0) {
                                        console.log('  First voucher:', JSON.stringify(vouchers[0], null, 2));
                                    }
                                }
                            }
                        }
                    }
                    
                } catch (parseError) {
                    console.log(`⚠️ ${format.name} - Parse error:`, parseError.message);
                    console.log('Response preview:', response.data.substring(0, 500));
                }
            } else {
                console.log(`⚠️ ${format.name} - Short response:`, response.data);
            }

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log(`⏰ ${format.name} - Timeout (30s) - might be processing large data`);
            } else {
                console.log(`❌ ${format.name} - Request failed:`, error.message);
            }
        }
    }

    console.log('\n🔍 Summary: Testing formats that successfully generated tally-data.json with 61k lines');
}

// Run the test
testOriginalFormats().catch(console.error);
