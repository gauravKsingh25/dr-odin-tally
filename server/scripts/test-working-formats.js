const axios = require('axios');
const xml2js = require('xml2js');

// Test with the working XML formats from fetch-tally.js
async function testWorkingFormats() {
    const tallyUrl = 'http://192.168.0.163:9000';
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    console.log('🔍 Testing with Working XML Formats...');

    // Test 1: Companies payload (from working script)
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

    try {
        console.log('\n📋 Test 1: Companies List');
        const response = await axios.post(tallyUrl, companiesPayload, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000
        });

        console.log('✅ Companies request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 1000 chars):', response.data.substring(0, 1000));

        const parsed = await parser.parseStringPromise(response.data);
        console.log('📊 Parsed structure:', Object.keys(parsed));
        
        if (parsed.ENVELOPE && parsed.ENVELOPE.BODY && parsed.ENVELOPE.BODY.DATA) {
            console.log('Data keys:', Object.keys(parsed.ENVELOPE.BODY.DATA));
            if (parsed.ENVELOPE.BODY.DATA.COLLECTION) {
                console.log('Collection keys:', Object.keys(parsed.ENVELOPE.BODY.DATA.COLLECTION));
            }
        }

    } catch (error) {
        console.log('❌ Companies request failed:', error.message);
    }

    // Test 2: Stock Items payload
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

    try {
        console.log('\n📦 Test 2: Stock Items');
        const response = await axios.post(tallyUrl, stockItemsPayload, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000
        });

        console.log('✅ Stock items request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 500 chars):', response.data.substring(0, 500));

        const parsed = await parser.parseStringPromise(response.data);
        console.log('📊 Stock items count from parsed data:');
        
        // Try to find stock items
        if (parsed.ENVELOPE && parsed.ENVELOPE.BODY && parsed.ENVELOPE.BODY.DATA) {
            const collection = parsed.ENVELOPE.BODY.DATA.COLLECTION;
            if (collection && collection.STOCKITEM) {
                const stockItems = Array.isArray(collection.STOCKITEM) ? collection.STOCKITEM : [collection.STOCKITEM];
                console.log('Found', stockItems.length, 'stock items');
                if (stockItems.length > 0) {
                    console.log('First stock item:', stockItems[0]);
                }
            } else {
                console.log('No STOCKITEM found in collection');
            }
        }

    } catch (error) {
        console.log('❌ Stock items request failed:', error.message);
    }

    // Test 3: Ledgers payload (working format from script)
    const ledgersPayload = `
    <ENVELOPE>
      <HEADER>
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

    try {
        console.log('\n📊 Test 3: Ledgers List');
        const response = await axios.post(tallyUrl, ledgersPayload, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 15000
        });

        console.log('✅ Ledgers request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 500 chars):', response.data.substring(0, 500));

        const parsed = await parser.parseStringPromise(response.data);
        
        // Try to find ledgers
        if (parsed.ENVELOPE && parsed.ENVELOPE.BODY && parsed.ENVELOPE.BODY.DATA) {
            const collection = parsed.ENVELOPE.BODY.DATA.COLLECTION;
            if (collection && collection.LEDGER) {
                const ledgers = Array.isArray(collection.LEDGER) ? collection.LEDGER : [collection.LEDGER];
                console.log('📊 Found', ledgers.length, 'ledgers');
                if (ledgers.length > 0) {
                    console.log('First ledger:', JSON.stringify(ledgers[0], null, 2));
                }
            } else {
                console.log('No LEDGER found in collection');
                console.log('Collection structure:', Object.keys(collection || {}));
            }
        }

    } catch (error) {
        console.log('❌ Ledgers request failed:', error.message);
    }

    // Test 4: Trial Balance (simpler approach)
    const trialBalancePayload = `
    <ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Report</TYPE>
        <ID>Trial Balance</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES><SVEXPORTFORMAT>XML</SVEXPORTFORMAT></STATICVARIABLES>
          <REPORT>Trial Balance</REPORT>
        </DESC>
      </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log('\n🧾 Test 4: Trial Balance');
        const response = await axios.post(tallyUrl, trialBalancePayload, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 10000
        });

        console.log('✅ Trial balance request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 500 chars):', response.data.substring(0, 500));

    } catch (error) {
        console.log('❌ Trial balance request failed:', error.message);
    }

    // Test 5: Vouchers with date range
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const fromDate = lastMonth.toISOString().slice(0, 10).replace(/-/g, '');
    const toDate = today.toISOString().slice(0, 10).replace(/-/g, '');
    
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
            <SVFROMDATE>${fromDate}</SVFROMDATE>
            <SVTODATE>${toDate}</SVTODATE>
          </STATICVARIABLES>
          <REPORT>Day Book</REPORT>
        </DESC>
      </BODY>
    </ENVELOPE>`.trim();

    try {
        console.log(`\n🧾 Test 5: Vouchers (${fromDate} to ${toDate})`);
        const response = await axios.post(tallyUrl, vouchersPayload, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 15000
        });

        console.log('✅ Vouchers request successful');
        console.log('Response length:', response.data.length);
        console.log('Raw response (first 500 chars):', response.data.substring(0, 500));

        const parsed = await parser.parseStringPromise(response.data);
        
        // Try to find vouchers
        if (parsed.ENVELOPE && parsed.ENVELOPE.BODY && parsed.ENVELOPE.BODY.DATA) {
            const collection = parsed.ENVELOPE.BODY.DATA.COLLECTION;
            if (collection && collection.VOUCHER) {
                const vouchers = Array.isArray(collection.VOUCHER) ? collection.VOUCHER : [collection.VOUCHER];
                console.log('📊 Found', vouchers.length, 'vouchers');
                if (vouchers.length > 0) {
                    console.log('First voucher keys:', Object.keys(vouchers[0]));
                }
            } else {
                console.log('No VOUCHER found in collection');
                console.log('Collection structure:', Object.keys(collection || {}));
            }
        }

    } catch (error) {
        console.log('❌ Vouchers request failed:', error.message);
    }
}

// Run the test
testWorkingFormats().catch(console.error);
