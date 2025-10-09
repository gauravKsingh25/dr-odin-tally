/**
 * Code Cleanup Script
 * Organizes and removes unused standalone scripts
 * Keeps only essential scripts needed for production
 */

const fs = require('fs');
const path = require('path');

class CodeCleanup {
    constructor() {
        this.scriptsDir = path.join(__dirname);
        this.backupDir = path.join(__dirname, 'backup-unused');
        
        // Scripts that are actively used by the application
        this.essentialScripts = [
            'tally-cron.js',                    // Used by main server
            'enhancedTallySync.js',             // Used by enhanced controller
            'analyzeExistingStockData.js',      // Production stock analysis
            'testEnhancedStock.js'              // Production testing tool
        ];
        
        // Scripts that can be safely removed or archived
        this.obsoleteScripts = [
            'analyzeStockData.js',              // Replaced by analyzeExistingStockData.js
            'api-usage-examples.js',            // Development examples
            'check-placeholder-parties.js',     // One-time migration script
            'clean-placeholder-list.js',        // One-time migration script
            'diagnoseLedgerIssues.js',          // Debug script
            'ensureUniqueVouchers.js',          // One-time migration script
            'find-employees-with-placeholder-parties.js', // Migration script
            'find-placeholder-parties.js',      // Migration script
            'fixFrontendAPIUrls.js',            // Development script
            'fixVoucherDates.js',               // One-time migration script
            'list-placeholder-employees.js',    // Migration script
            'manualVoucherSync.js',             // Debug script
            'quickAPITest.js',                  // Development testing
            'restoreAllVouchers.js',            // Emergency restore script
            'show-hanees-parties.js',           // User-specific debug script
            'show-manivannan-parties.js',       // User-specific debug script
            'show-shubham-parties.js',          // User-specific debug script
            'testEnhancedSync.js',              // Development testing
            'testLedgerAPI.js',                 // Development testing
            'update-hanees-parties.js',         // User-specific migration script
            'update-manivannan-parties.js',     // User-specific migration script
            'update-mohammed-parties.js',       // User-specific migration script
            'update-shubham-parties.js',        // User-specific migration script
            'updateCompanyId.js'                // One-time migration script
        ];
    }

    async cleanup() {
        console.log('🧹 Starting code cleanup process...\n');
        
        try {
            // Create backup directory
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
                console.log('📁 Created backup directory');
            }
            
            // List all scripts
            const allScripts = fs.readdirSync(this.scriptsDir)
                .filter(file => file.endsWith('.js') && file !== 'cleanup.js');
            
            console.log('📊 CLEANUP ANALYSIS:');
            console.log('='.repeat(50));
            console.log(`Total scripts found: ${allScripts.length}`);
            console.log(`Essential scripts: ${this.essentialScripts.length}`);
            console.log(`Obsolete scripts: ${this.obsoleteScripts.length}`);
            console.log('');
            
            // Show essential scripts (keep these)
            console.log('✅ ESSENTIAL SCRIPTS (Keeping):');
            this.essentialScripts.forEach(script => {
                if (allScripts.includes(script)) {
                    console.log(`   📌 ${script}`);
                } else {
                    console.log(`   ❌ ${script} (MISSING!)`);
                }
            });
            console.log('');
            
            // Show obsolete scripts (archive these)
            console.log('🗄️ OBSOLETE SCRIPTS (Archiving):');
            this.obsoleteScripts.forEach(script => {
                if (allScripts.includes(script)) {
                    console.log(`   📦 ${script}`);
                }
            });
            console.log('');
            
            // Find unclassified scripts
            const unclassified = allScripts.filter(script => 
                !this.essentialScripts.includes(script) && 
                !this.obsoleteScripts.includes(script)
            );
            
            if (unclassified.length > 0) {
                console.log('❓ UNCLASSIFIED SCRIPTS (Review needed):');
                unclassified.forEach(script => {
                    console.log(`   🔍 ${script}`);
                });
                console.log('');
            }
            
            // Archive obsolete scripts
            let archivedCount = 0;
            for (const script of this.obsoleteScripts) {
                const scriptPath = path.join(this.scriptsDir, script);
                const backupPath = path.join(this.backupDir, script);
                
                if (fs.existsSync(scriptPath)) {
                    fs.renameSync(scriptPath, backupPath);
                    archivedCount++;
                    console.log(`📦 Archived: ${script}`);
                }
            }
            
            console.log('');
            console.log('✅ CLEANUP SUMMARY:');
            console.log('='.repeat(50));
            console.log(`Scripts archived: ${archivedCount}`);
            console.log(`Scripts kept: ${this.essentialScripts.filter(s => allScripts.includes(s)).length}`);
            console.log(`Backup location: ${this.backupDir}`);
            
            // Clean up empty directories
            this.cleanupDirectories();
            
            // Generate production readme
            this.generateReadme();
            
            console.log('');
            console.log('🎉 Code cleanup completed successfully!');
            
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }
    
