# Manual Voucher CRUD Feature

## Overview
This feature allows users to manually create, read, update, and delete vouchers in the **same TallyVoucher collection** used for Tally-synced vouchers. Manual vouchers are tagged with metadata to distinguish them while remaining part of the unified collection.

## Architecture

### Single Collection Approach
- **Collection**: `TallyVoucher` (unified for all vouchers)
- **Manual Vouchers**: Tagged with `manualEntry: true` and `uploadSource: 'MANUAL'`
- **Tally Vouchers**: Tagged with `uploadSource: 'TALLY_SYNC'` or other sources
- **No Separation**: All vouchers coexist in the same collection

### Two-Section UI
The Manual Voucher Upload page displays:
1. **Recent Manual Vouchers** - Shows only manually created vouchers (`manualEntry: true`)
2. **All Existing Vouchers Collection** - Shows all vouchers from the collection (manual + synced)

## Features

### Backend API Endpoints

All endpoints require authentication token (`verifyToken` middleware).

#### 1. Create Manual Voucher
- **Endpoint**: `POST /api/tally/voucher/manual`
- **Description**: Create a new voucher manually
- **Required Fields**:
  - `date` (Date)
  - `voucherNumber` (String, unique per company)
  - `voucherType` (String)
  - `amount` (Number, > 0)

#### 2. Get Manual Voucher
- **Endpoint**: `GET /api/tally/voucher/manual/:id`
- **Description**: Retrieve a single voucher by ID

#### 3. Update Manual Voucher
- **Endpoint**: `PUT /api/tally/voucher/manual/:id`
- **Description**: Update an existing voucher
- **Note**: Validates voucher number uniqueness if changed

#### 4. Delete Manual Voucher
- **Endpoint**: `DELETE /api/tally/voucher/manual/:id`
- **Description**: Delete a voucher by ID

#### 5. List Manual Vouchers
- **Endpoint**: `GET /api/tally/voucher/manual/list`
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `voucherType` (filter by type)
  - `party` (filter by party name)
  - `startDate` (filter by date range)
  - `endDate` (filter by date range)
  - `search` (search in voucher number, party, narration, reference)

## Frontend Component

### Location
- **Path**: `/upload/manual`
- **Component**: `ManualVoucherUpload`
- **Menu**: Upload → Manual Voucher

### Features

1. **Voucher List View**
   - Paginated table with 20 vouchers per page
   - Filters: Search, Voucher Type, Party, Date Range
   - Actions: View, Edit, Delete

2. **Create/Edit Form**
   - Organized in collapsible accordion sections:
     - Basic Information (required fields)
     - Party Information
     - Additional Dates
     - GST Details
     - Bank Details
     - Inventory Entries (dynamic array)
     - Ledger Entries (dynamic array)
     - Technical Details (GUID, Master ID, etc.)

3. **Form Validation**
   - Real-time validation for required fields
   - Duplicate voucher number detection
   - Amount validation (must be > 0)
   - Date format validation

4. **User Experience**
   - Loading states during API calls
   - Success/Error notifications
   - Confirmation dialog for delete
   - View-only mode for viewing vouchers
   - Badge indicators for array counts

## Supported Voucher Types
- Sales
- Purchase
- Receipt
- Payment
- Journal
- Contra
- Debit Note
- Credit Note
- Delivery Note
- Stock Journal
- Physical Stock
- Receipt Note
- Rejection Out
- Sales Order
- Purchase Order

## Schema Fields

### Basic Fields
- `date` (required)
- `voucherNumber` (required, unique)
- `voucherType` (required)
- `voucherTypeName`
- `party`
- `partyledgername`
- `amount` (required, > 0)
- `narration`
- `reference`
- `isDeemedPositive`

### Nested Objects

#### GST Details
- `cgstAmount`, `sgstAmount`, `igstAmount`, `cessAmount`
- `placeOfSupply`
- `partyGSTIN`
- `gstTaxType`
- `isReverseChargeApplicable`

#### Bank Details
- `transactionType` (Cheque, DD, NEFT, RTGS, IMPS, UPI, Cash)
- `instrumentDate`
- `instrumentNumber`
- `bankName`
- `bankAccountNumber`
- `ifscCode`
- `payeeName`

#### Inventory Entries (Array)
- `stockItemName`
- `quantity`
- `unit`
- `rate`
- `amount`

#### Ledger Entries (Array)
- `ledgerName`
- `amount`
- `isDebit` (Boolean)

#### E-Invoice Details
- `eInvoiceNumber`
- `eInvoiceDate`
- `eInvoiceStatus`
- `eInvoiceQRCode`
- `irn`

## Technical Details

### Metadata
All manually created vouchers are tagged with:
- `uploadSource: 'MANUAL'`
- `uploadBatch: 'MANUAL_{timestamp}'`
- `manualEntry: true`
- `createdAt`, `lastUpdated` timestamps

### Error Handling
- **409 Conflict**: Duplicate voucher number
- **404 Not Found**: Voucher doesn't exist
- **400 Bad Request**: Validation errors
- **500 Internal Server Error**: Server errors

### Performance
- Pagination prevents loading large datasets
- Indexed queries on `manualEntry` flag
- Efficient date range filtering

## Usage Example

### Creating a Simple Sales Voucher

```javascript
POST /api/tally/voucher/manual
{
  "date": "2024-01-15",
  "voucherNumber": "SALE/2024/001",
  "voucherType": "Sales",
  "party": "ABC Corporation",
  "amount": 10000,
  "narration": "Sale of goods",
  "reference": "INV-001",
  "gstDetails": {
    "cgstAmount": 900,
    "sgstAmount": 900,
    "placeOfSupply": "Maharashtra",
    "partyGSTIN": "27XXXXX1234X1Z5"
  }
}
```

### Response
```javascript
{
  "status": 201,
  "message": "Voucher created successfully",
  "data": {
    "voucher": {
      "_id": "...",
      "voucherNumber": "SALE/2024/001",
      "date": "2024-01-15T00:00:00.000Z",
      "uploadSource": "MANUAL",
      ...
    }
  }
}
```

## Best Practices

1. **Voucher Numbers**: Use a consistent naming convention (e.g., SALE/YYYY/NNN)
2. **Date Management**: Ensure dates are in YYYY-MM-DD format
3. **GST Compliance**: Fill GST details for applicable vouchers
4. **Bank Details**: Complete for payment/receipt vouchers
5. **Inventory**: Add inventory entries for stock-related vouchers
6. **Ledger Entries**: Ensure debit/credit balance

## Future Enhancements

Potential improvements:
- Bulk import from Excel/CSV
- Templates for common voucher types
- Auto-numbering sequence
- Approval workflow
- Audit trail
- Duplicate voucher warning before creation
- Copy/Clone existing voucher
- Print voucher functionality

## Files Modified/Created

### Backend
- `server/controllers/tally.controller.js` - Added 5 new CRUD methods
- `server/routes/tally.routes.js` - Added 5 new routes

### Frontend
- `client/src/pages/uploads/ManualVoucherUpload/index.js` - Main component (700+ lines)
- `client/src/pages/uploads/ManualVoucherUpload/style.css` - Styles
- `client/src/routes/index.js` - Route configuration
- `client/src/constants/menu.js` - Menu item

## Support

For issues or questions:
1. Check the voucher schema in `server/models/tallyVoucher.model.js`
2. Review API responses for detailed error messages
3. Check browser console for frontend errors
4. Verify authentication token is valid

## Version
- **Initial Release**: v1.0.0
- **Date**: 2024
- **Author**: System Development Team
