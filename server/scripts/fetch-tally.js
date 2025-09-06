const axios = require('axios');
const xml2js = require('xml2js');

// XML payload to fetch list of companies from Tally
const xmlPayload = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Collection</TYPE>
    <ID>List of Companies</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <COLLECTION NAME="List of Companies" ISMODIFY="No">
            <COMPANYNAME/>
          </COLLECTION>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>
`;

async function fetchTally(xmlPayload) {
  try {
    const response = await axios.post('http://192.168.0.163:9000', xmlPayload, {
      headers: { 'Content-Type': 'application/xml' }
    });
    const result = await xml2js.parseStringPromise(response.data);
    console.log('Fetched Tally Data:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error fetching Tally data:', error.message);
  }
}

fetchTally(xmlPayload);