    cleanupDirectories() {
        console.log('');
        console.log('🗂️ Cleaning up directories...');
        
        const dirsToCheck = [
            path.join(this.scriptsDir, 'converted'),
            path.join(this.scriptsDir, 'excel upload')
        ];
        
        dirsToCheck.forEach(dir => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                if (files.length === 0) {
                    fs.rmdirSync(dir);
                    console.log(`🗑️ Removed empty directory: ${path.basename(dir)}`);
                } else {
                    // Move to backup
                    const backupDirPath = path.join(this.backupDir, path.basename(dir));
                    fs.renameSync(dir, backupDirPath);
                    console.log(`📦 Archived directory: ${path.basename(dir)}`);
                }
            }
        });
    }
    
    generateReadme() {
        const readmeContent = `# Scripts Directory

## Essential Scripts (Production)

### \`tally-cron.js\`
- **Purpose**: Automated Tally data synchronization scheduler
- **Used by**: Main server (index.js), tally routes
- **Schedule**: Runs daily at 12:00 AM
- **Status**: Active

### \`enhancedTallySync.js\`
- **Purpose**: Enhanced Tally data synchronization with improved error handling
- **Used by**: Enhanced Tally Controller
- **Features**: Comprehensive sync, error recovery, detailed logging
- **Status**: Active

### \`analyzeExistingStockData.js\`
- **Purpose**: Production stock data analysis and quality assessment
- **Usage**: \`node analyzeExistingStockData.js\`
- **Features**: Data quality analysis, field recommendations, UI optimization insights
- **Status**: Active

### \`testEnhancedStock.js\`
- **Purpose**: Production testing tool for enhanced stock management
- **Usage**: \`node testEnhancedStock.js [api|database|integration]\`
- **Features**: API testing, database validation, integration testing
- **Status**: Active

## Archived Scripts

All obsolete and one-time migration scripts have been moved to \`backup-unused/\` directory.
These include user-specific scripts, development utilities, and migration tools that are no longer needed.

## Directory Structure

\`\`\`
scripts/
├── tally-cron.js              # Production scheduler
├── enhancedTallySync.js        # Enhanced sync service  
├── analyzeExistingStockData.js # Stock analysis tool
├── testEnhancedStock.js        # Production testing
├── analysis-results/           # Analysis output files
├── backup-unused/              # Archived obsolete scripts
└── README.md                   # This file
\`\`\`

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
Generated on: ${new Date().toISOString()}
Last cleanup: ${new Date().toLocaleDateString()}
`;
        
        const readmePath = path.join(this.scriptsDir, 'README.md');
        fs.writeFileSync(readmePath, readmeContent);
        console.log('📝 Generated scripts README.md');
    }
}

// Run cleanup if called directly
if (require.main === module) {
    const cleanup = new CodeCleanup();
    cleanup.cleanup().catch(console.error);
}

module.exports = CodeCleanup;