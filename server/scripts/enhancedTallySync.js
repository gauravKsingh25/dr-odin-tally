/**
 * Enhanced Tally Sync Script for Comprehensive Ledger Data
 * Captures detailed ledger information including bank details, related invoices, 
 * and ensures proper opening/closing balance extraction
 */

const TallyService = require('../services/tallyService');
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyCompany = require('../models/tallyCompany.model');
const mongoose = require('mongoose');
require('dotenv').config();

class EnhancedTallySync {
    constructor() {
        this.tallyService = new TallyService();
        this.TALLY_URL = 'http://192.168.0.191:9000';
        console.log(`🔗 Using Tally URL: ${this.TALLY_URL}`);
    }

    // Enhanced XML payload for comprehensive ledger data including all financial details
    getEnhancedLedgerPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Enhanced Ledgers</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Enhanced Ledgers" ISMODIFY="No">
                                <TYPE>Ledger</TYPE>
                                <!-- Basic Information -->
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>RESERVEDNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                
                                <!-- Financial Information - Multiple variations to ensure capture -->
                                <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>PREVOPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>PREVCLOSINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENING_BALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSING_BALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>OBVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>CBVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>BALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CURRENTBALANCE</NATIVEMETHOD>
                                
                                <!-- Bank Account Information -->
                                <NATIVEMETHOD>BANKNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKACCHOLDERNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKACCNO</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKIFSCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKSWIFTCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKBRANCHNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKACCOUNTTYPE</NATIVEMETHOD>
                                
                                <!-- Contact Information -->
                                <NATIVEMETHOD>LEDGERCONTACT</NATIVEMETHOD>
                                <NATIVEMETHOD>EMAIL</NATIVEMETHOD>
                                <NATIVEMETHOD>EMAILCC</NATIVEMETHOD>
                                <NATIVEMETHOD>PHONENO</NATIVEMETHOD>
                                <NATIVEMETHOD>MOBILENO</NATIVEMETHOD>
                                <NATIVEMETHOD>FAXNO</NATIVEMETHOD>
                                <NATIVEMETHOD>WEBSITE</NATIVEMETHOD>
                                
                                <!-- Address Information -->
                                <NATIVEMETHOD>ADDRESS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PINCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>COUNTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>STATE</NATIVEMETHOD>
                                <NATIVEMETHOD>CITY</NATIVEMETHOD>
                                
                                <!-- GST and Tax Information -->
                                <NATIVEMETHOD>GSTREGISTRATIONTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTYGSTIN</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTIN</NATIVEMETHOD>
                                <NATIVEMETHOD>PLACEOFSUPPLY</NATIVEMETHOD>
                                <NATIVEMETHOD>INCOMETAXNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>VATTINNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>SALESTAXNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>TAXREGISTRATION.LIST</NATIVEMETHOD>
                                
                                <!-- Credit and Billing Information -->
                                <NATIVEMETHOD>CREDITLIMIT</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
                                <NATIVEMETHOD>CREDITDAYS</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBILLWISEON</NATIVEMETHOD>
                                <NATIVEMETHOD>INTERESTRATE</NATIVEMETHOD>
                                <NATIVEMETHOD>INTERESTCOLLECTION.LIST</NATIVEMETHOD>
                                
                                <!-- Bill Wise Details -->
                                <NATIVEMETHOD>BILLALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLWISEDETAILS.LIST</NATIVEMETHOD>
                                
                                <!-- Additional Details -->
                                <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>MAILINGNAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PAYMENTDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>DESCRIPTION</NATIVEMETHOD>
                                <NATIVEMETHOD>NARRATION</NATIVEMETHOD>
                                
                                <!-- Flags -->
                                <NATIVEMETHOD>ISGROUP</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCOSTCENTRESON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISINTERESTON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISTDSAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISTCSAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISVATAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSALESTAXAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSERVICETAXAPPLICABLE</NATIVEMETHOD>
                                
                                <!-- Cost Center Information -->
                                <NATIVEMETHOD>COSTCENTREALLOCATIONS.LIST</NATIVEMETHOD>
                                
                                <!-- Foreign Exchange Details -->
                                <NATIVEMETHOD>FOREXDETAILS.LIST</NATIVEMETHOD>
                                
