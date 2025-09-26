# Tally Sync System Documentation

## Overview

The Tally Sync System is designed to automatically synchronize data between Tally ERP and the Dr. Odin application. The system runs a comprehensive **FULL SYNC** every day at **12:00 AM (midnight)** and excludes vouchers from the automatic sync as requested.

## System Architecture

### Key Components

1. **TallyCronJob** (`scripts/tally-cron.js`)
   - Main scheduler and sync orchestrator
   - Handles both full and partial sync operations
   - Manages cron scheduling and sync history

2. **TallyService** (`services/tallyService.js`)
   - Handles communication with Tally ERP
   - XML payload generation and parsing
   - Data normalization and transformation

3. **Tally Models** (`models/tally*.model.js`)
   - TallyCompany
   - TallyGroup
   - TallyCostCenter
   - TallyCurrency
   - TallyLedger
   - TallyStockItem
   - TallyVoucher

## Sync Schedule

### Full Sync (Automatic)
- **Schedule**: Daily at 12:00 AM (midnight)
- **Timezone**: Asia/Kolkata
- **Cron Pattern**: `0 0 * * *`

### What Gets Synced in Full Sync:
1. **Companies** - Complete company information
2. **Groups** - All ledger groups and hierarchies
3. **Cost Centers** - All cost center definitions
4. **Currencies** - Currency master data
5. **Ledgers** - All ledger accounts with full details
6. **Stock Items** - Complete stock item master data

### What's Excluded from Full Sync:
- **Vouchers** - Must be synced manually as requested

## API Endpoints

### Sync Status and Control

#### Get Sync Status
```http
GET /api/tally/sync/status
GET /tally/sync/status (legacy)
```

Returns:
```json
{
  "status": 200,
  "message": "Sync status retrieved",
  "data": {
    "isRunning": false,
    "fullSyncRunning": false,
    "lastSyncResult": {
      "syncType": "FULL_SYNC",
      "startTime": "2025-09-26T00:00:00.000Z",
      "endTime": "2025-09-26T00:15:30.000Z",
      "companies": 1,
      "groups": 45,
      "costCenters": 12,
      "currencies": 3,
      "ledgers": 234,
      "stockItems": 156,
      "vouchers": 0,
      "errors": [],
      "success": true
    },
    "syncHistory": [...],
    "cronActive": "scheduled",
    "nextScheduledSync": "12:00 AM daily"
  }
}
```

#### Trigger Manual Full Sync
```http
POST /api/tally/sync/full
POST /tally/sync/full (legacy)
```

Triggers a complete sync of all data except vouchers.

#### Trigger Manual Partial Sync
```http
POST /api/tally/sync/manual
```

Triggers a partial sync (companies, ledgers, stock items, recent vouchers).

#### Get Sync History
```http
GET /api/tally/sync/history
GET /tally/sync/history (legacy)
```

Returns the last 10 sync operations with detailed results.

### Dashboard

#### Sync Dashboard
```http
GET /api/tally/dashboard/sync
GET /tally/dashboard/sync (legacy)
```

Returns comprehensive dashboard data:
```json
{
  "status": 200,
  "data": {
    "syncStatus": {
      "health": "Excellent",
      "lastFullSync": "2025-09-26T00:00:00.000Z",
      "lastPartialSync": "2025-09-25T14:30:00.000Z",
      "nextScheduledSync": "Daily at 12:00 AM"
    },
    "dataCounts": {
      "companies": 1,
      "groups": 45,
      "costCenters": 12,
      "currencies": 3,
      "ledgers": 234,
      "stockItems": 156,
      "vouchers": 1250,
      "total": 1701
    },
    "lastUpdated": {
      "company": { "name": "Dr. Odin Ltd", "time": "2025-09-26T00:00:00.000Z" },
      "ledger": { "name": "Cash Account", "time": "2025-09-26T00:05:00.000Z" },
      // ... other entities
    },
    "systemInfo": {
      "timezone": "Asia/Kolkata",
      "serverTime": "2025-09-26T10:30:00.000Z",
      "fullSyncSchedule": "Daily at 12:00 AM",
      "voucherSyncMode": "Manual (excluded from full sync)"
    }
  }
}
```

### Scheduler Control

#### Stop Scheduler
```http
POST /api/tally/scheduler/stop
```

Stops the automatic full sync scheduler.

#### Start Scheduler
```http
POST /api/tally/scheduler/start
```

Starts the automatic full sync scheduler.

## Configuration

### Environment Variables

```env
# Tally ERP connection URL
TALLY_URL=http://localhost:9000

# Database connection (existing)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=dr_odin_tally
```

### Tally ERP Requirements

1. **Tally Prime** or **Tally ERP 9** with Tally Developer enabled
2. **Port Configuration**: Default port 9000
3. **Security Settings**: Allow external applications
4. **Network Access**: Server should have access to Tally machine

## Sync Process Details

### Full Sync Process (Daily at 12:00 AM)

1. **Company Information Sync**
   - Fetches complete company details
   - Updates company master data
   - Sets financial year information

