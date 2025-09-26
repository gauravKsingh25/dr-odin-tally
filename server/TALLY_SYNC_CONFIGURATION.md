# Tally Sync System - Complete Configuration Summary

## 🚀 Overview
The Tally sync system has been completely redesigned to run a **FULL SYNC daily at 12:00 AM (midnight)** while **EXCLUDING vouchers** as specifically requested. Vouchers must be synced manually.

## ⏰ Automatic Full Sync Schedule
- **When**: Every day at 12:00 AM (midnight)
- **Cron Pattern**: `0 0 * * *`
- **Timezone**: Asia/Kolkata
- **Auto-Start**: Yes (activated when server starts)

## 📊 What Gets Synced Automatically (Full Sync)
The nightly full sync includes ALL Tally master data:

### ✅ Included in Full Sync:
1. **Companies** → `tallycompanies` collection
2. **Groups** → `tallygroups` collection  
3. **Cost Centers** → `tallycostcenters` collection
4. **Currencies** → `tallycurrencies` collection
5. **Ledgers** → `tallyledgers` collection
6. **Stock Items** → `tallystockitems` collection

### ❌ Excluded from Full Sync:
- **Vouchers** → Must be synced manually using `/api/tally/sync/manual`

## 🗄️ Database Schema Verification

All models use consistent schema structure with:
- **GUID field** for unique identification
- **Timestamps** for creation/update tracking
- **Raw Data storage** for complete Tally data preservation
- **Last Updated tracking** for sync monitoring
- **Proper indexing** for performance
- **Company/Year tracking** for multi-company support

### Schema Summary:
| Model | Collection | Fields | Required | Indexes | Status |
|-------|------------|--------|----------|---------|--------|
| TallyCompany | tallycompanies | 46 | 1 | 6 | ✅ Valid |
| TallyGroup | tallygroups | 25 | 1 | 5 | ✅ Valid |
| TallyCostCenter | tallycostcenters | 23 | 1 | 5 | ✅ Valid |
| TallyCurrency | tallycurrencies | 27 | 1 | 5 | ✅ Valid |
| TallyLedger | tallyledgers | 43 | 1 | 7 | ✅ Valid |
| TallyStockItem | tallystockitems | 62 | 1 | 9 | ✅ Valid |
| TallyVoucher | tallyvouchers | 56 | 3 | 9 | ✅ Valid |

## 🔄 Sync Types Available

### 1. **Full Sync** (Automatic Daily + Manual)
- **Automatic**: Runs daily at 12:00 AM
- **Manual**: `POST /api/tally/sync/full`
- **Includes**: Companies, Groups, Cost Centers, Currencies, Ledgers, Stock Items
- **Excludes**: Vouchers (as requested)
- **Duration**: Comprehensive sync of all master data

### 2. **Partial Sync** (Manual Only)
- **Trigger**: `POST /api/tally/sync/manual`
- **Includes**: Recent vouchers (last 7 days) + updated master data
- **Use Case**: Quick sync of recent changes including vouchers

## 🎯 Data Flow & Processing

### Full Sync Process (Daily at 12:00 AM):
```
1. 📊 Sync Company Information
   ↓ normalizeCompanyInfo() → tallycompanies
   
2. 📁 Sync Groups  
   ↓ normalizeGroups() → tallygroups
   
3. 💼 Sync Cost Centers
   ↓ normalizeCostCenters() → tallycostcenters
   
4. 💱 Sync Currencies
   ↓ normalizeCurrencies() → tallycurrencies
   
5. 📚 Sync Ledgers
   ↓ normalizeLedgers() → tallyledgers
   
6. 📦 Sync Stock Items
   ↓ normalizeStockItems() → tallystockitems
   
7. ℹ️  Skip Vouchers (Manual sync required)
```

### Data Normalization:
Each sync step includes:
- **Fetch** raw XML data from Tally
- **Parse** XML to JavaScript objects
- **Normalize** data using dedicated methods
- **Validate** and clean data
- **Upsert** to MongoDB using GUID or name+company
- **Update** timestamps and sync status

## 📡 API Endpoints

### Monitoring & Status:
- `GET /api/tally/sync/status` - Current sync status and history
- `GET /api/tally/sync/history` - Detailed sync history
- `GET /api/tally/dashboard/sync` - Comprehensive sync dashboard

### Manual Sync Triggers:
- `POST /api/tally/sync/full` - Manual full sync (excludes vouchers)
- `POST /api/tally/sync/manual` - Manual partial sync (includes vouchers)

### Scheduler Control:
- `POST /api/tally/scheduler/start` - Start the cron scheduler
- `POST /api/tally/scheduler/stop` - Stop the cron scheduler

### Backward Compatibility:
All endpoints also available without `/api` prefix (e.g., `/tally/sync/status`)

## 🔧 Configuration Details

### Cron Job Configuration:
```javascript
// Schedule: Daily at 12:00 AM (midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Scheduled FULL sync triggered');
    await this.syncFullData(); // Excludes vouchers
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});
```

### Environment Variables Required:
```
TALLY_URL=http://localhost:9000  # Tally server URL
```

### Database Connections:
- Uses existing MongoDB connection
- All collections use consistent naming: `tally{entityname}`
- Automatic indexing for performance

## 🎮 How to Use

### 1. **Start the Server**
```bash
cd server
npm start
```
The cron job automatically activates and will run daily at 12:00 AM.

### 2. **Monitor Sync Status**
```bash
GET /api/tally/sync/status
```
Returns current sync status, last sync results, and schedule info.

### 3. **Trigger Manual Full Sync** (if needed immediately)
```bash
POST /api/tally/sync/full
```
Runs the same sync as the nightly job (excludes vouchers).

### 4. **Sync Vouchers Manually** (when needed)
```bash
POST /api/tally/sync/manual
```
Includes recent vouchers in the sync.

### 5. **View Dashboard**
```bash
GET /api/tally/dashboard/sync
```
Shows comprehensive system status and data counts.

## 📈 System Benefits

### ✅ What This Achieves:
1. **Automated Daily Sync** - No manual intervention needed for master data
2. **Voucher Control** - Manual voucher sync as requested
3. **Consistent Schema** - All data stored with proper structure
4. **Performance** - Optimized queries and indexing
5. **Monitoring** - Full visibility into sync status
6. **Flexibility** - Manual sync options when needed
7. **Reliability** - Error handling and retry logic
8. **Scalability** - Handles large data volumes efficiently

### 🎯 Key Features:
- **Zero Downtime**: Sync runs in background
- **Data Integrity**: GUID-based deduplication
- **Historical Tracking**: Sync history and timestamps
- **Error Recovery**: Comprehensive error handling
- **Manual Override**: Can trigger syncs anytime
- **Status Monitoring**: Real-time sync status

## 🔍 Verification Results

✅ **All 7 database models properly configured**  
✅ **Full sync excludes vouchers as requested**  
✅ **Cron job scheduled for daily 12:00 AM execution**  
✅ **Manual sync endpoints available**  
✅ **Proper data mapping and normalization**  
✅ **Comprehensive API endpoints for monitoring**  
✅ **Error handling and logging implemented**  

## 🚀 System Status: **READY FOR PRODUCTION**

The system is fully configured and verified. It will:
- ✅ Run full sync automatically every night at 12:00 AM
- ✅ Exclude vouchers from automatic sync
- ✅ Store all data in correct MongoDB collections
- ✅ Use consistent schemas across all models
- ✅ Provide manual sync options for vouchers
- ✅ Offer comprehensive monitoring and status APIs