# Tally Integration Setup Guide

## Overview
This integration allows you to sync data from Tally ERP to your dashboard automatically every hour. The system fetches Ledgers, Vouchers, Stock Items, and Company information via XML from Tally's ODBC/HTTP interface.

## Prerequisites

1. **Tally ERP 9 with Gateway of Tally** running on port 9000
2. **ODBC Server** configured (typically runs on port 9000)
3. **Network access** from your server to the Tally machine

## Environment Configuration

Add these environment variables to your `.env` file in the server directory:

```env
# Tally Configuration
TALLY_URL=http://192.168.0.163:9000

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/dr_odin_tally

# Server Configuration
PORT=7010
JWT_SECRET=your-jwt-secret-here
```

## Tally Configuration

### Enable Gateway of Tally
1. Open Tally ERP 9
2. Go to Gateway of Tally > Configure
3. Enable: **Yes**
4. Port: **9000** (default)
5. Enable XML Data Exchange: **Yes**

### ODBC Configuration
1. In Tally, go to F11 (Features) > F1 (Accounting Features)
2. Enable **ODBC for SQL Connectivity**: Yes
3. Set Port to **9000**

## Features

### 🔄 Automatic Sync
- **Hourly sync** of all Tally data
- **Manual sync** option available in dashboard
- **Error handling** and logging

### 📊 Dashboard Features
- **Summary cards** showing total ledgers, vouchers, and stock items
- **Voucher type distribution** chart
- **Monthly voucher trends** chart
- **Recent vouchers** table
- **Top ledgers by balance** table
- **Low stock alerts**

### 🗃️ Data Synced
- ✅ Company Information
- ✅ Chart of Accounts (Ledgers)
- ✅ Vouchers (Sales, Purchase, Payment, Receipt, etc.)
- ✅ Stock Items with quantities and values

## API Endpoints

### Sync Data
```http
POST /api/tally/sync
Authorization: Bearer <token>
```

### Get Dashboard Data
```http
GET /api/tally/dashboard
Authorization: Bearer <token>
```

### Get Ledgers
```http
GET /api/tally/ledgers?page=1&limit=50&search=keyword
Authorization: Bearer <token>
```

### Get Vouchers
```http
GET /api/tally/vouchers?page=1&limit=50&voucherType=Sales&fromDate=2023-01-01&toDate=2023-12-31
Authorization: Bearer <token>
```

### Get Stock Items
```http
GET /api/tally/stockitems?page=1&limit=50&search=keyword
Authorization: Bearer <token>
```

## Navigation

Access the Tally Dashboard through:
- **URL**: `/tally-dashboard`
- **Menu**: "Tally Dashboard" in the sidebar

## Database Models

### TallyLedger
- Name, Parent, Opening/Closing Balance
- GUID and Master ID from Tally
- Language support

### TallyVoucher
- Date, Voucher Number, Type, Party
- Amount, Narration, Reference
- Ledger entries with debit/credit

### TallyStockItem
- Name, Parent Group, Quantities
- Opening/Closing values
- Base units

### TallyCompany
- Company details and metadata
- Financial year information
- Last sync timestamps

## Troubleshooting

### Connection Issues
1. **Check Tally Gateway**: Ensure Gateway of Tally is running
2. **Network connectivity**: Test with `http://192.168.0.163:9000` in browser
3. **Firewall**: Ensure port 9000 is accessible
4. **IP Address**: Verify the Tally machine's IP in `TALLY_URL`

### Sync Issues
1. **Check logs**: Look for error messages in server console
2. **Manual sync**: Use the "Sync Now" button in dashboard
3. **Data format**: Ensure Tally data is properly formatted
4. **Permissions**: Verify Tally user has required permissions

### Common Errors
- **Connection refused**: Tally Gateway not running
- **Timeout**: Network latency or Tally performance issues
- **Parse error**: Invalid XML response from Tally
- **Authentication**: JWT token issues

## Monitoring

### Sync Status
- View last sync time in dashboard
- Check sync statistics (companies, ledgers, vouchers, stock items)
- Monitor error logs

### Performance
- Sync duration is logged
- Large datasets may take longer
- Consider running sync during off-peak hours

## Development

### Adding New Data Types
1. Create model in `server/models/`
2. Add XML payload in `TallyService`
3. Implement normalization logic
4. Update controller endpoints
5. Add to cron job sync

### Customizing Sync Frequency
Edit `server/scripts/tally-cron.js`:
```javascript
// Run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    await this.performSync();
});
```

## Support

For issues:
1. Check server logs
2. Verify Tally configuration
3. Test manual sync
4. Review error messages in dashboard

The integration is designed to be robust and handle connection issues gracefully, automatically retrying on the next scheduled sync.
