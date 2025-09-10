const axios = require('axios');
const xml2js = require('xml2js');

// Test more variations of the working format to get all data types
async function testWorkingVariations() {
    const tallyUrl = 'http://192.168.0.163:9000';
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

    console.log('🔍 Testing variations of the working Ledgers format...');

    // The working ledgers format - let's try variations for other data types
    const workingTemplate = (collectionName, typeName, nativeMethods = []) => `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>${collectionName}</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="${collectionName}" ISMODIFY="No">
            <TYPE>${typeName}</TYPE>
            ${nativeMethods.map(method => `<NATIVEMETHOD>${method}</NATIVEMETHOD>`).join('\n            ')}
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`.trim();

    const testFormats = [
        {
            name: "Companies (Working Format)",
            xml: workingTemplate("List of Companies", "Company", ["NAME", "PARENTNAME", "COMPANYID", "REMOTENAME"])
        },
        {
            name: "Stock Items (Working Format)", 
            xml: workingTemplate("List of StockItems", "StockItem", ["NAME", "PARENT", "CLOSINGBALANCE", "CLOSINGBALANCEQTY", "BASEUNITS"])
        },
        {
            name: "Groups (Working Format)",
            xml: workingTemplate("List of Groups", "Group", ["NAME", "PARENT", "RESERVEDNAME"])
        },
        {
            name: "Voucher Types (Working Format)",
            xml: workingTemplate("List of VoucherTypes", "VoucherType", ["NAME", "PARENT", "NUMBERING"])
        }
    ];

    for (const format of testFormats) {
        try {
            console.log(`\n📊 Testing: ${format.name}`);
            
            const response = await axios.post(tallyUrl, format.xml, {
                headers: { 'Content-Type': 'application/xml' },
                timeout: 30000
            });

            console.log(`✅ ${format.name} - Response length:`, response.data.length);
            
            if (response.data.includes('Unknown Request')) {
                console.log(`❌ ${format.name} - Unknown request`);
            } else if (response.data.length > 1000) {
                console.log(`🎉 ${format.name} - SUCCESS!`);
                
                try {
                    const parsed = await parser.parseStringPromise(response.data);
                    
                    if (parsed.ENVELOPE && parsed.ENVELOPE.BODY && parsed.ENVELOPE.BODY.DATA && parsed.ENVELOPE.BODY.DATA.COLLECTION) {
                        const collection = parsed.ENVELOPE.BODY.DATA.COLLECTION;
                        
                        // Check what data we got
                        if (collection.COMPANY) {
                            const companies = Array.isArray(collection.COMPANY) ? collection.COMPANY : [collection.COMPANY];
                            console.log(`  🏢 Found ${companies.length} companies!`);
                            if (companies.length > 0) {
                                console.log('  Sample company:', companies[0].NAME || companies[0]);
                            }
                        }
                        
                        if (collection.STOCKITEM) {
                            const stockItems = Array.isArray(collection.STOCKITEM) ? collection.STOCKITEM : [collection.STOCKITEM];
                            console.log(`  📦 Found ${stockItems.length} stock items!`);
                            if (stockItems.length > 0) {
                                console.log('  Sample stock item:', stockItems[0].NAME || stockItems[0]);
                            }
                        }
                        
                        if (collection.GROUP) {
                            const groups = Array.isArray(collection.GROUP) ? collection.GROUP : [collection.GROUP];
                            console.log(`  👥 Found ${groups.length} groups!`);
                            if (groups.length > 0) {
                                console.log('  Sample group:', groups[0].NAME || groups[0]);
                            }
                        }
                        
                        if (collection.VOUCHERTYPE) {
                            const voucherTypes = Array.isArray(collection.VOUCHERTYPE) ? collection.VOUCHERTYPE : [collection.VOUCHERTYPE];
                            console.log(`  📄 Found ${voucherTypes.length} voucher types!`);
                            if (voucherTypes.length > 0) {
                                console.log('  Sample voucher type:', voucherTypes[0].NAME || voucherTypes[0]);
                            }
                        }
                    }
                    
                } catch (parseError) {
                    console.log(`⚠️ ${format.name} - Parse error:`, parseError.message);
                }
            } else {
                console.log(`⚠️ ${format.name} - Short response:`, response.data);
            }

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log(`⏰ ${format.name} - Timeout`);
            } else {
                console.log(`❌ ${format.name} - Request failed:`, error.message);
            }
        }
    }

    // Test vouchers with the Day Book report format but with proper version
    console.log('\n📊 Testing: Vouchers with proper version');
    const vouchersXml = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
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

    try {
        const response = await axios.post(tallyUrl, vouchersXml, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 30000
        });

        console.log('✅ Vouchers - Response length:', response.data.length);
        
        if (response.data.includes('Unknown Request')) {
            console.log('❌ Vouchers - Unknown request');
        } else if (response.data.length > 1000) {
            console.log('🎉 Vouchers - SUCCESS!');
            
            try {
                const parsed = await parser.parseStringPromise(response.data);
                // Look for vouchers in various possible locations
                if (parsed.ENVELOPE && parsed.ENVELOPE.BODY) {
                    console.log('  BODY keys:', Object.keys(parsed.ENVELOPE.BODY));
                }
            } catch (parseError) {
                console.log('⚠️ Vouchers - Parse error:', parseError.message);
            }
        } else {
            console.log('⚠️ Vouchers - Short response:', response.data);
        }

    } catch (error) {
        console.log('❌ Vouchers - Request failed:', error.message);
    }
}

// Run the test
testWorkingVariations().catch(console.error);
