# Voucher Deletion Scripts

This folder contains scripts to safely find and delete specific voucher numbers from the database.

## Scripts Available

### 1. `deleteSpecificVouchers.js` 
**Purpose**: Delete the exact voucher numbers from your image (SAL001, PUR001, REC001, PAY001)

**Usage**:
```bash
cd server
node scripts/deleteSpecificVouchers.js
```

**What it does**:
- Automatically searches for vouchers: SAL001, PUR001, REC001, PAY001
- Displays detailed information about found vouchers
- Asks for confirmation before deletion
- Safely deletes the vouchers

### 2. `deleteVouchersByNumber.js` 
**Purpose**: Flexible script to delete any voucher numbers you specify

**Usage**:
```bash
# Method 1: Specify voucher numbers directly
cd server
node scripts/deleteVouchersByNumber.js SAL001 PUR001 REC001 PAY001

# Method 2: Interactive mode
cd server
node scripts/deleteVouchersByNumber.js --interactive

# Method 3: Get help
cd server
node scripts/deleteVouchersByNumber.js --help
```

## Features

✅ **Safe Operation**: Always shows voucher details before deletion
✅ **Confirmation Required**: Requires explicit confirmation to prevent accidents
✅ **Detailed Reporting**: Shows which vouchers were found/not found
✅ **Error Handling**: Graceful error handling and database connection management
✅ **Interactive Mode**: User-friendly interactive voucher selection
✅ **Multiple Formats**: Accepts command line arguments or interactive input

## Safety Features

⚠️ **Important Safety Notes**:
- All deletions are **IRREVERSIBLE**
- Scripts require explicit confirmation before deletion
- Database connection is safely managed
- Detailed logging of all operations
- Graceful handling of interruptions (Ctrl+C)

## Before Running

1. Make sure your database connection string is correct in the script
2. Ensure the server environment is properly set up
3. **BACKUP YOUR DATABASE** before running deletion scripts
4. Test with a few vouchers first if unsure

## Example Output

```
🔍 Searching for target vouchers...
Target voucher numbers: SAL001, PUR001, REC001, PAY001

📊 Found 4 voucher(s) in database:

┌─────────────┬──────────────┬─────────────┬──────────────┬─────────────┬─────────────────────┐
│ Voucher No. │ Date         │ Type        │ Party        │ Amount      │ Company ID          │
├─────────────┼──────────────┼─────────────┼──────────────┼─────────────┼─────────────────────┤
│ SAL001      │ 15/03/2024   │ Sales       │ ABC Company  │ ₹25,000     │ 507f1f77bcf86cd799... │
│ PUR001      │ 16/03/2024   │ Purchase    │ XYZ Supplier │ ₹15,000     │ 507f1f77bcf86cd799... │
│ REC001      │ 17/03/2024   │ Receipt     │ ABC Company  │ ₹20,000     │ 507f1f77bcf86cd799... │
│ PAY001      │ 18/03/2024   │ Payment     │ XYZ Supplier │ ₹12,000     │ 507f1f77bcf86cd799... │
└─────────────┴──────────────┴─────────────┴──────────────┴─────────────┴─────────────────────┘

⚠️  Are you sure you want to DELETE these vouchers? This action cannot be undone! (yes/no):
```

## Database Configuration

Make sure to update the database URI in the scripts:
```javascript
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/your_database_name';
```

Or set the `DB_URI` environment variable:
```bash
export DB_URI="mongodb://localhost:27017/your_actual_database_name"
node scripts/deleteSpecificVouchers.js
```