2. **Groups Sync**
   - Syncs all ledger group hierarchies
   - Maintains parent-child relationships
   - Updates group classifications

3. **Cost Centers Sync**
   - Syncs all cost center definitions
   - Maintains cost center hierarchies
   - Updates allocation settings

4. **Currencies Sync**
   - Syncs all currency definitions
   - Updates exchange rates
   - Maintains currency symbols and formats

5. **Ledgers Sync**
   - Comprehensive ledger information
   - Opening and closing balances
   - GST and tax registration details
   - Contact and bank information
   - Address and communication details

6. **Stock Items Sync**
   - Complete stock item master data
   - Stock quantities and values
   - HSN codes and GST information
   - Unit conversions and pricing
   - Batch and godown details

### Partial Sync Process (Manual/On-Demand)

- Companies (basic information)
- Ledgers (essential fields)
- Stock Items (current stock levels)
- Recent Vouchers (last 7 days)

## Error Handling

### Sync Errors
- Individual entity sync errors don't stop the entire sync
- Errors are logged and included in sync results
- Failed entities are retried in subsequent syncs

### Connection Issues
- Automatic retry mechanism with exponential backoff
- Connection timeout handling
- Network failure recovery

### Data Validation
- XML parsing error handling
- Data type validation and conversion
- Duplicate prevention using GUID or name-based queries

## Monitoring and Logging

### Console Logs
```
🚀 Server listening on port 7010
🔄 Tally integration with FULL SYNC enabled
⏰ Full sync scheduler activated - runs daily at 12:00 AM
💡 Excluding vouchers from full sync (manual sync required for vouchers)
```

### Sync Execution Logs
```
⏰ Scheduled FULL sync triggered at: 2025-09-26T00:00:00.000Z
🚀 Starting FULL Tally data sync at: 2025-09-26T00:00:00.000Z
📊 Syncing Company Information...
✅ 1 companies synced successfully
📁 Syncing Groups...
✅ 45 groups synced successfully
💼 Syncing Cost Centers...
✅ 12 cost centers synced successfully
💱 Syncing Currencies...
✅ 3 currencies synced successfully
📚 Syncing Ledgers...
✅ 234 ledgers synced successfully
📦 Syncing Stock Items...
✅ 156 stock items synced successfully
ℹ️  Vouchers sync skipped in full sync - manual sync required
🎉 FULL Tally sync completed in 930s
```

## Sync Health Indicators

### Health Status Levels:
- **Excellent**: Full sync completed within last 24 hours
- **Good**: Partial sync completed within last 24 hours
- **Needs Attention**: Last sync was 1-7 days ago
- **Poor**: Last sync was more than 7 days ago
- **Unknown**: No sync data available

## Best Practices

### For Voucher Management
Since vouchers are excluded from automatic sync:
1. Use manual voucher sync endpoints when needed
2. Sync vouchers during low-activity periods
3. Consider date-range based voucher syncing for large datasets

### For Performance Optimization
1. Schedule intensive syncs during off-peak hours (12:00 AM is ideal)
2. Monitor sync duration and adjust if needed
3. Use partial sync for real-time data needs

### For Error Management
1. Monitor sync status regularly via dashboard
2. Check sync history for error patterns
3. Address connectivity issues promptly

## Troubleshooting

### Common Issues

1. **Tally Connection Failed**
   - Verify Tally is running and accessible
   - Check TALLY_URL configuration
   - Ensure port 9000 is not blocked

2. **Sync Taking Too Long**
   - Check network connectivity
   - Consider data volume and server resources
   - Review Tally ERP performance

3. **Incomplete Data Sync**
   - Check sync results for specific errors
   - Verify Tally data integrity
   - Review model schemas for compatibility

4. **Scheduler Not Running**
   - Check server logs for cron initialization
   - Verify timezone settings
   - Restart server if needed

### Support Commands

```bash
# Check server status
curl http://localhost:7010/api/tally/health

# Get sync status
curl -H "Authorization: Bearer <token>" http://localhost:7010/api/tally/sync/status

# Trigger manual full sync
curl -X POST -H "Authorization: Bearer <token>" http://localhost:7010/api/tally/sync/full

# View sync dashboard
curl -H "Authorization: Bearer <token>" http://localhost:7010/api/tally/dashboard/sync
```

## Security Considerations

- All sync endpoints require JWT token authentication
- Tally connection uses local network (secure by default)
- Sync history data is stored securely in database
- No sensitive data is exposed in logs

---

## Summary

The Tally Sync System provides:
- ✅ **Automated daily full sync** at 12:00 AM
- ✅ **Comprehensive data synchronization** (excluding vouchers)
- ✅ **Manual sync capabilities** for on-demand updates
- ✅ **Detailed monitoring and dashboards**
- ✅ **Robust error handling and recovery**
- ✅ **Flexible API endpoints** for integration

The system ensures your Dr. Odin application stays synchronized with Tally ERP data automatically while giving you full control over voucher synchronization as requested.