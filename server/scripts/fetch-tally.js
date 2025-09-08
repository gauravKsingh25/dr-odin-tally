// // server.js
// const express = require('express');
// const axios = require('axios');
// const xml2js = require('xml2js');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;
// const TALLY_URL = process.env.TALLY_URL || 'http://192.168.0.163:9000';

// // --- XML payload: List of Ledgers (change if you want other collections) ---
// const xmlPayload = `
// <ENVELOPE>
//   <HEADER>
//     <VERSION>1</VERSION>
//     <TALLYREQUEST>Export</TALLYREQUEST>
//     <TYPE>Collection</TYPE>
//     <ID>List of Ledgers</ID>
//   </HEADER>
//   <BODY>
//     <DESC>
//       <STATICVARIABLES>
//         <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
//       </STATICVARIABLES>
//       <TDL>
//         <TDLMESSAGE>
//           <COLLECTION NAME="List of Ledgers" ISMODIFY="No">
//             <TYPE>Ledger</TYPE>
//             <NATIVEMETHOD>NAME</NATIVEMETHOD>
//             <NATIVEMETHOD>PARENT</NATIVEMETHOD>
//             <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
//             <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
//             <NATIVEMETHOD>RESERVEDNAME</NATIVEMETHOD>
//             <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
//           </COLLECTION>
//         </TDLMESSAGE>
//       </TDL>
//     </DESC>
//   </BODY>
// </ENVELOPE>
// `;

// /**
//  * Fetch from Tally, parse XML -> JS object
//  */
// async function fetchTallyData(xml) {
//   const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, explicitRoot: true });
//   const res = await axios.post(TALLY_URL, xml, {
//     headers: { 'Content-Type': 'application/xml' },
//     timeout: 30000,
//   });
//   const parsed = await parser.parseStringPromise(res.data);
//   return parsed;
// }

// /**
//  * normalizeLedgers(parsed)
//  * - accepts parsed xml2js output and returns flattened array of ledgers
//  */
// function normalizeLedgers(parsed) {
//   // Try to find the COLLECTION node safely across a few shape variations
//   // Common possible paths:
//   // parsed.ENVELOPE.BODY.DATA.COLLECTION
//   // parsed.ENVELOPE.BODY[0].DATA[0].COLLECTION
//   // parsed.ENVELOPE.BODY.DATA.COLLECTION.LEDGER (or COLLECTION.LEDGER array)
//   const envelope = parsed?.ENVELOPE ?? parsed;
//   const body = envelope?.BODY ?? envelope?.Body ?? null;

//   // Normalize possible shapes where body may be object or array
//   let dataNode = null;
//   if (!body) {
//     dataNode = null;
//   } else if (Array.isArray(body)) {
//     // look for first element that has DATA
//     dataNode = body.find((b) => b && (b.DATA || b.Data || b.data)) || body[0];
//   } else {
//     dataNode = body;
//   }

//   const data = dataNode?.DATA ?? dataNode?.Data ?? dataNode?.data ?? null;
//   let collection = null;

//   if (!data) {
//     collection = null;
//   } else if (Array.isArray(data)) {
//     // pick first
//     collection = data[0]?.COLLECTION ?? data[0]?.Collection ?? null;
//   } else {
//     collection = data.COLLECTION ?? data.Collection ?? null;
//   }

//   if (!collection) return [];

//   // Ledgers could be directly inside COLLECTION.LEDGER
//   let ledgers = collection.LEDGER ?? collection.Ledger ?? null;

//   // If COLLECTION itself is the ledger list
//   if (!ledgers && Array.isArray(collection)) {
//     // sometimes collection may be an array of ledger objects directly
//     ledgers = collection;
//   }

//   if (!ledgers) return [];

//   // Normalize to array
//   if (!Array.isArray(ledgers)) {
//     ledgers = [ledgers];
//   }

//   // Helper to parse amounts (object with '_' or string)
//   const readAmount = (obj) => {
//     if (obj == null) return 0;
//     // if object with underscore
//     const v = (typeof obj === 'object' && obj._ != null) ? obj._ : obj;
//     const s = (typeof v === 'string') ? v.trim() : v;
//     if (!s && s !== 0) return 0;
//     // remove commas
//     const cleaned = String(s).replace(/,/g, '');
//     const n = parseFloat(cleaned);
//     return Number.isFinite(n) ? n : 0;
//   };

