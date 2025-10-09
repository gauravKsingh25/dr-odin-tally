# Enhanced Tally Sync - Setup and Usage Guide

## Overview
This enhanced Tally sync system provides comprehensive data extraction from Tally including:
- Complete ledger information with bank details, contact info, GST details
- Enhanced balance extraction with multiple field fallbacks
- Related vouchers/invoices linked to ledgers
- Comprehensive address and tax information
- Bill-wise details and credit information

## Prerequisites

### 1. Tally Setup
- Ensure Tally is running on `http://192.168.0.191:9000`
- Enable Tally Gateway (Gateway of Tally)
- Configure Tally to accept XML requests

### 2. Environment Setup
Make sure your `.env` file contains:
```env
TALLY_URL=http://192.168.0.191:9000
MONGODB_URI=your_mongodb_connection_string
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Test Tally Connection
```bash
node scripts/testEnhancedSync.js
```

This will test:
- Tally connectivity
- Enhanced ledger data fetching
- Enhanced voucher data fetching
- Data normalization quality

### 3. Run Enhanced Ledger Sync (Ledgers Only)
```bash
node scripts/enhancedTallySync.js
```

This will:
- Fetch ALL ledger data with comprehensive details
- Extract bank details, contact info, GST information
- Process opening/closing balances with enhanced extraction
- Build relationships with existing vouchers
- Store enhanced ledger data in MongoDB

**Note:** Vouchers are NOT synced automatically - use manual sync when needed.

### 4. Manual Voucher Sync (When Needed)
```bash
# Sync last 30 days
node scripts/manualVoucherSync.js

# Sync specific date range (YYYYMMDD format)
node scripts/manualVoucherSync.js 20241001 20241031

