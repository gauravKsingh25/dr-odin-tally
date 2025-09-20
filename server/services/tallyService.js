const axios = require('axios');
const xml2js = require('xml2js');

class TallyService {
    constructor() {
        this.tallyUrl = process.env.TALLY_URL ;
        this.parser = new xml2js.Parser({ 
            explicitArray: false, 
            mergeAttrs: true, 
            explicitRoot: true 
        });
    }

    // Generic method to send XML request to Tally with enhanced error handling and retry logic
    async sendRequest(xmlPayload, retryCount = 0, maxRetries = 3) {
        const timeouts = [120000, 180000, 300000]; // Progressive timeouts: 2min, 3min, 5min
        const currentTimeout = timeouts[Math.min(retryCount, timeouts.length - 1)];
        
        try {
            console.log(`🔗 Sending request to Tally at ${this.tallyUrl} (attempt ${retryCount + 1}/${maxRetries + 1}, timeout: ${currentTimeout/1000}s)...`);
            
            if (!this.tallyUrl) {
                throw new Error('Tally URL not configured. Please set TALLY_URL environment variable.');
            }
            
            const response = await axios.post(this.tallyUrl, xmlPayload, {
                headers: { 
                    'Content-Type': 'application/xml',
                    'Accept': 'application/xml'
                },
                timeout: currentTimeout,
                maxContentLength: 100 * 1024 * 1024, // Increased to 100MB max response
                validateStatus: function (status) {
                    return status < 500; // Accept anything less than 500 as valid
                }
            });
            
            if (response.status >= 400) {
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }
            
            if (!response.data) {
                throw new Error('Empty response received from Tally');
            }
            
            console.log(`✅ Received ${response.data.length} bytes from Tally`);
            
            const parsed = await this.parser.parseStringPromise(response.data);
            
            // Check for Tally-specific errors in the response
            const envelope = parsed?.ENVELOPE ?? parsed;
            if (envelope?.ERROR) {
                throw new Error(`Tally Error: ${envelope.ERROR}`);
            }
            
            return parsed;
        } catch (error) {
            console.error(`❌ Tally Service Error (attempt ${retryCount + 1}):`, {
                message: error.message,
                code: error.code,
                response: error.response?.status
            });
            
            // Determine if error is retryable
            const isRetryable = error.code === 'ETIMEDOUT' || 
                              error.code === 'ECONNRESET' ||
                              error.code === 'ENOTFOUND' ||
                              error.code === 'EAI_AGAIN' ||
                              (error.response?.status >= 500);
            
            // Retry if possible
            if (isRetryable && retryCount < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
                console.log(`⏳ Retrying in ${delay/1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendRequest(xmlPayload, retryCount + 1, maxRetries);
            }
            
            // Enhanced error messages for common issues
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to Tally. Please ensure Tally is running and the port is configured correctly.');
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error(`Request to Tally timed out after ${maxRetries + 1} attempts. The data volume may be too large for the current timeout settings.`);
            } else if (error.response?.status === 404) {
                throw new Error('Tally endpoint not found. Please check the Tally URL configuration.');
            } else if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please check Tally security settings.');
            } else if (error.response?.status === 403) {
                throw new Error('Access forbidden. Please check Tally user permissions.');
            }
            
            throw new Error(`Failed to fetch data from Tally after ${retryCount + 1} attempts: ${error.message}`);
        }
    }

    // Enhanced XML Templates for comprehensive data extraction
    getLedgersPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Comprehensive Ledgers</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Ledgers" ISMODIFY="No">
                                <TYPE>Ledger</TYPE>
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>RESERVEDNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>DESCRIPTION</NATIVEMETHOD>
                                <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDRESS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>TAXREGISTRATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLWISECONFIGURATION</NATIVEMETHOD>
                                <NATIVEMETHOD>COSTCENTREALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>LEDGERCONTACT</NATIVEMETHOD>
                                <NATIVEMETHOD>EMAIL</NATIVEMETHOD>
                                <NATIVEMETHOD>EMAILCC</NATIVEMETHOD>
                                <NATIVEMETHOD>PINCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>FAXNO</NATIVEMETHOD>
                                <NATIVEMETHOD>PHONENO</NATIVEMETHOD>
                                <NATIVEMETHOD>COUNTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>STATE</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKACCHOLDERNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKACCNO</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKIFSCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKSWIFTCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTREGISTRATIONTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>PLACEOFSUPPLY</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTYGSTIN</NATIVEMETHOD>
                                <NATIVEMETHOD>BASICRATEOFINTTAX</NATIVEMETHOD>
                                <NATIVEMETHOD>INTAXRATE</NATIVEMETHOD>
                                <NATIVEMETHOD>INCOMETAXNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>TAXTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>LEDSTATENAME</NATIVEMETHOD>
                                <NATIVEMETHOD>VATDEALERTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>VATTINNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBILLWISEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCOSTCENTRESON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISINTERESTON</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWINMOBILE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCOSTTRACKINGON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBENEFICIARYCODEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISUPDATINGTARGETID</NATIVEMETHOD>
                                <NATIVEMETHOD>ASORIGINAL</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCONDENSED</NATIVEMETHOD>
                                <NATIVEMETHOD>AFFECTSSTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFORVAT</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNORETDSEXEMPTLIMIT</NATIVEMETHOD>
                                <NATIVEMETHOD>ISTCSAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISTDSAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISFBTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISEAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISTDSPROJECTED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXEMPTED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISABATEMENTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBANKRECONCILIATIONAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSALESTAXAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSERVICETAXAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISVATAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>PAYMENTDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>MAILINGNAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLCREDITPERIOD</NATIVEMETHOD>
                                <NATIVEMETHOD>CREDITLIMIT</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCEQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>INTERESTCOLLECTION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>LEDGERFROMITEM</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>FOREXDETAILS.LIST</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    getVouchersPayload(fromDate = null, toDate = null) {
        // Ensure we always filter at Tally source from 2022-01-01 till today
        const formatYmd = (d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}${mm}${dd}`;
        };

        let from = fromDate;
        let to = toDate;
        if (!from || !to) {
            const defaultFrom = new Date('2022-01-01T00:00:00.000Z');
            const defaultTo = new Date();
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
                <ID>Comprehensive Vouchers</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Vouchers" ISMODIFY="No">
                                <TYPE>Voucher</TYPE>
                                ${dateFilter}
                                <NATIVEMETHOD>DATE</NATIVEMETHOD>
                                <NATIVEMETHOD>VOUCHERTYPENAME</NATIVEMETHOD>
                                <NATIVEMETHOD>VOUCHERNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>REFERENCE</NATIVEMETHOD>
                                <NATIVEMETHOD>REFERENCEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>NARRATION</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>VOUCHERKEY</NATIVEMETHOD>
                                <NATIVEMETHOD>AMOUNT</NATIVEMETHOD>
                                <NATIVEMETHOD>EWAYBILLNO</NATIVEMETHOD>
                                <NATIVEMETHOD>EWAY.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTREGISTRATION</NATIVEMETHOD>
                                <NATIVEMETHOD>PLACEOFSUPPLY</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTYGSTIN</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTYLEDGERNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>CSTFORMISSUETYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>CSTFORMRECVTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>FBTPAYMENTTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>PERSISTEDVIEW</NATIVEMETHOD>
                                <NATIVEMETHOD>VCHSTATUSDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>VCHSTATUSTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>VOUCHERTYPEORIGNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ISINVOICE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISINVOICEISSUED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISOPTIONAL</NATIVEMETHOD>
                                <NATIVEMETHOD>EFFECTIVEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>BASICVOUCHERDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFOREXCISE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISEVOUCHER</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISETARIFF</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEVATOVERRIDE</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFORINTEREST</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFORGAINLOSS</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFORGODOWNTRANSFER</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFORCOMPOUND</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFORSERVICETAX</NATIVEMETHOD>
                                <NATIVEMETHOD>ISDELETED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISONHOLD</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCANCELLED</NATIVEMETHOD>
                                <NATIVEMETHOD>HASCASHFLOW</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPOSTDATED</NATIVEMETHOD>
                                <NATIVEMETHOD>USETRACKINGNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>ISINVENTORYAFFECTED</NATIVEMETHOD>
                                <NATIVEMETHOD>ASORIGINAL</NATIVEMETHOD>
                                <NATIVEMETHOD>AUDITED</NATIVEMETHOD>
                                <NATIVEMETHOD>FORJOBCOSTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ISOPTIONAL</NATIVEMETHOD>
                                <NATIVEMETHOD>USEFOREXCISE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISEVOUCHER</NATIVEMETHOD>
                                <NATIVEMETHOD>BASICBUYERSSALESTAX</NATIVEMETHOD>
                                <NATIVEMETHOD>BASICSELLERSSALESTAX</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCSTDUTYPAID</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISEMANUFACTURERON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBOENOTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISECAPTIVEUSE</NATIVEMETHOD>
                                <NATIVEMETHOD>LANENO</NATIVEMETHOD>
                                <NATIVEMETHOD>CONSIGNEEGSTIN</NATIVEMETHOD>
                                <NATIVEMETHOD>CONSIGNEEPINCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>CONSIGNEESTATENAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BUYERADDRESS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>CONSIGNEEADDRESS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BUYERMAILINGNAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>CONSIGNEEMAILINGNAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BUYERGSTIN</NATIVEMETHOD>
                                <NATIVEMETHOD>BUYERPINCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>BUYERSTATENAME</NATIVEMETHOD>
                                <NATIVEMETHOD>DIFFACTUALQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>ISMSTFROMSYNC</NATIVEMETHOD>
                                <NATIVEMETHOD>ASORIGINAL</NATIVEMETHOD>
                                <NATIVEMETHOD>AUDITED</NATIVEMETHOD>
                                <NATIVEMETHOD>FORJOBCOSTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ISOPTIONAL</NATIVEMETHOD>
                                <NATIVEMETHOD>EFFECTIVEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISOPTIONAL</NATIVEMETHOD>
                                <NATIVEMETHOD>LEDGERENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLINVENTORYENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PAYROLLMODEOFPAYMENT.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ATTDRECORDS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EWAYBILLDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCLUDEDTAXATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>OLDAUDITENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ACCOUNTAUDITENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>AUDITENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INPUTCRALLOCS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>DUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>SUPPLEMENTARYDUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EWAYBILLDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INVOICEDELNOTES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INVOICEORDERLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INVOICEINDENTLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ATTENDANCEENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ORIGINVOICEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INVOICEEXPORTLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTTAXADJUSTMENTS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTBUYERADDRESS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTCONSIGNEEADDRESS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>TEMPGSTRATEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTCLASSIFICATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BANKALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INTERESTCOLLECTION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>OLDAUDITENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ACCOUNTAUDITENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>AUDITENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INPUTCRALLOCS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>DUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEDUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>RATEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>SUMMARYALLOCS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>STPYMTDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEDUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>SUPPLEMENTARYDUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>VATDUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTDUTYHEADDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>POSDAYBOOKENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>FBTPAYMENTDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>VATITCDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ADVANCETAXDETAILS.LIST</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    getStockItemsPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Comprehensive Stock Items</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Stock Items" ISMODIFY="No">
                                <TYPE>StockItem</TYPE>
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>CATEGORY</NATIVEMETHOD>
                                <NATIVEMETHOD>TAXCLASSIFICATIONNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEAPPLICABILITY</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEACCOUNTHEAD</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEITEMCLASSIFICATION</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISECLASSIFICATIONDETAIL</NATIVEMETHOD>
                                <NATIVEMETHOD>STOCKITEMCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>DESCRIPTION</NATIVEMETHOD>
                                <NATIVEMETHOD>NARRATION</NATIVEMETHOD>
                                <NATIVEMETHOD>COSTINGMETHOD</NATIVEMETHOD>
                                <NATIVEMETHOD>VALUATIONMETHOD</NATIVEMETHOD>
                                <NATIVEMETHOD>BASEUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDITIONALUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTTYPEOFSUPPLY</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTGOODSORSRVCTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>HSNCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>HSNMASTERNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>TARIFF</NATIVEMETHOD>
                                <NATIVEMETHOD>SUPPLEMENTARYDUTY</NATIVEMETHOD>
                                <NATIVEMETHOD>VATCOMMODITY</NATIVEMETHOD>
                                <NATIVEMETHOD>VATCOMMODITYCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEDUTYTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEDUTYHEADCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISELEDGERNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEDUTYHEAD</NATIVEMETHOD>
                                <NATIVEMETHOD>SERVICECATEGORY</NATIVEMETHOD>
                                <NATIVEMETHOD>RATEOFDUTY</NATIVEMETHOD>
                                <NATIVEMETHOD>UNITOFMEASUREMENT</NATIVEMETHOD>
                                <NATIVEMETHOD>REORDERBASE</NATIVEMETHOD>
                                <NATIVEMETHOD>REORDERLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>MINLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>MAXLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>DENOMINATOR</NATIVEMETHOD>
                                <NATIVEMETHOD>CONVERSION</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGRATE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGRATE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCEQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCEVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>COSTPERCENT</NATIVEMETHOD>
                                <NATIVEMETHOD>AFFECTSSTOCKVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>FORPURCHASE</NATIVEMETHOD>
                                <NATIVEMETHOD>FORSALES</NATIVEMETHOD>
                                <NATIVEMETHOD>FORPRODUCTION</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCOSTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ISMAINTAINBATCH</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPERISHABLEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISENTRYLEVELTAX</NATIVEMETHOD>
                                <NATIVEMETHOD>ISLASTDEEMEDPOSITIVE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISCALCONMRP</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPRICEONOFFER</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWUSEOFEXPIREDITEMS</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNORENEGATIVESTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREBATCHES</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREGODOWNS</NATIVEMETHOD>
                                <NATIVEMETHOD>CALCONMRP</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCLUDEJRNLFORVALUATION</NATIVEMETHOD>
                                <NATIVEMETHOD>ISMRPINCLOFTAX</NATIVEMETHOD>
                                <NATIVEMETHOD>ISADDLCOSTINGLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPURCACCWITHITC</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISECALCULATEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBATCHWISEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTEXEMPTED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTASSESSABLEVALUEOVERRIDDEN</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTDUTYHEAD</NATIVEMETHOD>
                                <NATIVEMETHOD>INCLUDEINSYNC</NATIVEMETHOD>
                                <NATIVEMETHOD>ASORIGINAL</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREPHYSICALDIFFERENCE</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNORENEGATIVESTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATSALESASMANUFACTURED</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATPURCHASESASCONSUMED</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATREJECTSASSCRAP</NATIVEMETHOD>
                                <NATIVEMETHOD>HASMFGDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWUSEOFEXPIREDITEMS</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREBATCHES</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREGODOWNS</NATIVEMETHOD>
                                <NATIVEMETHOD>CALCONMRP</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCLUDEJRNLFORVALUATION</NATIVEMETHOD>
                                <NATIVEMETHOD>ISMRPINCLOFTAX</NATIVEMETHOD>
                                <NATIVEMETHOD>ISADDLCOSTINGLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPURCACCWITHITC</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISECALCULATEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBATCHWISEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTEXEMPTED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTASSESSABLEVALUEOVERRIDDEN</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTDUTYHEAD</NATIVEMETHOD>
                                <NATIVEMETHOD>INCLUDEINSYNC</NATIVEMETHOD>
                                <NATIVEMETHOD>ASORIGINAL</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREPHYSICALDIFFERENCE</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDITIONALUNITS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>STANDARDCOSTLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>STANDARDPRICELIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>VATCLASSIFICATIONLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISECLASSIFICATIONLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTCLASSIFICATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BATCHALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GODOWNBALANCE.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>MULTIPLEOFQTY.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>RATEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>MFGDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>COMPONENTLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>SALESCOSTCENTREALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PURCHASECOSTCENTREALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>STOCKGROUPLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PRICEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>DISCOUNTDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>COSTCENTREALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCE.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGVALUE.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCE.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGVALUE.LIST</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    getCompanyInfoPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Comprehensive Company Info</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Company Info" ISMODIFY="No">
                                <TYPE>Company</TYPE>
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>MAILINGNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENTNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>COMPANYID</NATIVEMETHOD>
                                <NATIVEMETHOD>REMOTENAME</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>DESCRIPTION</NATIVEMETHOD>
                                <NATIVEMETHOD>CURRENCYSYMBOL</NATIVEMETHOD>
                                <NATIVEMETHOD>CURRENCY</NATIVEMETHOD>
                                <NATIVEMETHOD>FINYEARFROM</NATIVEMETHOD>
                                <NATIVEMETHOD>FINYEARTO</NATIVEMETHOD>
                                <NATIVEMETHOD>BOOKSBEGININGFROM</NATIVEMETHOD>
                                <NATIVEMETHOD>INCOMETAXNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>SALESTAXNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEECFNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEREGDNO</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISERANGE</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEDIVISION</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISECOMMISSIONERATE</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISECOLLECTORATE</NATIVEMETHOD>
                                <NATIVEMETHOD>SERVICETAXNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTREGISTRATIONTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTIN</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTREGISTRATIONNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>PLACEOFSUPPLY</NATIVEMETHOD>
                                <NATIVEMETHOD>PINCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>EMAIL</NATIVEMETHOD>
                                <NATIVEMETHOD>WEBSITE</NATIVEMETHOD>
                                <NATIVEMETHOD>PHONENUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>FAXNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>COUNTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>STATE</NATIVEMETHOD>
                                <NATIVEMETHOD>TDSDEDUCTEETYPENUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>COMPANYNUMBER</NATIVEMETHOD>
                                <NATIVEMETHOD>COMPANYTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>NATURE</NATIVEMETHOD>
                                <NATIVEMETHOD>USESECONDARYUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>USECOMPOUND</NATIVEMETHOD>
                                <NATIVEMETHOD>USEREVISIONTRACKING</NATIVEMETHOD>
                                <NATIVEMETHOD>AUDITED</NATIVEMETHOD>
                                <NATIVEMETHOD>LOCKEDHOLIDAYS</NATIVEMETHOD>
                                <NATIVEMETHOD>FREEZEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>AUTHORISE</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEGROUPCOMPANY</NATIVEMETHOD>
                                <NATIVEMETHOD>USEADVANCECONFIGURATION</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLETICKETING</NATIVEMETHOD>
                                <NATIVEMETHOD>SEPARATELYSHOWNONCLIENTSTMT</NATIVEMETHOD>
                                <NATIVEMETHOD>USEINTERNETBANKING</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEFUSIONBANKING</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTICIPATION</NATIVEMETHOD>
                                <NATIVEMETHOD>FUNDFLOW</NATIVEMETHOD>
                                <NATIVEMETHOD>DISALLOWCREATIONWITHOUTSTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEGSTENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEVATENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLESERVICETAXENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEEXCISEENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLETCSENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLETDSENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEFBTENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEDEPRECIATION</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEINTEREST</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWZEROVOUCHERPRINTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWCANCELVOUCHERPRINTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWTRANSFERSALESONPURCHASE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISVATUNREGISTERED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISGSTUNREGISTERED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISEXCISEUNREGISTERED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSERVICETAXUNREGISTERED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISTCSUNREGISTERED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISTDSUNREGISTERED</NATIVEMETHOD>
                                <NATIVEMETHOD>ISFBTUNREGISTERED</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWMULTIPLESTDRATES</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWZEROINTEREST</NATIVEMETHOD>
                                <NATIVEMETHOD>CALCTOTALINTEREST</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLETDSINTAX</NATIVEMETHOD>
                                <NATIVEMETHOD>TDSROUNDOFF</NATIVEMETHOD>
                                <NATIVEMETHOD>SPLITCOMPOUNDENTRY</NATIVEMETHOD>
                                <NATIVEMETHOD>ISDEFAULTCOMPANY</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSECURITYONWHENTALLY</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSECURITYONWHENPRINTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSECURITYONWHENMAILING</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSECURITYONWHENEXPORTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSECURITYONWHENDATAEXCHANGE</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSECURITYONWHENVIEWREPORTS</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEDAYWISEREPORTING</NATIVEMETHOD>
                                <NATIVEMETHOD>ONSCREENPERIOD</NATIVEMETHOD>
                                <NATIVEMETHOD>PRINTINGPERIOD</NATIVEMETHOD>
                                <NATIVEMETHOD>ONSCREENFREQUENCY</NATIVEMETHOD>
                                <NATIVEMETHOD>PRINTINGFREQUENCY</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTDAYOFPERIOD</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLECONTRACTVOUCHERS</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEBANKINGVOUCHERS</NATIVEMETHOD>
                                <NATIVEMETHOD>ENABLEPRICINGVOUCHERS</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDRESS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>COMPANYGSTIN.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCISEREGISTRATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>VATREGISTRATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>SERVICETAXREGISTRATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INCOMETAXREGISTRATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>WORKFLOWGROUPS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCHANGERATELIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>CURRENCYLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>FOREXRATES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>REMOTCOMPINFO.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERNATENAMES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTREGISTRATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INPUTCRALLOWLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>COMPSTGATELIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>OLDAUDITENTRYIDS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>AUDITENTRYIDS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>XBRLCOMPANYMAPPING.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>MULTISITEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>COMPANYOPENINGSLIMITS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BILLALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>INTERESTCOLLECTION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>AUDITENTRYIDS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>OLDAUDITENTRYIDS.LIST</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    getGroupsPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Comprehensive Groups</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Groups" ISMODIFY="No">
                                <TYPE>Group</TYPE>
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>PRIMARYGROUP</NATIVEMETHOD>
                                <NATIVEMETHOD>RESERVEDNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>DESCRIPTION</NATIVEMETHOD>
                                <NATIVEMETHOD>NATURE</NATIVEMETHOD>
                                <NATIVEMETHOD>CATEGORY</NATIVEMETHOD>
                                <NATIVEMETHOD>SUBLEDGER</NATIVEMETHOD>
                                <NATIVEMETHOD>SORTPOSITION</NATIVEMETHOD>
                                <NATIVEMETHOD>DEEPERLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>AFFECTSSTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>SORTPOSITION</NATIVEMETHOD>
                                <NATIVEMETHOD>DEEPERLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>AFFECTSSTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>FORPAYROLL</NATIVEMETHOD>
                                <NATIVEMETHOD>ISSUBLEDGER</NATIVEMETHOD>
                                <NATIVEMETHOD>ISDEEMEDPOSITIVE</NATIVEMETHOD>
                                <NATIVEMETHOD>TRACKNEGATIVEBALANCES</NATIVEMETHOD>
                                <NATIVEMETHOD>BEHAVEASDUTY</NATIVEMETHOD>
                                <NATIVEMETHOD>SUBGROUPS</NATIVEMETHOD>
                                <NATIVEMETHOD>GROUPSINGROUP</NATIVEMETHOD>
                                <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    getCostCentersPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Comprehensive Cost Centers</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Cost Centers" ISMODIFY="No">
                                <TYPE>CostCentre</TYPE>
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>CATEGORY</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>RESERVEDNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>SORTPOSITION</NATIVEMETHOD>
                                <NATIVEMETHOD>USEDFORALLOCATION</NATIVEMETHOD>
                                <NATIVEMETHOD>AFFECTSSTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>FORPAYROLL</NATIVEMETHOD>
                                <NATIVEMETHOD>FORJOBCOSTING</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    getCurrenciesPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Comprehensive Currencies</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Currencies" ISMODIFY="No">
                                <TYPE>Currency</TYPE>
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>EXPANDEDNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>SYMBOL</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>RESERVEDNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ORIGINALNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>DECIMALPLACES</NATIVEMETHOD>
                                <NATIVEMETHOD>ISBASECURRENCY</NATIVEMETHOD>
                                <NATIVEMETHOD>EXCHANGERATE</NATIVEMETHOD>
                                <NATIVEMETHOD>SHOWAMOUNTSINMILLIONS</NATIVEMETHOD>
                                <NATIVEMETHOD>HASSYMBOL</NATIVEMETHOD>
                                <NATIVEMETHOD>PUTSYMBOLINFRONT</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDSPACEBETWEEN</NATIVEMETHOD>
                                <NATIVEMETHOD>FORMALNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>SUBUNIT</NATIVEMETHOD>
                                <NATIVEMETHOD>HUNDREDSNAME</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    // Helper methods for parsing with enhanced validation
    safeString(value) {
        if (value == null || value === undefined) return '';
        if (typeof value === 'object' && value._ != null) return String(value._).trim();
        return String(value).trim();
    }

    safeNumber(value) {
        if (value == null || value === undefined) return 0;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'object' && value._ != null) value = value._;
        
        let stringValue = String(value).trim();
        
        // Handle empty or invalid strings
        if (stringValue === '' || stringValue === 'undefined' || stringValue === 'null') return 0;

        // Remove thousand separators (both comma and space)
        stringValue = stringValue.replace(/[,\s]/g, '');

        // Handle Dr/Cr notations used by Tally. Treat Cr as negative, Dr as positive
        // Support both suffix and prefix positions (e.g., "1234.50 Cr" or "Cr 1234.50")
        let sign = 1;
        const hasCr = /\bCR\b/i.test(stringValue);
        const hasDr = /\bDR\b/i.test(stringValue);
        if (hasCr) sign = -1;
        else if (hasDr) sign = 1;
        stringValue = stringValue.replace(/\bDR\b|\bCR\b/gi, '').trim();

        // Parentheses indicate negative amounts: (1234.50)
        const hasParens = /^\(.*\)$/.test(stringValue);
        if (hasParens) {
            sign *= -1;
            stringValue = stringValue.slice(1, -1).trim();
        }

        // Strip any remaining non-numeric characters except leading minus and decimal point
        stringValue = stringValue.replace(/[^0-9.-]/g, '');

        if (stringValue === '' || stringValue === '-' || stringValue === '.') return 0;
        
        const number = parseFloat(stringValue);
        if (!Number.isFinite(number)) {
            console.warn(`Warning: Invalid number conversion for value "${value}", returning 0`);
            return 0;
        }
        
        return number * sign;
    }

    findCollection(parsed) {
        const envelope = parsed?.ENVELOPE ?? parsed;
        const body = envelope?.BODY ?? envelope?.Body ?? envelope?.body;
        if (!body) return null;
        
        const data = body?.DATA ?? body?.Data ?? body?.data ?? null;
        if (!data) return null;
        
        const collection = Array.isArray(data) 
            ? (data[0]?.COLLECTION ?? data[0]?.Collection) 
            : (data.COLLECTION ?? data.Collection);
        
        return collection ?? null;
    }

    // Fetch methods
    async fetchLedgers() {
        const xmlPayload = this.getLedgersPayload();
        return await this.sendRequest(xmlPayload);
    }

    async fetchVouchers(fromDate = null, toDate = null) {
        const xmlPayload = this.getVouchersPayload(fromDate, toDate);
        return await this.sendRequest(xmlPayload);
    }

    async fetchStockItems() {
        const xmlPayload = this.getStockItemsPayload();
        return await this.sendRequest(xmlPayload);
    }

    async fetchCompanyInfo() {
        const xmlPayload = this.getCompanyInfoPayload();
        return await this.sendRequest(xmlPayload);
    }

    async fetchGroups() {
        const xmlPayload = this.getGroupsPayload();
        return await this.sendRequest(xmlPayload);
    }

    async fetchCostCenters() {
        const xmlPayload = this.getCostCentersPayload();
        return await this.sendRequest(xmlPayload);
    }

    async fetchCurrencies() {
        const xmlPayload = this.getCurrenciesPayload();
        return await this.sendRequest(xmlPayload);
    }

    // Enhanced normalize methods for comprehensive data extraction
    normalizeLedgers(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) return [];

        let ledgers = collection.LEDGER ?? collection.Ledger ?? null;
        if (!ledgers && Array.isArray(collection)) {
            ledgers = collection;
        }
        if (!ledgers) return [];
        if (!Array.isArray(ledgers)) ledgers = [ledgers];

        return ledgers.map((ledger) => {
            const name = this.safeString(ledger.NAME ?? ledger.name ?? '');
            const aliasName = this.safeString(ledger.ALIASNAME ?? '');
            const reservedName = this.safeString(ledger.RESERVEDNAME ?? '');
            const parent = this.safeString(ledger.PARENT ?? '');
            const openingBalance = this.safeNumber(ledger.OPENINGBALANCE);
            const closingBalance = this.safeNumber(ledger.CLOSINGBALANCE);
            const guid = this.safeString(ledger.GUID ?? '');
            const masterId = this.safeString(ledger.MASTERID ?? '');
            const alterId = this.safeString(ledger.ALTERID ?? '');
            const description = this.safeString(ledger.DESCRIPTION ?? '');

            // Extract language information
            let languageName = '';
            let languageId = null;
            const lang = ledger['LANGUAGENAME.LIST'] ?? ledger['LANGUAGENAME'] ?? null;
            if (lang && typeof lang === 'object') {
                const nameList = lang['NAME.LIST'] ?? lang['NAME'] ?? null;
                if (nameList) {
                    languageName = this.safeString(nameList.NAME ?? nameList);
                }
                const lid = lang.LANGUAGEID ?? null;
                if (lid) {
                    languageId = parseInt(this.safeString(lid)) || null;
                }
            }

            // Extract address information
            let addressList = [];
            const addresses = ledger['ADDRESS.LIST'] ?? null;
            if (addresses) {
                const addrArray = Array.isArray(addresses) ? addresses : [addresses];
                addressList = addrArray.map(addr => this.safeString(addr));
            }

            // Extract GST information
            let gstDetails = {};
            const taxReg = ledger['TAXREGISTRATION.LIST'] ?? null;
            if (taxReg) {
                const taxArray = Array.isArray(taxReg) ? taxReg : [taxReg];
                taxArray.forEach(tax => {
                    if (tax.TAXTYPE === 'GST') {
                        gstDetails.registrationType = this.safeString(tax.REGISTRATIONTYPE ?? '');
                        gstDetails.gstin = this.safeString(tax.TAXREGISTRATION ?? '');
                        gstDetails.placeOfSupply = this.safeString(tax.PLACEOFSUPPLY ?? '');
                    }
                });
            }

            // Extract contact information
            const contact = {
                email: this.safeString(ledger.EMAIL ?? ''),
                emailCC: this.safeString(ledger.EMAILCC ?? ''),
                phone: this.safeString(ledger.PHONENO ?? ''),
                fax: this.safeString(ledger.FAXNO ?? ''),
                pincode: this.safeString(ledger.PINCODE ?? ''),
                country: this.safeString(ledger.COUNTRY ?? ''),
                state: this.safeString(ledger.STATE ?? ''),
                ledgerContact: this.safeString(ledger.LEDGERCONTACT ?? '')
            };

            // Extract bank details
            const bankDetails = {
                bankName: this.safeString(ledger.BANKNAME ?? ''),
                accountHolderName: this.safeString(ledger.BANKACCHOLDERNAME ?? ''),
                accountNumber: this.safeString(ledger.BANKACCNO ?? ''),
                ifscCode: this.safeString(ledger.BANKIFSCODE ?? ''),
                swiftCode: this.safeString(ledger.BANKSWIFTCODE ?? '')
            };

            // Extract GST registration details
            const gstRegistration = {
                registrationType: this.safeString(ledger.GSTREGISTRATIONTYPE ?? ''),
                gstin: this.safeString(ledger.PARTYGSTIN ?? ''),
                placeOfSupply: this.safeString(ledger.PLACEOFSUPPLY ?? '')
            };

            // Extract tax information
            const taxInfo = {
                basicRateOfInterestTax: this.safeNumber(ledger.BASICRATEOFINTTAX ?? 0),
                interestTaxRate: this.safeNumber(ledger.INTAXRATE ?? 0),
                incomeTaxNumber: this.safeString(ledger.INCOMETAXNUMBER ?? ''),
                taxType: this.safeString(ledger.TAXTYPE ?? ''),
                ledgerStateName: this.safeString(ledger.LEDSTATENAME ?? ''),
                vatDealerType: this.safeString(ledger.VATDEALERTYPE ?? ''),
                vatTinNumber: this.safeString(ledger.VATTINNUMBER ?? '')
            };

            // Extract boolean flags
            const flags = {
                isBillwiseOn: ledger.ISBILLWISEON === 'Yes',
                isCostCentresOn: ledger.ISCOSTCENTRESON === 'Yes',
                isInterestOn: ledger.ISINTERESTON === 'Yes',
                allowInMobile: ledger.ALLOWINMOBILE === 'Yes',
                isCostTrackingOn: ledger.ISCOSTTRACKINGON === 'Yes',
                isBeneficiaryCodeOn: ledger.ISBENEFICIARYCODEON === 'Yes',
                isUpdatingTargetId: ledger.ISUPDATINGTARGETID === 'Yes',
                asOriginal: ledger.ASORIGINAL === 'Yes',
                isCondensed: ledger.ISCONDENSED === 'Yes',
                affectsStock: ledger.AFFECTSSTOCK === 'Yes',
                useForVat: ledger.USEFORVAT === 'Yes',
                ignoreTdsExemptLimit: ledger.IGNORETDSEXEMPTLIMIT === 'Yes',
                isTcsApplicable: ledger.ISTCSAPPLICABLE === 'Yes',
                isTdsApplicable: ledger.ISTDSAPPLICABLE === 'Yes',
                isFbtApplicable: ledger.ISFBTAPPLICABLE === 'Yes',
                isGstApplicable: ledger.ISGSTAPPLICABLE === 'Yes',
                isExciseApplicable: ledger.ISEXCISEAPPLICABLE === 'Yes',
                isTdsProjected: ledger.ISTDSPROJECTED === 'Yes',
                isExempted: ledger.ISEXEMPTED === 'Yes',
                isAbatementApplicable: ledger.ISABATEMENTAPPLICABLE === 'Yes',
                isBankReconciliationApplicable: ledger.ISBANKRECONCILIATIONAPPLICABLE === 'Yes',
                isSalesTaxApplicable: ledger.ISSALESTAXAPPLICABLE === 'Yes',
                isServiceTaxApplicable: ledger.ISSERVICETAXAPPLICABLE === 'Yes',
                isVatApplicable: ledger.ISVATAPPLICABLE === 'Yes'
            };

            // Extract billing information
            const billingInfo = {
                billCreditPeriod: this.safeString(ledger.BILLCREDITPERIOD ?? ''),
                creditLimit: this.safeNumber(ledger.CREDITLIMIT ?? 0),
                closingBalanceQty: this.safeNumber(ledger.CLOSINGBALANCEQTY ?? 0)
            };

            // Extract additional lists
            let paymentDetails = [];
            const paymentList = ledger['PAYMENTDETAILS.LIST'] ?? null;
            if (paymentList) {
                const payments = Array.isArray(paymentList) ? paymentList : [paymentList];
                paymentDetails = payments.map(payment => ({
                    bankName: this.safeString(payment.BANKNAME ?? ''),
                    accountNumber: this.safeString(payment.ACCOUNTNUMBER ?? ''),
                    ifscCode: this.safeString(payment.IFSCCODE ?? ''),
                    accountType: this.safeString(payment.ACCOUNTTYPE ?? '')
                }));
            }

            let mailingNames = [];
            const mailingNameList = ledger['MAILINGNAME.LIST'] ?? null;
            if (mailingNameList) {
                const names = Array.isArray(mailingNameList) ? mailingNameList : [mailingNameList];
                mailingNames = names.map(name => this.safeString(name));
            }

            let billAllocations = [];
            const billAllocationList = ledger['BILLALLOCATIONS.LIST'] ?? null;
            if (billAllocationList) {
                const allocations = Array.isArray(billAllocationList) ? billAllocationList : [billAllocationList];
                billAllocations = allocations.map(allocation => ({
                    name: this.safeString(allocation.NAME ?? ''),
                    billType: this.safeString(allocation.BILLTYPE ?? ''),
                    amount: this.safeNumber(allocation.AMOUNT ?? 0)
                }));
            }

            let costCentreAllocations = [];
            const costCentreList = ledger['COSTCENTREALLOCATIONS.LIST'] ?? null;
            if (costCentreList) {
                const allocations = Array.isArray(costCentreList) ? costCentreList : [costCentreList];
                costCentreAllocations = allocations.map(allocation => ({
                    name: this.safeString(allocation.NAME ?? ''),
                    amount: this.safeNumber(allocation.AMOUNT ?? 0)
                }));
            }

            let interestCollection = [];
            const interestList = ledger['INTERESTCOLLECTION.LIST'] ?? null;
            if (interestList) {
                const interests = Array.isArray(interestList) ? interestList : [interestList];
                interestCollection = interests.map(interest => ({
                    name: this.safeString(interest.NAME ?? ''),
                    rate: this.safeNumber(interest.RATE ?? 0),
                    amount: this.safeNumber(interest.AMOUNT ?? 0)
                }));
            }

            let forexDetails = [];
            const forexList = ledger['FOREXDETAILS.LIST'] ?? null;
            if (forexList) {
                const forex = Array.isArray(forexList) ? forexList : [forexList];
                forexDetails = forex.map(detail => ({
                    currency: this.safeString(detail.CURRENCY ?? ''),
                    exchangeRate: this.safeNumber(detail.EXCHANGERATE ?? 0),
                    amount: this.safeNumber(detail.AMOUNT ?? 0)
                }));
            }

            return {
                name,
                aliasName,
                reservedName,
                parent,
                openingBalance,
                closingBalance,
                languageName,
                languageId,
                guid,
                masterId,
                alterId,
                description,
                addressList,
                gstDetails,
                contact,
                bankDetails,
                gstRegistration,
                taxInfo,
                flags,
                billingInfo,
                paymentDetails,
                mailingNames,
                billAllocations,
                costCentreAllocations,
                interestCollection,
                forexDetails,
                isGroup: parent === '',
                lastUpdated: new Date(),
                rawData: ledger
            };
        });
    }

    normalizeVouchers(parsed) {
        const collection = this.findCollection(parsed);
        let vouchers = null;
        
        if (collection) {
            vouchers = collection.VOUCHER ?? collection.Voucher ?? collection.VOUCHERTYPE ?? collection.VoucherType ?? null;
        }

        if (!vouchers) {
            const envelope = parsed?.ENVELOPE ?? parsed;
            const body = envelope?.BODY ?? envelope?.Body ?? envelope?.body;
            if (body) {
                const data = Array.isArray(body.DATA) ? body.DATA : [body.DATA].filter(Boolean);
                for (const d of data) {
                    const coll = d?.COLLECTION ?? d?.Collection;
                    if (coll) {
                        if (coll.VOUCHER) vouchers = coll.VOUCHER;
                        else if (coll.VOUCHERTYPE) vouchers = coll.VOUCHERTYPE;
                        else if (Array.isArray(coll)) vouchers = coll;
                    }
                }
            }
        }

        if (!vouchers) return [];
        if (!Array.isArray(vouchers)) vouchers = [vouchers];

        return vouchers.map((voucher) => {
            const date = this.safeString(voucher.DATE ?? voucher.VOUCHERDATE ?? '');
            const voucherNumber = this.safeString(voucher.VOUCHERNUMBER ?? voucher.VOUCHERKEY ?? '');
            const voucherType = this.safeString(voucher.VOUCHERTYPENAME ?? voucher.VOUCHERTYPE ?? '');
            const party = this.safeString(voucher.PARTYLEDGERNAME ?? voucher.PARTY ?? '');
            const narration = this.safeString(voucher.NARRATION ?? voucher.REMARKS ?? '');
            const guid = this.safeString(voucher.GUID ?? '');
            const masterId = this.safeString(voucher.MASTERID ?? '');
            const voucherKey = this.safeString(voucher.VOUCHERKEY ?? '');

            let amount = this.safeNumber(voucher.AMOUNT);
            if (amount === 0 && voucher.LEDGERENTRIES?.LIST) {
                const entries = Array.isArray(voucher.LEDGERENTRIES.LIST) 
                    ? voucher.LEDGERENTRIES.LIST 
                    : [voucher.LEDGERENTRIES.LIST];
                amount = entries.reduce((acc, entry) => 
                    acc + this.safeNumber(entry.AMOUNT ?? entry.CLOSINGBALANCE ?? 0), 0);
            }

            // Parse ledger entries
            let ledgerEntries = [];
            if (voucher.LEDGERENTRIES?.LIST) {
                const entries = Array.isArray(voucher.LEDGERENTRIES.LIST) 
                    ? voucher.LEDGERENTRIES.LIST 
                    : [voucher.LEDGERENTRIES.LIST];
                
                ledgerEntries = entries.map(entry => ({
                    ledgerName: this.safeString(entry.LEDGERNAME ?? ''),
                    amount: this.safeNumber(entry.AMOUNT ?? 0),
                    isDebit: this.safeNumber(entry.AMOUNT ?? 0) >= 0
                }));
            }

            // Extract cost center allocations from ledger entries
            let costCentreAllocations = [];
            if (voucher.ALLLEDGERENTRIES?.LIST) {
                const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                    ? voucher.ALLLEDGERENTRIES.LIST 
                    : [voucher.ALLLEDGERENTRIES.LIST];
                
                entries.forEach(entry => {
                    // Check for direct cost center allocations
                    if (entry['COSTCENTREALLOCATIONS.LIST']) {
                        const ccAllocations = Array.isArray(entry['COSTCENTREALLOCATIONS.LIST'])
                            ? entry['COSTCENTREALLOCATIONS.LIST']
                            : [entry['COSTCENTREALLOCATIONS.LIST']];
                        
                        ccAllocations.forEach(cc => {
                            if (cc.NAME && cc.AMOUNT) {
                                costCentreAllocations.push({
                                    costCentre: this.safeString(cc.NAME._ || cc.NAME),
                                    amount: this.safeNumber(cc.AMOUNT._ || cc.AMOUNT),
                                    percentage: 0,
                                    ledgerName: this.safeString(entry.LEDGERNAME?._ || entry.LEDGERNAME || '')
                                });
                            }
                        });
                    }
                    
                    // Check for cost center allocations within category allocations
                    if (entry['CATEGORYALLOCATIONS.LIST']) {
                        const categoryAllocations = Array.isArray(entry['CATEGORYALLOCATIONS.LIST'])
                            ? entry['CATEGORYALLOCATIONS.LIST']
                            : [entry['CATEGORYALLOCATIONS.LIST']];
                        
                        categoryAllocations.forEach(category => {
                            if (category['COSTCENTREALLOCATIONS.LIST']) {
                                const ccAllocations = Array.isArray(category['COSTCENTREALLOCATIONS.LIST'])
                                    ? category['COSTCENTREALLOCATIONS.LIST']
                                    : [category['COSTCENTREALLOCATIONS.LIST']];
                                
                                ccAllocations.forEach(cc => {
                                    if (cc.NAME && cc.AMOUNT) {
                                        costCentreAllocations.push({
                                            costCentre: this.safeString(cc.NAME._ || cc.NAME),
                                            amount: this.safeNumber(cc.AMOUNT._ || cc.AMOUNT),
                                            percentage: 0,
                                            category: this.safeString(category.CATEGORY?._ || category.CATEGORY || ''),
                                            ledgerName: this.safeString(entry.LEDGERNAME?._ || entry.LEDGERNAME || '')
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }

            return {
                date: date, // Keep as string, let controller parse it
                voucherNumber,
                voucherType,
                party,
                amount,
                narration,
                guid,
                masterId,
                voucherKey,
                ledgerEntries,
                costCentreAllocations,
                lastUpdated: new Date(),
                raw: voucher // Store raw data for additional processing
            };
        });
    }

    normalizeStockItems(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) return [];

        let items = collection.STOCKITEM ?? collection.StockItem ?? null;
        if (!items && Array.isArray(collection)) items = collection;
        if (!items) return [];
        if (!Array.isArray(items)) items = [items];

        return items.map((item) => {
            const name = this.safeString(item.NAME ?? item.STOCKITEMNAME ?? '');
            const aliasName = this.safeString(item.ALIASNAME ?? '');
            const description = this.safeString(item.DESCRIPTION ?? item.NARRATION ?? '');
            
            // Core quantity and value fields with improved parsing
            const closingValue = this.safeNumber(item.CLOSINGVALUE ?? item.CLOSINGBALANCEVALUE ?? item.CLOSINGBALANCE ?? 0);
            const closingQty = this.safeNumber(item.CLOSINGBALANCEQTY ?? item.CLOSINGQTY ?? item.CLOSINGBALANCE ?? 0);
            const openingValue = this.safeNumber(item.OPENINGVALUE ?? item.OPENINGBALANCE ?? 0);
            const openingQty = this.safeNumber(item.OPENINGBALANCEQTY ?? item.OPENINGQTY ?? 0);
            
            // Rate calculations (price per unit)
            const closingRate = this.safeNumber(item.CLOSINGRATE ?? 0);
            const openingRate = this.safeNumber(item.OPENINGRATE ?? 0);
            
            // Calculate rates if not provided
            let calculatedClosingRate = closingRate;
            if (calculatedClosingRate === 0 && closingQty > 0) {
                calculatedClosingRate = closingValue / closingQty;
            }
            
            let calculatedOpeningRate = openingRate;
            if (calculatedOpeningRate === 0 && openingQty > 0) {
                calculatedOpeningRate = openingValue / openingQty;
            }
            
            // Unit information
            const baseUnits = this.safeString(item.BASEUNITS ?? item.UNITS ?? '');
            const additionalUnits = this.safeString(item.ADDITIONALUNITS ?? '');
            
            // Categories and grouping
            const parent = this.safeString(item.PARENT ?? '');
            const category = this.safeString(item.CATEGORY ?? '');
            const stockGroup = parent || category;
            
            // Identifiers
            const guid = this.safeString(item.GUID ?? '');
            const masterId = this.safeString(item.MASTERID ?? '');
            const alterId = this.safeString(item.ALTERID ?? '');
            const stockItemCode = this.safeString(item.STOCKITEMCODE ?? '');
            
            // Tax and GST information
            const gstApplicable = this.safeString(item.GSTAPPLICABLE ?? 'No');
            const gstTypeOfSupply = this.safeString(item.GSTTYPEOFSUPPLY ?? '');
            const hsnCode = this.safeString(item.HSNCODE ?? item.HSNMASTERNAME ?? '');
            const taxClassification = this.safeString(item.TAXCLASSIFICATIONNAME ?? '');
            
            // Costing and valuation methods
            const costingMethod = this.safeString(item.COSTINGMETHOD ?? '');
            const valuationMethod = this.safeString(item.VALUATIONMETHOD ?? '');
            
            // Stock level controls
            const reorderLevel = this.safeNumber(item.REORDERLEVEL ?? 0);
            const minLevel = this.safeNumber(item.MINLEVEL ?? 0);
            const maxLevel = this.safeNumber(item.MAXLEVEL ?? 0);
            
            // Conversion factors
            const denominator = this.safeNumber(item.DENOMINATOR ?? 1);
            const conversion = this.safeNumber(item.CONVERSION ?? 1);
            
            // Boolean flags for stock item behavior
            const affectsStockValue = item.AFFECTSSTOCKVALUE === 'Yes';
            const forPurchase = item.FORPURCHASE === 'Yes';
            const forSales = item.FORSALES === 'Yes';
            const forProduction = item.FORPRODUCTION === 'Yes';
            const isMaintainBatch = item.ISMAINTAINBATCH === 'Yes';
            const isPerishableOn = item.ISPERISHABLEON === 'Yes';
            const hasMfgDate = item.HASMFGDATE === 'Yes';
            const allowUseOfExpiredItems = item.ALLOWUSEOFEXPIREDITEMS === 'Yes';
            const ignoreNegativeStock = item.IGNORENEGATIVESTOCK === 'Yes';
            const ignoreBatches = item.IGNOREBATCHES === 'Yes';
            const ignoreGodowns = item.IGNOREGODOWNS === 'Yes';
            
            // Extract detailed lists and allocations
            let batchAllocations = [];
            const batchAllocationsList = item['BATCHALLOCATIONS.LIST'] ?? null;
            if (batchAllocationsList) {
                const batches = Array.isArray(batchAllocationsList) ? batchAllocationsList : [batchAllocationsList];
                batchAllocations = batches.map(batch => ({
                    batchName: this.safeString(batch.BATCHNAME ?? batch.NAME ?? ''),
                    godownName: this.safeString(batch.GODOWNNAME ?? ''),
                    quantity: this.safeNumber(batch.BILLEDQTY ?? batch.ACTUALQTY ?? batch.QUANTITY ?? 0),
                    rate: this.safeNumber(batch.RATE ?? 0),
                    amount: this.safeNumber(batch.AMOUNT ?? 0),
                    manufacturingDate: batch.MFGDATE ? new Date(batch.MFGDATE) : null,
                    expiryDate: batch.EXPIRYDATE ? new Date(batch.EXPIRYDATE) : null
                }));
            }
            
            let godownBalance = [];
            const godownBalanceList = item['GODOWNBALANCE.LIST'] ?? null;
            if (godownBalanceList) {
                const godowns = Array.isArray(godownBalanceList) ? godownBalanceList : [godownBalanceList];
                godownBalance = godowns.map(godown => ({
                    godownName: this.safeString(godown.GODOWNNAME ?? godown.NAME ?? ''),
                    closingBalance: this.safeNumber(godown.CLOSINGBALANCE ?? 0),
                    openingBalance: this.safeNumber(godown.OPENINGBALANCE ?? 0),
                    closingValue: this.safeNumber(godown.CLOSINGVALUE ?? 0),
                    openingValue: this.safeNumber(godown.OPENINGVALUE ?? 0)
                }));
            }
            
            // Extract standard cost and price lists
            let standardCostList = [];
            const standardCosts = item['STANDARDCOSTLIST.LIST'] ?? null;
            if (standardCosts) {
                const costs = Array.isArray(standardCosts) ? standardCosts : [standardCosts];
                standardCostList = costs.map(cost => ({
                    date: cost.DATE ? new Date(cost.DATE) : null,
                    rate: this.safeNumber(cost.RATE ?? 0)
                }));
            }
            
            let standardPriceList = [];
            const standardPrices = item['STANDARDPRICELIST.LIST'] ?? null;
            if (standardPrices) {
                const prices = Array.isArray(standardPrices) ? standardPrices : [standardPrices];
                standardPriceList = prices.map(price => ({
                    date: price.DATE ? new Date(price.DATE) : null,
                    rate: this.safeNumber(price.RATE ?? 0)
                }));
            }
            
            // Extract GST classification details
            let gstDetails = {};
            const gstClassification = item['GSTCLASSIFICATION.LIST'] ?? null;
            if (gstClassification) {
                const gstData = Array.isArray(gstClassification) ? gstClassification[0] : gstClassification;
                gstDetails = {
                    hsnDescription: this.safeString(gstData.HSNDESCRIPTION ?? ''),
                    taxabilityType: this.safeString(gstData.TAXABILITYTYPE ?? ''),
                    igstRate: this.safeNumber(gstData.IGSTRATE ?? 0),
                    cgstRate: this.safeNumber(gstData.CGSTRATE ?? 0),
                    sgstRate: this.safeNumber(gstData.SGSTRATE ?? 0),
                    cessRate: this.safeNumber(gstData.CESSRATE ?? 0),
                    cessOnQuantity: this.safeNumber(gstData.CESSONQUANTITY ?? 0)
                };
            }
            
            // Extract VAT details
            let vatDetails = {};
            const vatClassification = item['VATCLASSIFICATIONLIST.LIST'] ?? null;
            if (vatClassification) {
                const vatData = Array.isArray(vatClassification) ? vatClassification[0] : vatClassification;
                vatDetails = {
                    classificationName: this.safeString(vatData.CLASSIFICATIONNAME ?? ''),
                    taxType: this.safeString(vatData.TAXTYPE ?? ''),
                    taxRate: this.safeNumber(vatData.TAXRATE ?? 0)
                };
            }
            
            // Determine stock status
            let stockStatus = 'Unknown';
            if (closingQty > maxLevel && maxLevel > 0) {
                stockStatus = 'Overstock';
            } else if (closingQty > reorderLevel && reorderLevel > 0) {
                stockStatus = 'In Stock';
            } else if (closingQty > minLevel && minLevel > 0) {
                stockStatus = 'Low Stock';
            } else if (closingQty > 0) {
                stockStatus = 'Critical Stock';
            } else {
                stockStatus = 'Out of Stock';
            }
            
            return {
                name,
                aliasName,
                description,
                stockItemCode,
                
                // Quantities and Values
                closingValue,
                closingQty,
                openingValue,
                openingQty,
                
                // Rates (prices)
                closingRate: calculatedClosingRate,
                openingRate: calculatedOpeningRate,
                costPrice: calculatedClosingRate, // For backward compatibility
                sellingPrice: calculatedClosingRate, // For backward compatibility
                
                // Units
                baseUnits,
                additionalUnits,
                
                // Categories
                parent,
                category,
                stockGroup,
                
                // Identifiers
                guid,
                masterId,
                alterId,
                
                // Tax Information
                gstApplicable,
                gstTypeOfSupply,
                hsnCode,
                taxClassification,
                gstDetails,
                vatDetails,
                
                // Costing and Valuation
                costingMethod,
                valuationMethod,
                
                // Stock Level Controls
                reorderLevel,
                minimumLevel: minLevel,
                maximumLevel: maxLevel,
                
                // Conversion
                denominator,
                conversionFactor: conversion,
                
                // Boolean Flags
                affectsStockValue,
                forPurchase,
                forSales,
                forProduction,
                isMaintainBatch,
                isPerishableOn,
                hasMfgDate,
                allowUseOfExpiredItems,
                ignoreNegativeStock,
                ignoreBatches,
                ignoreGodowns,
                
                // Detailed Allocations
                batchAllocations,
                godownDetails: godownBalance,
                priceDetails: standardPriceList,
                batchWiseDetails: batchAllocations,
                
                // Stock Status
                stockStatus,
                
                // System Fields
                isActive: true,
                lastUpdated: new Date(),
                rawData: item // Store complete raw data for debugging and future enhancements
            };
        });
    }

    normalizeCompanyInfo(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) return [];

        let companies = collection.COMPANY ?? collection.Company ?? null;
        if (!companies && Array.isArray(collection)) {
            companies = collection;
        }
        if (!companies) return [];

        // If it's a single company, make it an array
        if (!Array.isArray(companies)) companies = [companies];

        return companies.map(company => {
            // Handle the case where company might be a nested structure or array
            let companyData = company;
            if (Array.isArray(company) && company.length > 0) {
                companyData = company[0];
            }
            
            // Extract company name - could be in different formats
            let name = '';
            if (typeof companyData === 'string') {
                name = companyData;
            } else if (companyData && typeof companyData === 'object') {
                name = this.safeString(companyData.NAME ?? companyData.COMPANYNAME ?? companyData._ ?? '');
            }

            const guid = this.safeString(companyData?.GUID ?? '');
            const mailingName = this.safeString(companyData?.MAILINGNAME ?? '');
            const currencySymbol = this.safeString(companyData?.CURRENCYSYMBOL ?? '₹');

            // Parse address
            let address = '';
            if (companyData && companyData['ADDRESS.LIST']) {
                const addressList = Array.isArray(companyData['ADDRESS.LIST']) 
                    ? companyData['ADDRESS.LIST'] 
                    : [companyData['ADDRESS.LIST']];
                address = addressList.map(addr => this.safeString(addr)).join(', ');
            }

            // Parse dates
            const financialYearFrom = companyData?.FINYEARFROM ? new Date(companyData.FINYEARFROM) : null;
            const financialYearTo = companyData?.FINYEARTO ? new Date(companyData.FINYEARTO) : null;
            const booksBeginningFrom = companyData?.BOOKSBEGININGFROM ? new Date(companyData.BOOKSBEGININGFROM) : null;

            return {
                name,
                guid,
                mailingName,
                address,
                currencySymbol,
                financialYearFrom,
                financialYearTo,
                booksBeginningFrom,
                isActive: true,
                lastSyncedAt: new Date()
            };
        });
    }

    normalizeGroups(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) return [];

        let groups = collection.GROUP ?? collection.Group ?? null;
        if (!groups && Array.isArray(collection)) groups = collection;
        if (!groups) return [];
        if (!Array.isArray(groups)) groups = [groups];

        return groups.map((group) => {
            return {
                name: this.safeString(group.NAME ?? ''),
                aliasName: this.safeString(group.ALIASNAME ?? ''),
                parent: this.safeString(group.PARENT ?? ''),
                primaryGroup: this.safeString(group.PRIMARYGROUP ?? ''),
                reservedName: this.safeString(group.RESERVEDNAME ?? ''),
                guid: this.safeString(group.GUID ?? ''),
                masterId: this.safeString(group.MASTERID ?? ''),
                alterId: this.safeString(group.ALTERID ?? ''),
                description: this.safeString(group.DESCRIPTION ?? ''),
                nature: this.safeString(group.NATURE ?? ''),
                category: this.safeString(group.CATEGORY ?? ''),
                subLedger: this.safeString(group.SUBLEDGER ?? ''),
                sortPosition: this.safeNumber(group.SORTPOSITION ?? 1000),
                deeperLevel: this.safeNumber(group.DEEPERLEVEL ?? 0),
                affectsStock: group.AFFECTSSTOCK === 'Yes',
                forPayroll: group.FORPAYROLL === 'Yes',
                isSubLedger: group.ISSUBLEDGER === 'Yes',
                isDeemedPositive: group.ISDEEMEDPOSITIVE === 'Yes',
                trackNegativeBalances: group.TRACKNEGATIVEBALANCES === 'Yes',
                behaveAsDuty: group.BEHAVEASDUTY === 'Yes',
                subGroups: this.safeNumber(group.SUBGROUPS ?? 0),
                groupsInGroup: this.safeNumber(group.GROUPSINGROUP ?? 0),
                openingBalance: this.safeNumber(group.OPENINGBALANCE ?? 0),
                closingBalance: this.safeNumber(group.CLOSINGBALANCE ?? 0),
                lastUpdated: new Date(),
                rawData: group
            };
        });
    }

    normalizeCostCenters(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) return [];

        let costCenters = collection.COSTCENTRE ?? collection.CostCentre ?? null;
        if (!costCenters && Array.isArray(collection)) costCenters = collection;
        if (!costCenters) return [];
        if (!Array.isArray(costCenters)) costCenters = [costCenters];

        return costCenters.map((center) => {
            return {
                name: this.safeString(center.NAME ?? ''),
                aliasName: this.safeString(center.ALIASNAME ?? ''),
                parent: this.safeString(center.PARENT ?? ''),
                category: this.safeString(center.CATEGORY ?? ''),
                guid: this.safeString(center.GUID ?? ''),
                masterId: this.safeString(center.MASTERID ?? ''),
                alterId: this.safeString(center.ALTERID ?? ''),
                reservedName: this.safeString(center.RESERVEDNAME ?? ''),
                sortPosition: this.safeNumber(center.SORTPOSITION ?? 1000),
                usedForAllocation: center.USEDFORALLOCATION === 'Yes',
                affectsStock: center.AFFECTSSTOCK === 'Yes',
                forPayroll: center.FORPAYROLL === 'Yes',
                forJobCosting: center.FORJOBCOSTING === 'Yes',
                openingBalance: this.safeNumber(center.OPENINGBALANCE ?? 0),
                closingBalance: this.safeNumber(center.CLOSINGBALANCE ?? 0),
                lastUpdated: new Date(),
                rawData: center
            };
        });
    }

    normalizeCurrencies(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) return [];

        let currencies = collection.CURRENCY ?? collection.Currency ?? null;
        if (!currencies && Array.isArray(collection)) currencies = collection;
        if (!currencies) return [];
        if (!Array.isArray(currencies)) currencies = [currencies];

        return currencies.map((currency) => {
            return {
                name: this.safeString(currency.NAME ?? ''),
                expandedName: this.safeString(currency.EXPANDEDNAME ?? ''),
                symbol: this.safeString(currency.SYMBOL ?? ''),
                aliasName: this.safeString(currency.ALIASNAME ?? ''),
                reservedName: this.safeString(currency.RESERVEDNAME ?? ''),
                guid: this.safeString(currency.GUID ?? ''),
                masterId: this.safeString(currency.MASTERID ?? ''),
                alterId: this.safeString(currency.ALTERID ?? ''),
                originalName: this.safeString(currency.ORIGINALNAME ?? ''),
                decimalPlaces: this.safeNumber(currency.DECIMALPLACES ?? 2),
                isBaseCurrency: currency.ISBASECURRENCY === 'Yes',
                exchangeRate: this.safeNumber(currency.EXCHANGERATE ?? 1),
                showAmountsInMillions: currency.SHOWAMOUNTSINMILLIONS === 'Yes',
                hasSymbol: currency.HASSYMBOL === 'Yes',
                putSymbolInfront: currency.PUTSYMBOLINFRONT === 'Yes',
                addSpaceBetweenAmountAndSymbol: currency.ADDSPACEBETWEEN === 'Yes',
                formalName: this.safeString(currency.FORMALNAME ?? ''),
                subUnit: this.safeString(currency.SUBUNIT ?? ''),
                hundredsName: this.safeString(currency.HUNDREDSNAME ?? ''),
                lastUpdated: new Date(),
                rawData: currency
            };
        });
    }

    // Test connection to Tally
    async testConnection() {
        try {
            const result = await this.fetchCompanyInfo();
            if (result) {
                return {
                    success: true,
                    message: 'Successfully connected to Tally',
                    data: result
                };
            } else {
                return {
                    success: false,
                    message: 'No data received from Tally',
                    data: null
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }
}

module.exports = TallyService;