//   const flat = ledgers.map((L) => {
//     // L may be string or object; if string, treat as name
//     const name = (typeof L === 'string') ? L : (L.NAME ?? L.name ?? '');
//     const reservedName = (L.RESERVEDNAME ?? L.RESERVEDNAME ?? '') || '';
//     // Parent may be object with '_' or raw string
//     let parent = '';
//     if (L.PARENT) parent = (typeof L.PARENT === 'object' ? (L.PARENT._ ?? L.PARENT) : L.PARENT) || '';
//     // opening / closing
//     const openingBalance = readAmount(L.OPENINGBALANCE ?? L.OpeningBalance ?? null);
//     const closingBalance = readAmount(L.CLOSINGBALANCE ?? L.ClosingBalance ?? null);

//     // languageName handling (LANGUAGENAME.LIST -> NAME.LIST.NAME)
//     let languageName = '';
//     let languageId = null;
//     const lang = L['LANGUAGENAME.LIST'] ?? L['LANGUAGENAME'] ?? null;
//     if (lang) {
//       if (typeof lang === 'object') {
//         const nameList = lang['NAME.LIST'] ?? lang['NAME'] ?? null;
//         if (nameList) {
//           languageName = (typeof nameList === 'object' ? (nameList.NAME ?? nameList) : nameList) || '';
//         }
//         const lid = lang.LANGUAGEID ?? lang.LanguageID ?? null;
//         if (lid) {
//           languageId = parseInt((lid._ ?? lid).toString().trim()) || null;
//         }
//       }
//     }

//     return {
//       name,
//       reservedName,
//       parent,
//       openingBalance,
//       closingBalance,
//       languageName,
//       languageId,
//     };
//   });

//   return flat;
// }

// /**
//  * GET /tally-data
//  * - Returns parsed raw JSON from Tally
//  */
// app.get('/tally-data', async (req, res) => {
//   try {
//     const parsed = await fetchTallyData(xmlPayload);
//     res.json(parsed);
//   } catch (err) {
//     console.error('Error fetching/parsing Tally data:', err.message);
//     res.status(500).json({ error: 'Failed to fetch data from Tally', details: err.message });
//   }
// });

// /**
//  * GET /tally-data/download
//  * - Saves the raw JSON to tally-data.json and sends as download
//  */
// app.get('/tally-data/download', async (req, res) => {
//   try {
//     const parsed = await fetchTallyData(xmlPayload);
//     const jsonStr = JSON.stringify(parsed, null, 2);
//     const filePath = path.resolve(__dirname, 'tally-data.json');
//     fs.writeFileSync(filePath, jsonStr, 'utf8');
//     res.download(filePath, 'tally-data.json');
//   } catch (err) {
//     console.error('Error fetching/parsing Tally data:', err.message);
//     res.status(500).json({ error: 'Failed to fetch data from Tally', details: err.message });
//   }
// });

// /**
//  * GET /api/ledgers
//  * - Returns flattened ledger array ready for dashboards
//  */
// app.get('/api/ledgers', async (req, res) => {
//   try {
//     const parsed = await fetchTallyData(xmlPayload);
//     const ledgers = normalizeLedgers(parsed);
//     res.json({ count: ledgers.length, ledgers });
//   } catch (err) {
//     console.error('Error in /api/ledgers:', err.message);
//     res.status(500).json({ error: 'Failed to fetch/normalize ledgers', details: err.message });
//   }
// });

// /**
//  * GET /api/ledgers/download
//  * - Saves flattened ledgers to ledgers.json and downloads
//  */
// app.get('/api/ledgers/download', async (req, res) => {
//   try {
//     const parsed = await fetchTallyData(xmlPayload);
//     const ledgers = normalizeLedgers(parsed);
//     const jsonStr = JSON.stringify({ count: ledgers.length, ledgers }, null, 2);
//     const filePath = path.resolve(__dirname, 'ledgers.json');
//     fs.writeFileSync(filePath, jsonStr, 'utf8');
//     res.download(filePath, 'ledgers.json');
//   } catch (err) {
//     console.error('Error in /api/ledgers/download:', err.message);
//     res.status(500).json({ error: 'Failed to fetch/normalize ledgers', details: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Tally proxy running. Open http://localhost:${PORT}/tally-data`);
//   console.log(`Raw download: http://localhost:${PORT}/tally-data/download`);
//   console.log(`Normalized ledgers: http://localhost:${PORT}/api/ledgers`);
//   console.log(`Ledgers download: http://localhost:${PORT}/api/ledgers/download`);
// });




