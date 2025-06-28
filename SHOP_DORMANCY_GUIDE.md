# 🏪 SHOP DORMANCY SYSTEM - COMPREHENSIVE OVERVIEW

## ✅ **YES, Shops Do Get Inactive After Certain Days!**

Your sustainable shopping marketplace has a **fully implemented automated shop dormancy system** that manages shop lifecycle based on activity.

## ⏰ **Dormancy Timeline**

### **Stage 1: Dormant (30 days)**
- **Trigger**: No activity for 30+ days
- **Status**: `active` → `dormant`
- **Effect**: Shop becomes hidden from public listings
- **Reversible**: ✅ Automatic when seller adds new products

### **Stage 2: Inactive (60 days)**
- **Trigger**: No activity for 60+ days  
- **Status**: `dormant` → `inactive`
- **Effect**: Shop marked as inactive
- **Reversible**: ✅ Automatic when seller adds new products

### **Stage 3: Archived (90 days)**
- **Trigger**: No activity for 90+ days
- **Status**: `inactive` → `archived`  
- **Effect**: Shop marked as candidate for deletion
- **Reversible**: ❓ May require manual intervention

## 🔧 **How It Works**

### **Activity Detection**
The system tracks shop activity based on:
- Shop `updatedAt` timestamp
- Product additions/updates
- Shop profile modifications

### **Automatic Status Changes**
```javascript
// After 30 days → Dormant
{ 
  status: 'dormant',
  dormancyReason: 'No activity for 30+ days',
  dormancyDate: new Date()
}

// After 60 days → Inactive  
{
  status: 'inactive', 
  dormancyReason: 'No activity for 60+ days',
  dormancyDate: new Date()
}

// After 90 days → Archived
{
  status: 'archived',
  dormancyReason: 'No activity for 90+ days - candidate for deletion',
  dormancyDate: new Date()
}
```

### **Automatic Reactivation**
When a seller with a dormant/inactive shop adds a new product:
```javascript
// Automatically reactivates shop
{
  status: 'active',
  $unset: { 
    dormancyReason: 1,
    dormancyDate: 1
  }
}
```

## 🚀 **System Features**

### **✅ Currently Implemented:**
- ✅ **Dormancy Detection**: Checks shop `updatedAt` timestamps
- ✅ **Status Progression**: 30→60→90 day timeline
- ✅ **Automatic Reactivation**: When sellers add products
- ✅ **Database Fields**: `status`, `dormancyReason`, `dormancyDate`
- ✅ **Logging**: Comprehensive activity tracking

### **⚠️ Manual Execution Only:**
- The system exists but requires **manual execution**
- No automatic cron job is currently scheduled
- Must be run manually via: `node shopDormancySystem.js`

## 🔍 **Shop Status Values**

The shop model supports these status values:
- `active` - Normal operating shop
- `dormant` - Hidden from public (30+ days inactive)
- `inactive` - Marked inactive (60+ days)
- `pending` - Awaiting admin approval
- `suspended` - Admin suspended
- `archived` - Deletion candidate (90+ days)

## 🎯 **To Make It Fully Automatic**

To enable automatic dormancy checking, you could:

1. **Add to server startup** (check daily):
```javascript
// In index.js
import { checkShopActivity } from './utils/shopDormancySystem.js';

// Run daily at midnight
setInterval(async () => {
  console.log('🔄 Running daily shop dormancy check...');
  await checkShopActivity();
}, 24 * 60 * 60 * 1000); // 24 hours
```

2. **Set up external cron job**:
```bash
# Run every day at 2 AM
0 2 * * * cd /path/to/server && node utils/shopDormancySystem.js
```

## 📊 **Current Status**

Your dormancy system is:
- ✅ **Fully implemented** and functional
- ✅ **Integrated** with product creation
- ✅ **Database ready** with proper fields
- ⚠️ **Manual execution** required (no auto-schedule)

**The system exists and works - it just needs to be run periodically to take effect!**

---
*Shop Dormancy System: Promoting active marketplace participation*
