# Scripts Directory

## Essential Scripts (Production)

### `tally-cron.js`
- **Purpose**: Automated Tally data synchronization scheduler
- **Used by**: Main server (index.js), tally routes
- **Schedule**: Runs daily at 12:00 AM
- **Status**: Active

### `enhancedTallySync.js`
- **Purpose**: Enhanced Tally data synchronization with improved error handling
- **Used by**: Enhanced Tally Controller
- **Features**: Comprehensive sync, error recovery, detailed logging
- **Status**: Active

### `analyzeExistingStockData.js`
- **Purpose**: Production stock data analysis and quality assessment
- **Usage**: `node analyzeExistingStockData.js`
- **Features**: Data quality analysis, field recommendations, UI optimization insights
- **Status**: Active

### `testEnhancedStock.js`
- **Purpose**: Production testing tool for enhanced stock management
- **Usage**: `node testEnhancedStock.js [api|database|integration]`
- **Features**: API testing, database validation, integration testing
- **Status**: Active

## Archived Scripts

All obsolete and one-time migration scripts have been moved to `backup-unused/` directory.
These include user-specific scripts, development utilities, and migration tools that are no longer needed.

## Directory Structure

```
scripts/
├── tally-cron.js              # Production scheduler
├── enhancedTallySync.js        # Enhanced sync service  
├── analyzeExistingStockData.js # Stock analysis tool
├── testEnhancedStock.js        # Production testing
├── analysis-results/           # Analysis output files
├── backup-unused/              # Archived obsolete scripts
└── README.md                   # This file
```

## Usage Guidelines

1. **Never modify production scripts directly in production**
2. **Test all changes in development environment first**
3. **Keep backups before making changes**
4. **Document any new scripts added**
5. **Follow naming conventions: purposeAction.js**

## Maintenance

- Review scripts quarterly for relevance
- Archive unused development/debug scripts
- Update documentation when adding new scripts
- Monitor script performance and logs

---
Generated on: 2025-10-09T11:18:01.597Z
Last cleanup: 9/10/2025