// server.js
// Node 14+
// npm install express axios xml2js

const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TALLY_URL = process.env.TALLY_URL || 'http://192.168.0.163:9000';

// XML payload templates
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
</ENVELOPE>
`;

function vouchersPayload(fromYMD = null, toYMD = null) {
  // Uses Day Book / Vouchers export approach with date range if provided
  const from = fromYMD || '';
  const to = toYMD || '';
  return `
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
          ${from ? `<SVFROMDATE>${from}</SVFROMDATE>` : ''}
          ${to ? `<SVTODATE>${to}</SVTODATE>` : ''}
        </STATICVARIABLES>
        <REPORT>Day Book</REPORT>
      </DESC>
    </BODY>
  </ENVELOPE>`;
}

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
</ENVELOPE>
`;

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
</ENVELOPE>
`;

// generic fetch & parse
async function fetchAndParse(xml) {
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  const r = await axios.post(TALLY_URL, xml, { headers: { 'Content-Type': 'application/xml' }, timeout: 30000 });
  const parsed = await parser.parseStringPromise(r.data);
  return parsed;
}

/* --------------------
   Normalizers
   -------------------- */

// safe helpers to extract number/string
const safeStr = (v) => {
  if (v == null) return '';
  if (typeof v === 'object' && v._ != null) return String(v._);
  return String(v);
};
const safeNum = (v) => {
  if (v == null) return 0;
  if (typeof v === 'object' && v._ != null) v = v._;
  const s = String(v).replace(/,/g, '').trim();
  if (s === '') return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

// navigate to COLLECTION safely (handles a few possible shapes)
function findCollection(parsed) {
  const env = parsed?.ENVELOPE ?? parsed;
  const body = env?.BODY ?? env?.Body ?? env?.body;
  if (!body) return null;
  const data = body?.DATA ?? body?.Data ?? body?.data ?? null;
  if (!data) return null;
  const collection = Array.isArray(data) ? (data[0]?.COLLECTION ?? data[0]?.Collection) : (data.COLLECTION ?? data.Collection);
  return collection ?? null;
}

// Companies normalizer
function normalizeCompanies(parsed) {
  const collection = findCollection(parsed);
  if (!collection) return [];
  let comps = collection.COMPANY ?? collection.COMPANYNAME ?? collection.Company ?? null;
  if (!comps && Array.isArray(collection)) comps = collection;
  if (!comps) return [];
  if (!Array.isArray(comps)) comps = [comps];

  return comps.map((c) => {
    // c could be string or object
    if (typeof c === 'string') return { name: c };
    return {
      name: safeStr(c.COMPANYNAME ?? c.NAME ?? c._ ?? c),
      id: safeStr(c.COMPANYID ?? c.ID ?? c.COMPANYID ?? ''),
      raw: c
    };
  });
}

// Vouchers normalizer (best-effort): flattens each VOUCHER entry to common fields
function normalizeVouchers(parsed) {
  const collection = findCollection(parsed);
  // many Tally report exports put VOUCHER under DATA.COLLECTION.VOUCHER or under BODY.DATA
  let vouchers = null;
  if (collection) vouchers = collection.VOUCHER ?? collection.Voucher ?? null;

  // fallback: scan BODY.DATA for VOUCHER arrays
  if (!vouchers) {
    const env = parsed?.ENVELOPE ?? parsed;
    const body = env?.BODY ?? env?.Body ?? env?.body;
    if (body) {
      // body.DATA could be array or object
      const data = Array.isArray(body.DATA) ? body.DATA : [body.DATA].filter(Boolean);
      for (const d of data) {
        const coll = d?.COLLECTION ?? d?.Collection;
        if (coll) {
          if (coll.VOUCHER) vouchers = coll.VOUCHER;
          else {
            // maybe vouchers listed directly
            if (Array.isArray(coll)) vouchers = coll;
          }
        }
      }
    }
  }

  if (!vouchers) return [];

  if (!Array.isArray(vouchers)) vouchers = [vouchers];

  // For each voucher, try to extract common fields
  return vouchers.map((v) => {
    // typical useful fields in many exports:
    const date = safeStr(v.DATE ?? v.VOUCHERDATE ?? v.DATEOFISSUE ?? '');
    const voucherNumber = safeStr(v.VOUCHERNUMBER ?? v.VOUCHERKEY ?? v.VOUCHERID ?? '');
    const voucherType = safeStr(v.VOUCHERTYPENAME ?? v.VOUCHERTYPE ?? v.VOUCHERTYPELIST ?? '');
    const party = safeStr(v.PARTYLEDGERNAME ?? v.PARTYLEDGER ?? v.PARTY ?? v.PARTYNAME ?? '');
    // amount is sometimes nested: AMOUNT or LEDGERENTRIES.LIST.AMOUNT etc.
    let amount = 0;
    if (v.AMOUNT) amount = safeNum(v.AMOUNT);
    else if (v['AMOUNT.LIST'] && v['AMOUNT.LIST'].AMOUNT) amount = safeNum(v['AMOUNT.LIST'].AMOUNT);
    else if (v.LEDGERENTRIES?.LIST) {
      // sum all LEDGERENTRIES amounts if present
      const le = v.LEDGERENTRIES.LIST;
      const arr = Array.isArray(le) ? le : [le];
      amount = arr.reduce((acc, e) => acc + safeNum(e.AMOUNT ?? e.CLOSINGBALANCE ?? e._ ?? 0), 0);
    }

    const narration = safeStr(v.NARRATION ?? v.REMARKS ?? '');

    return {
      date,
      voucherNumber,
      voucherType,
      party,
      amount,
      narration,
      raw: v
    };
  });
}

// Stock items normalizer
function normalizeStockItems(parsed) {
  const collection = findCollection(parsed);
  if (!collection) return [];
  let items = collection.STOCKITEM ?? collection.StockItem ?? null;
  if (!items && Array.isArray(collection)) items = collection;
  if (!items) return [];
  if (!Array.isArray(items)) items = [items];

  return items.map((it) => {
    const name = safeStr(it.NAME ?? it.STOCKITEMNAME ?? it._ ?? '');
    const closingValue = safeNum(it.CLOSINGBALANCE ?? it.CLOSINGVALUE ?? null);
    const closingQty = safeNum(it.CLOSINGBALANCEQTY ?? it.CLOSINGQTY ?? it.CLOSINGBALANCEQTY ?? null);
    const baseUnits = safeStr(it.BASEUNITS ?? it.UNITS ?? '');
    return { name, closingValue, closingQty, baseUnits, raw: it };
  });
}

// Trial balance normalizer: extract groups/ledgers with closing balances
function normalizeTrialBalance(parsed) {
  // Trial Balance exports vary; look for LIST entries under DATA/REPORT or COLLECTION
  const collection = findCollection(parsed);
  // sometimes trial balance returns rows under BODY.DATA.COLLECTION.GROUP or TBROW
  let rows = null;
  if (collection) {
    rows = collection.GROUP ?? collection.GROUPS ?? collection.ROW ?? collection.TBROW ?? null;
  }

  // fallback: search parsed for CLOSINGBALANCE nodes grouped by group name
  if (!rows) {
    // deep scan for objects with GROUPNAME and CLOSINGBALANCE
    const env = parsed?.ENVELOPE ?? parsed;
    const found = [];
    function scan(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.GROUPNAME && obj.CLOSINGBALANCE) {
        found.push(obj);
        return;
      }
      for (const k of Object.keys(obj)) scan(obj[k]);
    }
    scan(env);
    rows = found;
  }

  if (!rows) return [];

  if (!Array.isArray(rows)) rows = [rows];

  return rows.map((r) => {
    const name = safeStr(r.GROUPNAME ?? r.NAME ?? r._ ?? '');
    const closing = safeNum(r.CLOSINGBALANCE ?? r.CLOSINGVALUE ?? r.CLOSING ?? 0);
    return { name, closing, raw: r };
  });
}

/* --------------------
   Routes
   -------------------- */

// raw inspector: type query: companies|vouchers|stockitems|trialbalance
app.get('/raw', async (req, res) => {
  try {
    const type = (req.query.type || 'companies').toLowerCase();
    let xml;
    if (type === 'companies') xml = companiesPayload;
    else if (type === 'vouchers') xml = vouchersPayload(req.query.from, req.query.to);
    else if (type === 'stockitems') xml = stockItemsPayload;
    else if (type === 'trialbalance') xml = trialBalancePayload;
    else return res.status(400).json({ error: 'Unknown type' });

    const parsed = await fetchAndParse(xml);
    res.json(parsed);
  } catch (err) {
    console.error('/raw error', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Companies
app.get('/api/companies', async (req, res) => {
  try {
    const parsed = await fetchAndParse(companiesPayload);
    const companies = normalizeCompanies(parsed);
    res.json({ count: companies.length, companies });
  } catch (err) {
    console.error('/api/companies error', err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/companies/download', async (req, res) => {
  try {
    const parsed = await fetchAndParse(companiesPayload);
    const companies = normalizeCompanies(parsed);
    const filePath = path.resolve(__dirname, 'companies.json');
    fs.writeFileSync(filePath, JSON.stringify({ count: companies.length, companies }, null, 2), 'utf8');
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vouchers (date-range)
app.get('/api/vouchers', async (req, res) => {
  try {
    const from = req.query.from; // YYYYMMDD
    const to = req.query.to;     // YYYYMMDD
    const xml = vouchersPayload(from, to);
    const parsed = await fetchAndParse(xml);
    const vouchers = normalizeVouchers(parsed);
    res.json({ count: vouchers.length, vouchers });
  } catch (err) {
    console.error('/api/vouchers error', err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/vouchers/download', async (req, res) => {
  try {
    const from = req.query.from;
    const to = req.query.to;
    const xml = vouchersPayload(from, to);
    const parsed = await fetchAndParse(xml);
    const vouchers = normalizeVouchers(parsed);
    const filePath = path.resolve(__dirname, `vouchers_${from || 'all'}_${to || 'all'}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ count: vouchers.length, vouchers }, null, 2), 'utf8');
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stock items
app.get('/api/stockitems', async (req, res) => {
  try {
    const parsed = await fetchAndParse(stockItemsPayload);
    const items = normalizeStockItems(parsed);
    res.json({ count: items.length, items });
  } catch (err) {
    console.error('/api/stockitems error', err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/stockitems/download', async (req, res) => {
  try {
    const parsed = await fetchAndParse(stockItemsPayload);
    const items = normalizeStockItems(parsed);
    const filePath = path.resolve(__dirname, 'stockitems.json');
    fs.writeFileSync(filePath, JSON.stringify({ count: items.length, items }, null, 2), 'utf8');
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trial balance
app.get('/api/trialbalance', async (req, res) => {
  try {
    const parsed = await fetchAndParse(trialBalancePayload);
    const tb = normalizeTrialBalance(parsed);
    res.json({ count: tb.length, trialBalance: tb });
  } catch (err) {
    console.error('/api/trialbalance error', err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/trialbalance/download', async (req, res) => {
  try {
    const parsed = await fetchAndParse(trialBalancePayload);
    const tb = normalizeTrialBalance(parsed);
    const filePath = path.resolve(__dirname, 'trialbalance.json');
    fs.writeFileSync(filePath, JSON.stringify({ count: tb.length, trialBalance: tb }, null, 2), 'utf8');
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Tally proxy running on http://localhost:${PORT}`);
  console.log(`Raw inspector: http://localhost:${PORT}/raw?type=companies`);
  console.log(`Companies: http://localhost:${PORT}/api/companies`);
  console.log(`Vouchers (example): http://localhost:${PORT}/api/vouchers?from=20240101&to=20240930`);
  console.log(`Stock items: http://localhost:${PORT}/api/stockitems`);
  console.log(`Trial Balance: http://localhost:${PORT}/api/trialbalance`);
});