# Sync last 7 days
node scripts/manualVoucherSync.js null null 7
```

## API Endpoints

### 1. Enhanced Sync
```http
POST /api/tally/sync/enhanced
Authorization: Bearer <token>
```

### 2. Enhanced Ledgers with Filters
```http
GET /api/tally/ledgers/enhanced?page=1&limit=20&search=party_name&hasBank=true&hasContact=true&hasGST=true
Authorization: Bearer <token>
```

Parameters:
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20)
- `search`: Search in name, email, phone, GSTIN
- `group`: Filter by parent group
- `balance`: 'positive', 'negative', 'zero'
- `hasBank`: 'true' to filter ledgers with bank details
- `hasContact`: 'true' to filter ledgers with contact info
- `hasGST`: 'true' to filter ledgers with GST details
- `fromDate`: Filter by last updated date
- `toDate`: Filter by last updated date

### 3. Comprehensive Ledger Data
```http
GET /api/tally/ledgers/{ledgerId}/comprehensive
Authorization: Bearer <token>
```

Returns complete ledger information plus related vouchers/invoices.

### 4. Sync Quality Test
```http
GET /api/tally/sync/quality-test
Authorization: Bearer <token>
```

## Enhanced Data Structure

### Ledger Schema Enhancement
```javascript
{
  // Basic Information
  name: String,
  aliasName: String,
  reservedName: String,
  parent: String,
  guid: String,
  masterId: String,
  alterId: String,
  description: String,
  
  // Financial Information (Enhanced Balance Extraction)
  openingBalance: Number,
  closingBalance: Number,
  creditLimit: Number,
  creditPeriod: Number,
  interestRate: Number,
  isBillWiseOn: Boolean,
  
  // Contact Information (Comprehensive)
  contact: {
    contactPerson: String,
    email: String,
    emailCC: String,
    phone: String,
    mobile: String,
    fax: String,
    website: String
  },
  
  // Bank Details (Complete)
  bankDetails: {
    bankName: String,
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    swiftCode: String,
    branchName: String,
    accountType: String
  },
  
  // Address Information
  addressList: [String],
  city: String,
  state: String,
  country: String,
  pincode: String,
  
  // GST & Tax Information
  gstDetails: {
    registrationType: String,
    gstin: String,
    placeOfSupply: String
  },
  taxInfo: {
    incomeTaxNumber: String,
    vatTinNumber: String,
    salesTaxNumber: String
  },
  
  // Bill Wise Details
  billWiseDetails: [{
    billName: String,
    billDate: String,
    billAmount: Number,
    billCredit: Boolean,
    billType: String
  }],
  
  // Related Vouchers Summary
  voucherSummary: {
    totalVouchers: Number,
    totalAmount: Number,
    latestVoucher: Object,
    voucherTypes: [String]
  },
  
  // Flags
  isGroup: Boolean,
  isCostCentresOn: Boolean,
  isInterestOn: Boolean,
  isGSTApplicable: Boolean,
  // ... other flags
  
  // Metadata
  lastModified: String,
  created: String,
  lastUpdated: Date,
  hasRelatedVouchers: Boolean,
  rawData: Object // For debugging
}
```

### Voucher Schema Enhancement
```javascript
{
  // Basic Information
  date: String,
  voucherNumber: String,
  voucherType: String,
  reference: String,
  referenceDate: String,
  narration: String,
  guid: String,
  masterId: String,
  alterId: String,
  
  // Party Information
  party: String,
  partyLedgerName: String,
  partyGSTIN: String,
  
  // Amount Information
  amount: Number,
  totalAmount: Number,
  basicAmount: Number,
  taxAmount: Number,
  
  // Invoice Information
  invoiceNumber: String,
  invoiceDate: String,
  isInvoice: Boolean,
  
  // GST Information
  isGSTOverridden: Boolean,
  gstRegistrationType: String,
  placeOfSupply: String,
  
  // Status
  isCancelled: Boolean,
  isOptional: Boolean,
  isPostDated: Boolean,
  
  // Metadata
  lastModified: String,
  created: String,
  lastUpdated: Date,
  rawData: Object
}
```

## Frontend Integration

The enhanced data is automatically displayed in the TallyLedgersDetail component with:

### Expanded Row Information
- **Basic Information**: Name, aliases, GUID, Master ID
- **Contact Information**: Phone, email, website with clickable links
- **Tax & GST Information**: GSTIN, registration type, tax numbers
- **Financial Information**: Balances with Dr/Cr indicators, credit limits, interest rates
- **Banking Details**: Complete bank account information with masked account numbers
- **Address Information**: Multiple addresses with city, state, country
- **Related Invoices**: Vouchers linked to the ledger with amounts and dates

### Enhanced Filtering
- Search across names, contact info, GSTIN
- Filter by bank details availability
- Filter by contact information availability
- Filter by GST registration status
- Date range filtering
- Balance type filtering

## Balance Extraction Enhancement

The system tries multiple field variations to ensure accurate balance capture:

### Opening Balance Fields
- `OPENINGBALANCE`
- `OPENING_BALANCE`
- `PREVOPENINGBALANCE`
- `OBVALUE`
- `openingBalance`
- `opening_balance`

### Closing Balance Fields
- `CLOSINGBALANCE`
- `CLOSING_BALANCE`
- `PREVCLOSINGBALANCE`
- `CBVALUE`
- `BALANCE`
- `CURRENTBALANCE`
- `closingBalance`
- `closing_balance`

## Monitoring and Debugging

### Sync Logs
The system provides detailed logging during sync:
- Connection status
- Data extraction progress
- Balance extraction details
- Relationship building progress
- Error reporting

### Quality Reports
Use the quality test endpoint to get:
- Total ledgers with complete data
- Percentage with bank details
- Percentage with contact information
- Percentage with GST details
- Related voucher statistics

## Troubleshooting

### Common Issues

1. **Tally Connection Failed**
   - Check if Tally is running
   - Verify TALLY_URL in .env
   - Ensure Gateway of Tally is enabled

2. **No Balance Data**
   - Check Tally data structure
   - Review balance extraction logs
   - Verify field mappings in normalization

3. **Missing Bank Details**
   - Ensure bank information is entered in Tally ledger master
   - Check field mappings in enhanced payload

4. **No Related Vouchers**
   - Verify party name matching logic
   - Check voucher date range
   - Ensure voucher sync completed

### Debug Mode
Set `DEBUG=1` environment variable for detailed logging:
```bash
DEBUG=1 node scripts/enhancedTallySync.js
```

## Performance Optimization

### Large Datasets
For large Tally datasets:
1. Use date range filtering for initial sync
2. Run incremental syncs regularly
3. Monitor memory usage during sync
4. Consider batch processing for very large datasets

### Sync Scheduling
Recommended sync schedule:
- Full enhanced sync: Daily at 2 AM
- Incremental voucher sync: Every 4 hours
- Quality checks: Weekly

## Support

For issues or questions:
1. Check the sync logs for detailed error messages
2. Run the test script to verify connectivity
3. Use the quality test endpoint to verify data completeness
4. Review the MongoDB collections for data structure verification