// fetch-tally-companies.js
// Script to fetch companies from Tally and identify active company

const axios = require("axios");
const xml2js = require("xml2js");

// Tally URL
const TALLY_URL = "http://192.168.0.156:9000";

// XML Request to fetch list of companies
const COMPANIES_LIST_XML = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>List of Companies</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>
`;

// XML Request to get current company info
const CURRENT_COMPANY_XML = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>CompanyInfo</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="Company Info">
            <TYPE>Company</TYPE>
            <FETCH>Name, StartDate, EndDate, Books, Address, Email, Phone</FETCH>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>
`;

async function fetchCompaniesWithStatus() {
  try {
    console.log("🔍 Fetching companies from Tally...\n");
    
    // First, get list of all companies
    const companiesRes = await axios.post(TALLY_URL, COMPANIES_LIST_XML, {
      headers: { "Content-Type": "text/xml" },
    });

    const parser = new xml2js.Parser({ explicitArray: false });
    const companiesResult = await parser.parseStringPromise(companiesRes.data);

    const companies = companiesResult?.ENVELOPE?.BODY?.DATA?.TALLYMESSAGE?.COMPANY || [];
    
    let companyList = [];
    if (Array.isArray(companies)) {
      companyList = companies.map((c) => ({
        name: c?.NAME || 'Unknown',
        guid: c?.GUID || '',
        remote: c?.REMOTE || 'No',
        version: c?.VERSION || ''
      }));
    } else if (companies?.NAME) {
      companyList = [{
        name: companies.NAME,
        guid: companies.GUID || '',
        remote: companies.REMOTE || 'No',
        version: companies.VERSION || ''
      }];
    }

    // Now get current company info
    let currentCompany = null;
    try {
      const currentRes = await axios.post(TALLY_URL, CURRENT_COMPANY_XML, {
        headers: { "Content-Type": "text/xml" },
      });
      
      const currentResult = await parser.parseStringPromise(currentRes.data);
      const companyInfo = currentResult?.ENVELOPE?.BODY?.DATA?.TALLYMESSAGE?.COMPANY;
      
      if (companyInfo) {
        currentCompany = {
          name: companyInfo.NAME || 'Unknown',
          startDate: companyInfo.STARTDATE || 'N/A',
          endDate: companyInfo.ENDDATE || 'N/A',
          books: companyInfo.BOOKS || 'N/A',
          address: companyInfo.ADDRESS || 'N/A',
          email: companyInfo.EMAIL || 'N/A',
          phone: companyInfo.PHONE || 'N/A'
        };
      }
    } catch (err) {
      console.log("⚠️  Could not fetch current company details");
    }

    // Display results
    console.log("📊 TALLY COMPANIES SUMMARY");
    console.log("=" .repeat(50));
    console.log(`Total Companies Found: ${companyList.length}`);
    console.log();

    console.log("📋 ALL COMPANIES:");
    console.log("-".repeat(30));
    companyList.forEach((company, index) => {
      const status = currentCompany && company.name === currentCompany.name ? "🟢 ACTIVE" : "⚪ Available";
      console.log(`${index + 1}. ${company.name} - ${status}`);
      if (company.guid) console.log(`   GUID: ${company.guid}`);
      if (company.remote === 'Yes') console.log(`   📡 Remote Company`);
      console.log();
    });

    if (currentCompany) {
      console.log("🎯 CURRENTLY ACTIVE COMPANY:");
      console.log("-".repeat(35));
      console.log(`Name: ${currentCompany.name}`);
      console.log(`Financial Year: ${currentCompany.startDate} to ${currentCompany.endDate}`);
      console.log(`Books From: ${currentCompany.books}`);
      if (currentCompany.address !== 'N/A') console.log(`Address: ${currentCompany.address}`);
      if (currentCompany.email !== 'N/A') console.log(`Email: ${currentCompany.email}`);
      if (currentCompany.phone !== 'N/A') console.log(`Phone: ${currentCompany.phone}`);
    } else {
      console.log("❌ Could not determine currently active company");
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Sync will use the active company: ${currentCompany?.name || 'Unknown'}`);

  } catch (err) {
    console.error("❌ Error fetching companies:", err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error("💡 Make sure Tally is running and accessible at:", TALLY_URL);
    }
  }
}

fetchCompaniesWithStatus();
