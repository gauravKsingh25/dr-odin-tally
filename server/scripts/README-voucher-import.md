# Voucher Import Script - Documentation

## Overview
This script efficiently imports voucher data from `converted/vouchers.json` into the MongoDB TallyVoucher collection. It handles mapping between the JSON structure and the TallyVoucher schema, supports party name fields, and processes GST details and ledger entries.

## Features

✅ **High Performance**: Processes vouchers in batches (default: 1000 records per batch)
✅ **Schema Mapping**: Automatically maps JSON fields to TallyVoucher schema
✅ **Party Name Support**: Maps to both `party` and `partyledgername` fields
✅ **GST Details**: Extracts CGST, SGST, IGST, and CESS amounts
✅ **Ledger Entries**: Creates proper ledger entries from voucher details
✅ **Duplicate Prevention**: Prevents duplicate voucher imports
✅ **Error Handling**: Comprehensive error handling and reporting
✅ **Progress Tracking**: Real-time progress updates during import
✅ **Data Validation**: Validates imported data count

## File Structure

```
server/scripts/
├── import-vouchers-from-json.js     # Main import script
├── run-voucher-import.bat           # Windows batch runner
├── run-voucher-import.ps1           # PowerShell runner
├── converted/
│   └── vouchers.json                # Source voucher data
└── README-voucher-import.md         # This documentation
```

## Prerequisites

1. **Node.js**: Ensure Node.js is installed and accessible via PATH
2. **Environment Variables**: `.env` file must contain `MONGO_URI`
3. **Vouchers Data**: `vouchers.json` must be present in `converted/` folder
4. **Database Access**: MongoDB connection must be available

## Usage Options

### Option 1: Quick Run (Recommended)
```bash
# Windows Command Prompt
run-voucher-import.bat

# PowerShell
.\run-voucher-import.ps1
```

### Option 2: Direct Node.js Execution
```bash
# Basic usage (uses default settings)
node import-vouchers-from-json.js

# Custom file path
node import-vouchers-from-json.js --file=custom/path/vouchers.json

# Custom batch size and validation
node import-vouchers-from-json.js --batch-size=500 --validate

# Show help
node import-vouchers-from-json.js --help
```

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--file=<path>` | Path to vouchers.json file | `./converted/vouchers.json` |
| `--batch-size=<size>` | Number of records per batch | `1000` |
| `--validate` | Run database validation after import | `false` |
| `--help` | Show usage information | - |

## Data Mapping

### JSON Structure → TallyVoucher Schema

| JSON Field | Schema Field | Type | Notes |
|------------|--------------|------|-------|
| `Voucher_Number` | `voucherNumber` | String | Primary identifier |
| `Date_iso` | `date`, `voucherDate` | Date | Parsed from ISO string |
| `Party` | `party`, `partyledgername` | String | Party name mapping |
| `Vch_Type` | `voucherType` | String | Voucher type (Sales, etc.) |
| `Debit_Amount` | `amount` | Number | Primary amount |
| `Credit_Amount` | `amount` | Number | Used if Debit_Amount is null |
| `Details[]` | `ledgerEntries[]` | Array | Mapped to ledger entries |
| `Details[]` | `gstDetails` | Object | Extracted GST information |

### GST Details Extraction

The script automatically extracts GST information from the `Details` array:

- **CGST**: Accounts containing "CGST"
- **SGST**: Accounts containing "SGST"  
- **IGST**: Accounts containing "IGST"
- **CESS**: Accounts containing "CESS"

### Ledger Entries Mapping

Each item in the `Details` array becomes a ledger entry:

```javascript
{
    ledgerName: detail.Account || detail.Staff,
    amount: detail.Amount,
    isDebit: detail.Type === 'Dr' || amount > 0,
    staffInfo: { /* if staff details exist */ }
}
```

## Performance Characteristics

- **Batch Processing**: 1000 records per batch (configurable)
- **Memory Efficient**: Streams data without loading entire dataset
- **Duplicate Detection**: In-memory tracking of processed vouchers
- **Error Resilience**: Continues processing on individual record failures

## Output Information

### Progress Updates
```
📦 Processing batch 1/51 (1000 records)
📈 Progress: 1000/51035 (2.0%)
✅ Successfully inserted 998 vouchers
⚠️  Inserted 995 vouchers, 3 duplicates skipped
```

### Final Statistics
```
================================================
📈 IMPORT STATISTICS
================================================
📊 Total Records:        51,035
✅ Successfully Imported: 50,234
⏭️  Skipped:              245
🔄 Duplicates:           456
❌ Errors:               100
⏱️  Duration:             127s
🚀 Rate:                 402 records/sec
📈 Success Rate:         98.43%
================================================
```

## Error Handling

### Common Issues and Solutions

1. **Connection Error**
   ```
   ❌ MongoDB connection error: connect ECONNREFUSED
   ```
   **Solution**: Check `MONGO_URI` in `.env` file and database availability

2. **File Not Found**
   ```
   ❌ Error loading JSON file: ENOENT: no such file
   ```
   **Solution**: Ensure `vouchers.json` exists in `converted/` folder

3. **JSON Parse Error**
   ```
   ❌ Error loading JSON file: Unexpected token
   ```
   **Solution**: Validate JSON file format and fix syntax errors

4. **Duplicate Key Error**
   ```
   ⚠️  Inserted 995 vouchers, 3 duplicates skipped
   ```
   **Solution**: This is normal - duplicates are automatically handled

## Database Schema Considerations

The script creates documents with the following key fields:

```javascript
{
    date: Date,                 // Parsed from Date_iso
    voucherNumber: String,      // From Voucher_Number
    voucherType: String,        // From Vch_Type
    party: String,              // From Party
    partyledgername: String,    // Also from Party (for compatibility)
    amount: Number,             // From Debit_Amount or Credit_Amount
    ledgerEntries: [{           // From Details array
        ledgerName: String,
        amount: Number,
        isDebit: Boolean
    }],
    gstDetails: {               // Extracted from Details
        cgstAmount: Number,
        sgstAmount: Number,
        igstAmount: Number,
        totalTaxAmount: Number
    },
    rawData: Object,            // Original JSON data
    lastUpdated: Date           // Import timestamp
}
```

## Verification

After import, verify the data:

1. **Database Count**: Check total documents in TallyVoucher collection
2. **Sample Records**: Review a few imported records for accuracy
3. **GST Totals**: Verify GST amounts are correctly calculated
4. **Party Names**: Ensure party names are properly mapped

```javascript
// MongoDB verification queries
db.tallyVouchers.countDocuments()
db.tallyVouchers.findOne({}, { rawData: 0 })
db.tallyVouchers.aggregate([
    { $group: { _id: null, totalGST: { $sum: "$gstDetails.totalTaxAmount" } } }
])
```

## Troubleshooting

### Performance Issues
- Reduce batch size using `--batch-size=500`
- Ensure adequate system memory (>2GB recommended)
- Check database connection stability

### Data Quality Issues
- Review skipped records in output logs
- Check for malformed dates or amounts
- Validate party name consistency

### Memory Issues
- Use smaller batch sizes (`--batch-size=100`)
- Close other applications during import
- Monitor system resources

## Support

For issues or questions:
1. Check the output logs for specific error messages
2. Verify environment setup (Node.js, MongoDB, .env)
3. Review the source `vouchers.json` file format
4. Check database permissions and connectivity

## Version History

- **v1.0**: Initial implementation with basic mapping
- **v1.1**: Added party name support and GST extraction
- **v1.2**: Enhanced error handling and performance optimization
- **v1.3**: Added validation and comprehensive reporting