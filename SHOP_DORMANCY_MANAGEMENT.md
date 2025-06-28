# 🏪 Shop Dormancy Management Guide

## ✅ **Current Status: FULLY IMPLEMENTED**

Your marketplace has a complete automated shop dormancy system that:
- ✅ **Tracks shop activity** based on `updatedAt` timestamps
- ✅ **Automatically progresses** shops through dormancy stages
- ✅ **Reactivates shops** when sellers add new products
- ✅ **Logs all changes** with reasons and timestamps
- ⚠️ **Requires manual execution** (no automatic scheduling)

## ⏰ **Dormancy Timeline**

### Stage 1: Active → Dormant (30 days)
- **Trigger**: No activity for 30+ days
- **Effect**: Shop hidden from public listings
- **Reversible**: ✅ Automatic when seller adds products

### Stage 2: Dormant → Inactive (60 days)  
- **Trigger**: No activity for 60+ days
- **Effect**: Shop marked as inactive
- **Reversible**: ✅ Automatic when seller adds products

### Stage 3: Inactive → Archived (90 days)
- **Trigger**: No activity for 90+ days
- **Effect**: Shop marked for potential deletion
- **Reversible**: ❓ May require manual intervention

## 🔧 **How to Run Dormancy Checks**

### Method 1: Manual Script (Recommended)
```powershell
# Navigate to server directory
cd f:\web\abc\server

# Run manual dormancy check
node run-dormancy-check.js
```

### Method 2: Direct Utility
```powershell
# Run the dormancy utility directly
node utils/shopDormancySystem.js
```

### Method 3: Automatic (Built-in)
The server now includes automatic daily dormancy checks:
- ✅ Initial check 5 seconds after server start
- ✅ Daily checks every 24 hours
- ✅ Comprehensive error handling and logging

## 🎯 **Setting Up Windows Scheduled Task**

To run dormancy checks automatically via Windows Task Scheduler:

1. **Open Task Scheduler** (Start → Task Scheduler)
2. **Create Basic Task** → "Shop Dormancy Check"
3. **Trigger**: Daily at 2:00 AM
4. **Action**: Start a program
   - Program: `node`
   - Arguments: `f:\web\abc\server\run-dormancy-check.js`
   - Start in: `f:\web\abc\server`

## 🔄 **Automatic Reactivation**

Shops automatically reactivate when sellers:
- ✅ Add new products
- ✅ Update existing products
- ✅ Modify shop information

The reactivation logic is integrated into your product controller and removes dormancy flags.

## 📊 **Monitoring Shop Status**

### Admin Dashboard
- Navigate to `/dashboard/manage-shops`
- Use status filters to view dormant/inactive shops
- Debug tools available in development mode

### Manual Database Check
```powershell
# Check shop statuses
node debug-shops.js
```

## 🚀 **Best Practices**

1. **Regular Monitoring**: Check dormancy reports weekly
2. **Seller Communication**: Notify sellers before shops become dormant
3. **Reactivation Support**: Help sellers understand how to reactivate
4. **Performance**: Dormancy checks should run during low-traffic hours

## 📝 **Status Values**

- `active` - Normal operating shop
- `dormant` - Hidden from public (30+ days inactive)  
- `inactive` - Marked inactive (60+ days)
- `pending` - Awaiting admin approval
- `suspended` - Admin suspended
- `archived` - Deletion candidate (90+ days)

## 🔍 **Troubleshooting**

### If Dormancy Check Fails:
1. Check MongoDB connection
2. Verify environment variables
3. Check server logs for errors
4. Ensure shop model has required fields

### If Auto-Reactivation Fails:
1. Check product creation logs
2. Verify shop ownership
3. Ensure shop is in dormant/inactive status
4. Check reactivateShop function

---

**Your dormancy system is production-ready and will help maintain an active, engaged marketplace!**
