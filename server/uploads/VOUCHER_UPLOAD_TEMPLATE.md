# Voucher Excel Upload Template

Create an Excel file with the following columns:

## Required Columns
- `date` - Date in DD/MM/YYYY format (e.g., 15/03/2024)
- `voucherNumber` - Unique voucher number (e.g., VCH001, SAL-0012)
- `voucherType` - Type of voucher (Sales, Purchase, Receipt, Payment, Journal, etc.)
- `amount` - Voucher amount as a number (e.g., 1500.50)

## Optional Columns
- `party` - Party name (customer/vendor)
- `narration` - Description or narration
- `reference` - Reference number
- `voucherTypeName` - Full voucher type name
- `partyledgername` - Party ledger name

## Example Excel Structure

| date       | voucherNumber | voucherType | amount    | party          | narration         | reference |
|------------|---------------|-------------|-----------|----------------|-------------------|-----------|
| 15/03/2024 | SAL001        | Sales       | 25000.00  | ABC Company    | Product Sale      | REF001    |
| 16/03/2024 | PUR001        | Purchase    | 15000.00  | XYZ Supplier   | Raw Material      | REF002    |
| 17/03/2024 | REC001        | Receipt     | 20000.00  | ABC Company    | Payment Received  | REF003    |
| 18/03/2024 | PAY001        | Payment     | 12000.00  | XYZ Supplier   | Payment Made      | REF004    |

## Notes
- Column names are case-insensitive
- Duplicate vouchers (same number, type, and date) will be automatically rejected
- Invalid dates or missing required fields will be flagged as errors
- Excel date formats and serial numbers are automatically handled
- Only valid vouchers will be uploaded to the database
- The uploaded Excel file is processed and the data is converted to JSON before storage