                                <!-- Last Modified Information -->
                                <NATIVEMETHOD>LASTMODIFIED</NATIVEMETHOD>
                                <NATIVEMETHOD>CREATED</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    // Enhanced XML payload for voucher data with ledger relationship
    getEnhancedVoucherPayload(fromDate = null, toDate = null) {
        const formatYmd = (d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}${mm}${dd}`;
        };

        let from = fromDate;
        let to = toDate;
        if (!from || !to) {
            // Default to last 30 days
            const defaultTo = new Date();
            const defaultFrom = new Date();
            defaultFrom.setDate(defaultFrom.getDate() - 30);
            from = formatYmd(defaultFrom);
            to = formatYmd(defaultTo);
        }

        const dateFilter = `
                                <FILTER>
                                    <DATERANGE>
                                        <FROM>${from}</FROM>
                                        <TO>${to}</TO>
                                    </DATERANGE>
                                </FILTER>`;

        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Enhanced Vouchers</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Enhanced Vouchers" ISMODIFY="No">
                                <TYPE>Voucher</TYPE>
                                ${dateFilter}
                                <!-- Basic Voucher Information -->
                                <NATIVEMETHOD>DATE</NATIVEMETHOD>
                                <NATIVEMETHOD>VOUCHERNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>VOUCHERTYPENAME</NATIVEMETHOD>
                                <NATIVEMETHOD>REFERENCE</NATIVEMETHOD>
                                <NATIVEMETHOD>REFERENCEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>NARRATION</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                
                                <!-- Party Information -->
                                <NATIVEMETHOD>PARTYNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTYLEDGERNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTYGSTIN</NATIVEMETHOD>
                                
                                <!-- Amount Information -->
                                <NATIVEMETHOD>AMOUNT</NATIVEMETHOD>
                                <NATIVEMETHOD>TOTALAMOUNT</NATIVEMETHOD>
                                <NATIVEMETHOD>BASICAMOUNT</NATIVEMETHOD>
                                <NATIVEMETHOD>TAXAMOUNT</NATIVEMETHOD>
                                
                                <!-- Ledger Entries -->
                                <NATIVEMETHOD>ALLINVENTORYENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLLEDGERENTRIES.LIST</NATIVEMETHOD>
                                
                                <!-- Additional Information -->
                                <NATIVEMETHOD>INVOICENUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>INVOICEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISINVOICE</NATIVEMETHOD>
                                <NATIVEMETHOD>PERSISTEDVIEW</NATIVEMETHOD>
                                
                                <!-- GST Information -->
                                <NATIVEMETHOD>ISGSTOVERRIDDEN</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTREGISTRATIONTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>PLACEOFSUPPLY</NATIVEMETHOD>
                                
                                <!-- Status Information -->
                                <NATIVEMETHOD>ISCANCELLED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISOPTIONAL</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFOREXCISE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPOSTDATED</NATIVEMETHOD>
                                
                                <!-- Modification Information -->
                                <NATIVEMETHOD>LASTMODIFIED</NATIVEMETHOD>
                                <NATIVEMETHOD>CREATED</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    // Enhanced normalization method for comprehensive ledger data
    normalizeEnhancedLedgers(parsed) {
        console.log('🔍 Looking for ledger collection in parsed data...');
        
        // Debug: Log the structure to understand the XML format
        if (parsed) {
            console.log('📋 Parsed data keys:', Object.keys(parsed));
            if (parsed.ENVELOPE) {
                console.log('📋 ENVELOPE keys:', Object.keys(parsed.ENVELOPE));
                if (parsed.ENVELOPE.BODY) {
                    console.log('📋 BODY keys:', Object.keys(parsed.ENVELOPE.BODY));
                }
            }
        }
        
        const collection = this.findCollection(parsed);
        if (!collection) {
            console.log('❌ No collection found in parsed data');
            return [];
        }

        // Use the same logic as the original TallyService
        let ledgers = collection.LEDGER ?? collection.Ledger ?? null;
        if (!ledgers && Array.isArray(collection)) {
            ledgers = collection;
        }
        
        if (!ledgers) {
            console.log('❌ No ledgers found in collection. Available keys:', Object.keys(collection));
            // Let's debug what's in the collection
            console.log('📋 Collection structure sample:', JSON.stringify(collection, null, 2).substring(0, 500) + '...');
            return [];
        }
        
        if (!Array.isArray(ledgers)) ledgers = [ledgers];

        console.log(`🔍 Processing ${ledgers.length} ledgers with enhanced normalization...`);

        return ledgers.map((ledger, index) => {
            try {
                // Basic Information
                const name = this.safeString(ledger.NAME ?? ledger.name ?? '');
                const aliasName = this.safeString(ledger.ALIASNAME ?? ledger.aliasname ?? '');
                const reservedName = this.safeString(ledger.RESERVEDNAME ?? ledger.reservedname ?? '');
                const parent = this.safeString(ledger.PARENT ?? ledger.parent ?? '');
                const guid = this.safeString(ledger.GUID ?? ledger.guid ?? '');
                const masterId = this.safeString(ledger.MASTERID ?? ledger.masterid ?? '');
                const alterId = this.safeString(ledger.ALTERID ?? ledger.alterid ?? '');
                
                // Enhanced Balance Processing - Try multiple field variations
                let openingBalance = 0;
                let closingBalance = 0;
                
                // Opening Balance extraction with multiple fallbacks
                const openingFields = [
                    'OPENINGBALANCE', 'OPENING_BALANCE', 'PREVOPENINGBALANCE', 
                    'OBVALUE', 'openingBalance', 'opening_balance'
                ];
                
                for (const field of openingFields) {
                    if (ledger[field] !== undefined && ledger[field] !== null && ledger[field] !== '') {
                        const value = this.safeNumber(ledger[field]);
                        if (!isNaN(value) && value !== 0) {
                            openingBalance = value;
                            console.log(`✅ Opening balance extracted from ${field}: ${openingBalance} for "${name}"`);
                            break;
                        }
                    }
                }
                
                // Closing Balance extraction with multiple fallbacks
                const closingFields = [
                    'CLOSINGBALANCE', 'CLOSING_BALANCE', 'PREVCLOSINGBALANCE', 
                    'CBVALUE', 'BALANCE', 'CURRENTBALANCE', 'closingBalance', 'closing_balance'
                ];
                
                for (const field of closingFields) {
                    if (ledger[field] !== undefined && ledger[field] !== null && ledger[field] !== '') {
                        const value = this.safeNumber(ledger[field]);
                        if (!isNaN(value) && value !== 0) {
                            closingBalance = value;
                            console.log(`✅ Closing balance extracted from ${field}: ${closingBalance} for "${name}"`);
                            break;
                        }
                    }
                }

                // Bank Details Extraction
                const bankDetails = {
                    bankName: this.safeString(ledger.BANKNAME ?? ledger.bankname ?? ''),
                    accountHolderName: this.safeString(ledger.BANKACCHOLDERNAME ?? ledger.bankaccholdername ?? ''),
                    accountNumber: this.safeString(ledger.BANKACCNO ?? ledger.bankaccno ?? ''),
                    ifscCode: this.safeString(ledger.BANKIFSCODE ?? ledger.bankifscode ?? ''),
                    swiftCode: this.safeString(ledger.BANKSWIFTCODE ?? ledger.bankswiftcode ?? ''),
                    branchName: this.safeString(ledger.BANKBRANCHNAME ?? ledger.bankbranchname ?? ''),
                    accountType: this.safeString(ledger.BANKACCOUNTTYPE ?? ledger.bankaccounttype ?? '')
                };

                // Contact Information Extraction
                const contactInfo = {
                    contactPerson: this.safeString(ledger.LEDGERCONTACT ?? ledger.ledgercontact ?? ''),
                    email: this.safeString(ledger.EMAIL ?? ledger.email ?? ''),
                    emailCC: this.safeString(ledger.EMAILCC ?? ledger.emailcc ?? ''),
                    phone: this.safeString(ledger.PHONENO ?? ledger.phoneno ?? ''),
                    mobile: this.safeString(ledger.MOBILENO ?? ledger.mobileno ?? ''),
                    fax: this.safeString(ledger.FAXNO ?? ledger.faxno ?? ''),
                    website: this.safeString(ledger.WEBSITE ?? ledger.website ?? '')
                };

                // Address Information
                let addressList = [];
                const addressData = ledger['ADDRESS.LIST'] ?? ledger.address_list ?? ledger.addressList;
                if (addressData) {
                    const addresses = Array.isArray(addressData) ? addressData : [addressData];
                    addressList = addresses.map(addr => this.safeString(addr)).filter(addr => addr.length > 0);
                }

                // Add individual address fields
                const city = this.safeString(ledger.CITY ?? ledger.city ?? '');
                const state = this.safeString(ledger.STATE ?? ledger.state ?? '');
                const country = this.safeString(ledger.COUNTRY ?? ledger.country ?? '');
                const pincode = this.safeString(ledger.PINCODE ?? ledger.pincode ?? '');
                
                if (city || state || country || pincode) {
                    const fullAddress = [city, state, country, pincode].filter(x => x).join(', ');
                    if (fullAddress && !addressList.includes(fullAddress)) {
                        addressList.push(fullAddress);
                    }
                }

                // GST and Tax Information
                const gstDetails = {
                    registrationType: this.safeString(ledger.GSTREGISTRATIONTYPE ?? ledger.gstregistrationtype ?? ''),
                    gstin: this.safeString(ledger.PARTYGSTIN ?? ledger.GSTIN ?? ledger.gstin ?? ledger.partygstin ?? ''),
                    placeOfSupply: this.safeString(ledger.PLACEOFSUPPLY ?? ledger.placeofsupply ?? ''),
                };

                const taxInfo = {
                    incomeTaxNumber: this.safeString(ledger.INCOMETAXNUMBER ?? ledger.incometaxnumber ?? ''),
                    vatTinNumber: this.safeString(ledger.VATTINNUMBER ?? ledger.vattinnumber ?? ''),
                    salesTaxNumber: this.safeString(ledger.SALESTAXNUMBER ?? ledger.salestaxnumber ?? '')
                };

                // Credit and Financial Information
                const creditInfo = {
                    creditLimit: this.safeNumber(ledger.CREDITLIMIT ?? ledger.creditlimit ?? 0),
                    creditPeriod: this.safeNumber(ledger.BILLCREDITPERIOD ?? ledger.CREDITDAYS ?? ledger.creditdays ?? 0),
                    interestRate: this.safeNumber(ledger.INTERESTRATE ?? ledger.interestrate ?? 0),
                    isBillWiseOn: this.safeBoolean(ledger.ISBILLWISEON ?? ledger.isbillwiseon ?? false)
                };

                // Bill Wise Details
                let billWiseDetails = [];
                const billData = ledger['BILLALLOCATIONS.LIST'] ?? ledger['BILLWISEDETAILS.LIST'] ?? ledger.billallocations ?? ledger.billwisedetails;
                if (billData) {
                    const bills = Array.isArray(billData) ? billData : [billData];
                    billWiseDetails = bills.map(bill => ({
                        billName: this.safeString(bill.BILLNAME ?? bill.billname ?? ''),
                        billDate: this.safeString(bill.BILLDATE ?? bill.billdate ?? ''),
                        billAmount: this.safeNumber(bill.BILLAMOUNT ?? bill.billamount ?? 0),
                        billCredit: this.safeBoolean(bill.BILLCREDIT ?? bill.billcredit ?? false),
                        billType: this.safeString(bill.BILLTYPE ?? bill.billtype ?? '')
                    })).filter(bill => bill.billName || bill.billAmount);
                }

                // Flags
                const flags = {
                    isGroup: this.safeBoolean(ledger.ISGROUP ?? ledger.isgroup ?? false),
                    isCostCentresOn: this.safeBoolean(ledger.ISCOSTCENTRESON ?? ledger.iscostcentreson ?? false),
                    isInterestOn: this.safeBoolean(ledger.ISINTERESTON ?? ledger.isintereston ?? false),
                    isGSTApplicable: this.safeBoolean(ledger.ISGSTAPPLICABLE ?? ledger.isgstapplicable ?? false),
                    isTDSApplicable: this.safeBoolean(ledger.ISTDSAPPLICABLE ?? ledger.istdsapplicable ?? false),
                    isTCSApplicable: this.safeBoolean(ledger.ISTCSAPPLICABLE ?? ledger.istcsapplicable ?? false),
                    isVATApplicable: this.safeBoolean(ledger.ISVATAPPLICABLE ?? ledger.isvatapplicable ?? false),
                    isSalesTaxApplicable: this.safeBoolean(ledger.ISSALESTAXAPPLICABLE ?? ledger.issalestaxapplicable ?? false),
                    isServiceTaxApplicable: this.safeBoolean(ledger.ISSERVICETAXAPPLICABLE ?? ledger.isservicetaxapplicable ?? false)
                };

                // Store raw data for debugging
                const rawData = { ...ledger };

                const normalizedLedger = {
                    // Basic Information
                    name,
                    aliasName,
                    reservedName,
                    parent,
                    guid,
                    masterId,
                    alterId,
                    description: this.safeString(ledger.DESCRIPTION ?? ledger.description ?? ''),
                    
                    // Financial Information
                    openingBalance,
                    closingBalance,
                    
                    // Bank Details
                    bankDetails,
                    
                    // Contact Information
                    contact: contactInfo,
                    
                    // Address Information
                    addressList: addressList,
                    city,
                    state,
                    country,
                    pincode,
                    
                    // GST and Tax Information
                    gstDetails,
                    taxInfo,
                    
                    // Credit Information
                    creditLimit: creditInfo.creditLimit,
                    creditPeriod: creditInfo.creditPeriod,
                    interestRate: creditInfo.interestRate,
                    isBillWiseOn: creditInfo.isBillWiseOn,
                    
                    // Bill Wise Details
                    billWiseDetails,
                    
                    // Flags
                    ...flags,
                    
                    // Additional fields for flat storage compatibility
                    contactPerson: contactInfo.contactPerson,
                    email: contactInfo.email,
                    ledgerPhone: contactInfo.phone,
                    ledgerFax: contactInfo.fax,
                    website: contactInfo.website,
                    gstregistrationtype: gstDetails.registrationType,
                    gstin: gstDetails.gstin,
                    incometaxnumber: taxInfo.incomeTaxNumber,
                    salestaxnumber: taxInfo.salesTaxNumber,
                    
                    // Timestamps
                    lastModified: this.safeString(ledger.LASTMODIFIED ?? ledger.lastmodified ?? ''),
                    created: this.safeString(ledger.CREATED ?? ledger.created ?? ''),
                    lastUpdated: new Date(),
                    
                    // Raw data for debugging
                    rawData: rawData
                };

                // Log successful processing for ledgers with balances
                if (normalizedLedger.openingBalance !== 0 || normalizedLedger.closingBalance !== 0) {
                    console.log(`✅ Processed ledger "${name}" - Opening: ${normalizedLedger.openingBalance}, Closing: ${normalizedLedger.closingBalance}`);
                }

                return normalizedLedger;

            } catch (error) {
                console.error(`❌ Error processing ledger at index ${index}:`, error.message);
                console.error('Ledger data:', JSON.stringify(ledger, null, 2).substring(0, 500) + '...');
                return null;
            }
        }).filter(ledger => ledger !== null);
    }

    // Enhanced voucher normalization to link with ledgers
    normalizeEnhancedVouchers(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) return [];

        let vouchers = collection.VOUCHER ?? collection.Voucher ?? null;
        if (!vouchers && Array.isArray(collection)) {
            vouchers = collection;
        }
        if (!vouchers) return [];
        if (!Array.isArray(vouchers)) vouchers = [vouchers];

        console.log(`🔍 Processing ${vouchers.length} vouchers with enhanced normalization...`);

        return vouchers.map((voucher, index) => {
            try {
                const normalizedVoucher = {
                    // Basic Information
                    date: this.safeString(voucher.DATE ?? voucher.date ?? ''),
                    voucherNumber: this.safeString(voucher.VOUCHERNUMBER ?? voucher.vouchernumber ?? ''),
                    voucherType: this.safeString(voucher.VOUCHERTYPENAME ?? voucher.vouchertypename ?? ''),
                    reference: this.safeString(voucher.REFERENCE ?? voucher.reference ?? ''),
                    referenceDate: this.safeString(voucher.REFERENCEDATE ?? voucher.referencedate ?? ''),
                    narration: this.safeString(voucher.NARRATION ?? voucher.narration ?? ''),
                    guid: this.safeString(voucher.GUID ?? voucher.guid ?? ''),
                    masterId: this.safeString(voucher.MASTERID ?? voucher.masterid ?? ''),
                    alterId: this.safeString(voucher.ALTERID ?? voucher.alterid ?? ''),
                    
                    // Party Information
                    party: this.safeString(voucher.PARTYNAME ?? voucher.PARTYLEDGERNAME ?? voucher.party ?? voucher.partyname ?? ''),
                    partyLedgerName: this.safeString(voucher.PARTYLEDGERNAME ?? voucher.partyledgername ?? ''),
                    partyGSTIN: this.safeString(voucher.PARTYGSTIN ?? voucher.partygstin ?? ''),
                    
                    // Amount Information
                    amount: this.safeNumber(voucher.AMOUNT ?? voucher.TOTALAMOUNT ?? voucher.amount ?? 0),
                    totalAmount: this.safeNumber(voucher.TOTALAMOUNT ?? voucher.totalamount ?? 0),
                    basicAmount: this.safeNumber(voucher.BASICAMOUNT ?? voucher.basicamount ?? 0),
                    taxAmount: this.safeNumber(voucher.TAXAMOUNT ?? voucher.taxamount ?? 0),
                    
                    // Invoice Information
                    invoiceNumber: this.safeString(voucher.INVOICENUMBER ?? voucher.invoicenumber ?? ''),
                    invoiceDate: this.safeString(voucher.INVOICEDATE ?? voucher.invoicedate ?? ''),
                    isInvoice: this.safeBoolean(voucher.ISINVOICE ?? voucher.isinvoice ?? false),
                    
                    // GST Information
                    isGSTOverridden: this.safeBoolean(voucher.ISGSTOVERRIDDEN ?? voucher.isgstoverridden ?? false),
                    gstRegistrationType: this.safeString(voucher.GSTREGISTRATIONTYPE ?? voucher.gstregistrationtype ?? ''),
                    placeOfSupply: this.safeString(voucher.PLACEOFSUPPLY ?? voucher.placeofsupply ?? ''),
                    
                    // Status Information
                    isCancelled: this.safeBoolean(voucher.ISCANCELLED ?? voucher.iscancelled ?? false),
                    isOptional: this.safeBoolean(voucher.ISOPTIONAL ?? voucher.isoptional ?? false),
                    isPostDated: this.safeBoolean(voucher.ISPOSTDATED ?? voucher.ispostdated ?? false),
                    
                    // Timestamps
                    lastModified: this.safeString(voucher.LASTMODIFIED ?? voucher.lastmodified ?? ''),
                    created: this.safeString(voucher.CREATED ?? voucher.created ?? ''),
                    lastUpdated: new Date(),
                    
                    // Raw data for debugging
                    rawData: { ...voucher }
                };

                return normalizedVoucher;

            } catch (error) {
                console.error(`❌ Error processing voucher at index ${index}:`, error.message);
                return null;
            }
        }).filter(voucher => voucher !== null);
    }

    // Helper methods - Use the same logic as the original TallyService
    findCollection(parsed) {
        console.log('🔍 Finding collection using standard Tally service logic...');
        
        const envelope = parsed?.ENVELOPE ?? parsed;
        const body = envelope?.BODY ?? envelope?.Body ?? envelope?.body;
        if (!body) {
            console.log('❌ No BODY found in parsed data');
            return null;
        }
        console.log('📋 Found BODY');
        
        const data = body?.DATA ?? body?.Data ?? body?.data ?? null;
        if (!data) {
            console.log('❌ No DATA found in BODY');
            return null;
        }
        console.log('📋 Found DATA');
        
        const collection = Array.isArray(data) 
            ? (data[0]?.COLLECTION ?? data[0]?.Collection) 
            : (data.COLLECTION ?? data.Collection);
        
        if (!collection) {
            console.log('❌ No COLLECTION found in DATA');
            console.log('📋 Available DATA keys:', Object.keys(data));
            return null;
        }
        
        console.log('📋 Found COLLECTION');
        return collection;
    }

    safeString(value) {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    }

    safeNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
        return isNaN(num) ? 0 : num;
    }

    safeBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return ['yes', 'true', '1', 'on'].includes(value.toLowerCase());
        }
        return Boolean(value);
    }

    // Enhanced sync method - LEDGERS ONLY (Vouchers are manual)
    async syncEnhancedLedgerData() {
        console.log('\n🚀 Starting Enhanced Tally Ledger Sync (LEDGERS ONLY)...');
        console.log(`🔗 Tally URL: ${this.TALLY_URL}`);
        console.log('📝 NOTE: Voucher sync is disabled - vouchers must be fetched manually');
        
        const results = {
            ledgers: 0,
            vouchers: 0, // Will remain 0 as vouchers are skipped
            relationships: 0,
            errors: [],
            warnings: []
        };

        try {
            // Step 1: Fetch and process enhanced ledger data ONLY
            console.log('\n📊 Step 1: Fetching enhanced ledger data from Tally...');
            const ledgerPayload = this.getEnhancedLedgerPayload();
            const ledgerResponse = await this.tallyService.sendRequest(ledgerPayload);
            console.log('✅ Raw ledger data received');

            const normalizedLedgers = this.normalizeEnhancedLedgers(ledgerResponse);
            console.log(`📊 Normalized ${normalizedLedgers.length} ledgers`);

            if (normalizedLedgers.length === 0) {
                results.warnings.push('No ledgers found in Tally data');
                console.log('⚠️ No ledgers found');
            } else {
                // Save ledgers to database
                console.log('\n💾 Saving ledgers to database...');
                let savedLedgers = 0;
                
                for (const ledger of normalizedLedgers) {
                    try {
                        // Use GUID as primary identifier, fallback to name
                        const query = ledger.guid && ledger.guid.trim() !== '' 
                            ? { guid: ledger.guid }
                            : { name: ledger.name };
                        
                        await TallyLedger.findOneAndUpdate(
                            query,
                            {
                                $set: {
                                    ...ledger,
                                    year: new Date().getFullYear(),
                                    lastUpdated: new Date()
                                }
                            },
                            { upsert: true, new: true }
                        );
                        
                        savedLedgers++;
                        
                        // Log progress for every 100 ledgers
                        if (savedLedgers % 100 === 0) {
                            console.log(`💾 Saved ${savedLedgers}/${normalizedLedgers.length} ledgers...`);
                        }
                        
                    } catch (error) {
                        results.errors.push(`Error saving ledger "${ledger.name}": ${error.message}`);
                        console.error(`❌ Error saving ledger "${ledger.name}":`, error.message);
                    }
                }
                
                results.ledgers = savedLedgers;
                console.log(`✅ Successfully saved ${savedLedgers} ledgers`);

                // Log balance statistics
                const balanceStats = await this.generateBalanceStatistics();
                console.log('\n📊 Balance Statistics:');
                console.log(balanceStats);
            }

            // Step 2: SKIP VOUCHER SYNC (Manual Only)
            console.log('\n📄 Step 2: SKIPPING voucher sync (manual only)...');
            console.log('⚠️ Vouchers are not synced automatically - use manual voucher fetch if needed');
            results.warnings.push('Voucher sync skipped - manual fetch required for vouchers');

            // Step 3: Build relationships with EXISTING vouchers only
            console.log('\n🔗 Step 3: Building relationships with existing vouchers...');
            const relationships = await this.buildLedgerVoucherRelationships();
            results.relationships = relationships;
            console.log(`✅ Built ${relationships} ledger-voucher relationships from existing data`);

        } catch (error) {
            const errorMsg = `Enhanced sync error: ${error.message}`;
            results.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`, error);
        }

        // Final summary
        console.log('\n📋 Enhanced Sync Summary (LEDGERS ONLY):');
        console.log(`✅ Ledgers processed: ${results.ledgers}`);
        console.log(`⏭️ Vouchers skipped: Manual fetch required`);
        console.log(`✅ Relationships built: ${results.relationships}`);
        console.log(`⚠️ Warnings: ${results.warnings.length}`);
        console.log(`❌ Errors: ${results.errors.length}`);
        
        if (results.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            results.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(error => console.log(`   - ${error}`));
        }

        console.log('\n💡 To sync vouchers manually, use the separate voucher fetch endpoints in the dashboard.');

        return results;
    }

    // Build relationships between ledgers and their related vouchers
    async buildLedgerVoucherRelationships() {
        console.log('🔗 Building ledger-voucher relationships...');
        
        let relationshipCount = 0;
        
        try {
            // Get all ledgers
            const ledgers = await TallyLedger.find({});
            console.log(`📊 Found ${ledgers.length} ledgers to process`);
            
            for (const ledger of ledgers) {
                try {
                    // Escape special regex characters in ledger names to prevent regex errors
                    const escapeName = (name) => {
                        if (!name) return '';
                        return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    };
                    
                    const escapedName = escapeName(ledger.name);
                    const escapedAliasName = escapeName(ledger.aliasName);
                    
                    // Find vouchers related to this ledger by party name matching
                    const queryConditions = [
                        { party: { $regex: new RegExp(escapedName, 'i') } },
                        { partyLedgerName: { $regex: new RegExp(escapedName, 'i') } }
                    ];
                    
                    // Add alias name condition if it exists
                    if (ledger.aliasName && ledger.aliasName.length > 0) {
                        queryConditions.push({ party: { $regex: new RegExp(escapedAliasName, 'i') } });
                    }
                    
                    const relatedVouchers = await TallyVoucher.find({
                        $or: queryConditions
                    });
                    
                    if (relatedVouchers.length > 0) {
                        // Update ledger with related voucher information
                        const voucherSummary = {
                            totalVouchers: relatedVouchers.length,
                            totalAmount: relatedVouchers.reduce((sum, v) => sum + (v.amount || 0), 0),
                            latestVoucher: relatedVouchers.sort((a, b) => new Date(b.date) - new Date(a.date))[0],
                            voucherTypes: [...new Set(relatedVouchers.map(v => v.voucherType))]
                        };
                        
                        await TallyLedger.findByIdAndUpdate(ledger._id, {
                            $set: {
                                voucherSummary: voucherSummary,
                                hasRelatedVouchers: true,
                                lastVoucherSync: new Date()
                            }
                        });
                        
                        relationshipCount++;
                        
                        if (relationshipCount % 10 === 0) {
                            console.log(`🔗 Built relationships for ${relationshipCount} ledgers...`);
                        }
                    }
                    
                } catch (error) {
                    console.error(`❌ Error building relationships for ledger "${ledger.name}":`, error.message);
                }
            }
            
        } catch (error) {
            console.error('❌ Error in relationship building:', error.message);
        }
        
        return relationshipCount;
    }

    // Generate comprehensive balance statistics
    async generateBalanceStatistics() {
        try {
            const stats = await TallyLedger.aggregate([
                {
                    $group: {
                        _id: null,
                        totalLedgers: { $sum: 1 },
                        ledgersWithOpeningBalance: { $sum: { $cond: [{ $ne: ['$openingBalance', 0] }, 1, 0] } },
                        ledgersWithClosingBalance: { $sum: { $cond: [{ $ne: ['$closingBalance', 0] }, 1, 0] } },
                        totalOpeningBalance: { $sum: '$openingBalance' },
                        totalClosingBalance: { $sum: '$closingBalance' },
                        averageOpeningBalance: { $avg: '$openingBalance' },
                        averageClosingBalance: { $avg: '$closingBalance' },
                        ledgersWithBankDetails: { $sum: { $cond: [{ $ne: ['$bankDetails.bankName', ''] }, 1, 0] } },
                        ledgersWithGSTIN: { $sum: { $cond: [{ $ne: ['$gstin', ''] }, 1, 0] } },
                        ledgersWithContactInfo: { $sum: { $cond: [{ $ne: ['$email', ''] }, 1, 0] } }
                    }
                }
            ]);
            
            return stats[0] || {};
        } catch (error) {
            console.error('Error generating balance statistics:', error.message);
            return {};
        }
    }

    // SEPARATE METHOD: Manual voucher sync (call only when needed)
    async syncVouchersManually(fromDate = null, toDate = null, maxDays = 30) {
        console.log('\n📄 Starting Manual Voucher Sync...');
        console.log(`🔗 Tally URL: ${this.TALLY_URL}`);
        
        // Default to last 30 days if no dates provided
        if (!fromDate || !toDate) {
            const defaultTo = new Date();
            const defaultFrom = new Date();
            defaultFrom.setDate(defaultFrom.getDate() - maxDays);
            fromDate = defaultFrom.toISOString().split('T')[0].replace(/-/g, '');
            toDate = defaultTo.toISOString().split('T')[0].replace(/-/g, '');
        }
        
        console.log(`📅 Date range: ${fromDate} to ${toDate}`);
        
        const results = {
            vouchers: 0,
            errors: [],
            warnings: []
        };

        try {
            // Fetch voucher data
            console.log('\n📄 Fetching voucher data from Tally...');
            const voucherPayload = this.getEnhancedVoucherPayload(fromDate, toDate);
            const voucherResponse = await this.tallyService.sendRequest(voucherPayload);
            console.log('✅ Raw voucher data received');

            const normalizedVouchers = this.normalizeEnhancedVouchers(voucherResponse);
            console.log(`📄 Normalized ${normalizedVouchers.length} vouchers`);

            if (normalizedVouchers.length === 0) {
                results.warnings.push('No vouchers found in specified date range');
                console.log('⚠️ No vouchers found');
            } else {
                // Save vouchers to database
                console.log('\n💾 Saving vouchers to database...');
                let savedVouchers = 0;
                
                for (const voucher of normalizedVouchers) {
                    try {
                        // Use voucher number + date as unique identifier
                        const query = {
                            voucherNumber: voucher.voucherNumber,
                            date: voucher.date
                        };
                        
                        await TallyVoucher.findOneAndUpdate(
                            query,
                            {
                                $set: {
                                    ...voucher,
                                    year: new Date().getFullYear(),
                                    lastUpdated: new Date()
                                }
                            },
                            { upsert: true, new: true }
                        );
                        
                        savedVouchers++;
                        
                        // Log progress for every 50 vouchers
                        if (savedVouchers % 50 === 0) {
                            console.log(`💾 Saved ${savedVouchers}/${normalizedVouchers.length} vouchers...`);
                        }
                        
                    } catch (error) {
                        results.errors.push(`Error saving voucher "${voucher.voucherNumber}": ${error.message}`);
                        console.error(`❌ Error saving voucher "${voucher.voucherNumber}":`, error.message);
                    }
                }
                
                results.vouchers = savedVouchers;
                console.log(`✅ Successfully saved ${savedVouchers} vouchers`);

                // Update ledger relationships
                console.log('\n🔗 Updating ledger-voucher relationships...');
                const relationships = await this.buildLedgerVoucherRelationships();
                console.log(`✅ Updated ${relationships} ledger-voucher relationships`);
            }

        } catch (error) {
            const errorMsg = `Manual voucher sync error: ${error.message}`;
            results.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`, error);
        }

        // Final summary
        console.log('\n📋 Manual Voucher Sync Summary:');
        console.log(`✅ Vouchers processed: ${results.vouchers}`);
        console.log(`⚠️ Warnings: ${results.warnings.length}`);
        console.log(`❌ Errors: ${results.errors.length}`);
        
        if (results.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            results.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(error => console.log(`   - ${error}`));
        }

        return results;
    }

    // Test method to verify sync quality
    async testSyncQuality() {
        console.log('\n🧪 Testing sync quality...');
        
        try {
            // Test ledger data quality
            const ledgerStats = await TallyLedger.aggregate([
                {
                    $group: {
                        _id: null,
                        totalLedgers: { $sum: 1 },
                        ledgersWithBalances: { $sum: { $cond: [{ $or: [{ $ne: ['$openingBalance', 0] }, { $ne: ['$closingBalance', 0] }] }, 1, 0] } },
                        ledgersWithBankDetails: { $sum: { $cond: [{ $ne: ['$bankDetails.bankName', ''] }, 1, 0] } },
                        ledgersWithContactInfo: { $sum: { $cond: [{ $ne: ['$contact.email', ''] }, 1, 0] } },
                        ledgersWithGSTDetails: { $sum: { $cond: [{ $ne: ['$gstDetails.gstin', ''] }, 1, 0] } }
                    }
                }
            ]);
            
            const vouchers = await TallyVoucher.countDocuments({});
            
            console.log('📊 Sync Quality Report:');
            console.log(`   Total Ledgers: ${ledgerStats[0]?.totalLedgers || 0}`);
            console.log(`   Ledgers with Balances: ${ledgerStats[0]?.ledgersWithBalances || 0}`);
            console.log(`   Ledgers with Bank Details: ${ledgerStats[0]?.ledgersWithBankDetails || 0}`);
            console.log(`   Ledgers with Contact Info: ${ledgerStats[0]?.ledgersWithContactInfo || 0}`);
            console.log(`   Ledgers with GST Details: ${ledgerStats[0]?.ledgersWithGSTDetails || 0}`);
            console.log(`   Total Vouchers: ${vouchers} (from manual sync only)`);
            
            return {
                ledgers: ledgerStats[0] || {},
                vouchers: vouchers
            };
            
        } catch (error) {
            console.error('❌ Error testing sync quality:', error.message);
            return null;
        }
    }
}

// Main execution function
async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Initialize and run enhanced sync
        const enhancedSync = new EnhancedTallySync();
        
        // Run the enhanced sync
        const results = await enhancedSync.syncEnhancedLedgerData();
        
        // Test sync quality
        await enhancedSync.testSyncQuality();
        
        console.log('\n🎉 Enhanced Tally sync completed successfully!');
        
    } catch (error) {
        console.error('❌ Main execution error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Export for use in other modules
module.exports = EnhancedTallySync;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}