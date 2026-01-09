# 📊 Hourly & Daily Transaction Reports with WhatsApp Notifications

## ✅ What's Implemented

Your system now automatically sends **hourly** and **daily** transaction reports to your company WhatsApp number with:

- ✅ **Success/Failed transaction counts**
- ✅ **Total amounts processed**
- ✅ **Success rate percentage**
- ✅ **Breakdown by service type** (Electricity, Airtime, Bills, etc.)
- ✅ **Failed transaction details** with reasons
- ✅ **Automatic high failure rate alerts** (🚨 when > 20%)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get WhatsApp Credentials

**Option A: Facebook WhatsApp Business API (Free)**
1. Visit: https://developers.facebook.com/apps
2. Create app → Add "WhatsApp" product
3. Copy your **Phone Number ID** and **Access Token**

**Option B: Twilio (Paid, easier)**
1. Visit: https://www.twilio.com/console
2. Copy **Account SID** and **Auth Token**
3. Use sandbox number for testing

### Step 2: Configure .env

Edit `agency-service/.env` and add:

```bash
# Your company WhatsApp number (no + or spaces)
COMPANY_WHATSAPP_NUMBER=250788123456

# Facebook WhatsApp API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
```

### Step 3: Start & Test

```bash
# Install dependencies
cd agency-service
npm install

# Start service
npm run dev

# In another terminal, test it:
node test-whatsapp-reports.mjs
```

---

## 📅 Automatic Schedules

| Report | Schedule | Contains |
|--------|----------|----------|
| **Hourly** | Every hour at :00 | Last hour's transactions |
| **Daily Morning** | 8:00 AM | Today's transactions so far |
| **Daily Evening** | 8:00 PM | Full day summary |
| **Alert** | When needed | High failure rate warning |

---

## 📱 Sample WhatsApp Message

```
📊 *Hourly Transaction Report*
⏰ 2025-12-10 14:00:00 - 2025-12-10 15:00:00

📈 *Overall Statistics*
• Total Transactions: 150
• ✅ Successful: 142
• ❌ Failed: 8
• Success Rate: 94.67%

💰 *Financial Summary*
• Total Amount: 45,250,000 RWF
• Success Amount: 43,100,000 RWF
• Failed Amount: 2,150,000 RWF

🔧 *By Service*

*Electricity*
  Total: 65 | ✅ 63 | ❌ 2
  Amount: 18,500,000 RWF

*Airtime*
  Total: 45 | ✅ 42 | ❌ 3
  Amount: 1,250,000 RWF
```

---

## 🔗 API Endpoints

```bash
# Preview reports (without sending)
GET http://localhost:4001/api/reports/preview/hourly
GET http://localhost:4001/api/reports/preview/daily

# Get statistics
GET http://localhost:4001/api/reports/stats/hourly
GET http://localhost:4001/api/reports/stats/daily

# Get failed transactions
GET http://localhost:4001/api/reports/failed/hourly?limit=10
GET http://localhost:4001/api/reports/failed/daily?limit=20

# Manual send (for testing)
POST http://localhost:4001/api/reports/send/manual
Body: { "type": "hourly" }
```

---

## 🧪 Testing

```bash
# 1. Start the service
cd agency-service
npm run dev

# 2. Run test suite
node test-whatsapp-reports.mjs

# 3. Preview a report (no WhatsApp send)
curl http://localhost:4001/api/reports/preview/hourly

# 4. Test actual WhatsApp send
curl -X POST http://localhost:4001/api/reports/send/manual \
  -H "Content-Type: application/json" \
  -d '{"type":"hourly"}'
```

---

## 🔧 Customization

### Change Schedule Times

Edit `agency-service/src/jobs/reportScheduler.js`:

```javascript
// Current: Every hour
cron.schedule('0 * * * *', sendHourlyReport);

// Change to: Every 2 hours
cron.schedule('0 */2 * * *', sendHourlyReport);

// Current: 8 AM and 8 PM
cron.schedule('0 8 * * *', sendDailyReport);   // 8 AM
cron.schedule('0 20 * * *', sendDailyReport);  // 8 PM

// Change to: 9 AM and 6 PM
cron.schedule('0 9 * * *', sendDailyReport);   // 9 AM
cron.schedule('0 18 * * *', sendDailyReport);  // 6 PM
```

**Cron Format**: `minute hour day month weekday`

### Change Alert Threshold

```javascript
// Current: Alert if failure rate > 20%
await sendFailureAlert(stats, 20);

// Change to: Alert if > 30%
await sendFailureAlert(stats, 30);
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No WhatsApp messages | Add credentials to `.env` file |
| "WhatsApp not configured" | Normal in development, add credentials for production |
| No statistics | Ensure transactions exist in database |
| Wrong phone format | Use: `250788123456` (no +, spaces, or leading 0) |
| Schedule not working | Check logs for "Scheduled jobs initialized" |

---

## 📚 Documentation

- **Full Setup Guide**: [`WHATSAPP_REPORTS_GUIDE.md`](./WHATSAPP_REPORTS_GUIDE.md)
- **Quick Reference**: [`WHATSAPP_QUICK_START.md`](./WHATSAPP_QUICK_START.md)
- **Implementation Details**: [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
- **System Architecture**: [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md)

---

## 📦 Files Created

```
agency-service/
├── src/
│   ├── services/
│   │   ├── transactionStatsService.js   ✨ Statistics calculations
│   │   └── whatsappService.js           ✨ WhatsApp integration
│   ├── jobs/
│   │   └── reportScheduler.js           ✨ Cron scheduler
│   └── routes/
│       └── report-routes.js             ✨ API endpoints
├── .env                                 ✨ Updated with WhatsApp config
└── .env.whatsapp.example               ✨ Config template

Root/
├── WHATSAPP_REPORTS_GUIDE.md           ✨ Full documentation
├── WHATSAPP_QUICK_START.md             ✨ Quick reference  
├── IMPLEMENTATION_SUMMARY.md           ✨ Implementation details
├── SYSTEM_ARCHITECTURE.md              ✨ Visual diagrams
├── test-whatsapp-reports.mjs           ✨ Test suite
└── README_WHATSAPP.md                  ✨ This file
```

---

## ✅ Quick Verification Checklist

- [ ] `node-cron` installed (`npm install` in agency-service)
- [ ] `.env` has `COMPANY_WHATSAPP_NUMBER`
- [ ] `.env` has WhatsApp API credentials (or leave empty for dev)
- [ ] Service starts: `npm run dev`
- [ ] Logs show: "Scheduled jobs initialized successfully"
- [ ] Preview works: `curl http://localhost:4001/api/reports/preview/hourly`
- [ ] Test suite passes: `node test-whatsapp-reports.mjs`

---

## 🎯 Next Steps

1. **Development**: Test with preview endpoints (no WhatsApp needed)
2. **Staging**: Configure WhatsApp sandbox/test numbers
3. **Production**: 
   - Verify Facebook business account (if using Facebook)
   - Set production environment variables
   - Monitor first automatic reports

---

## 💡 Pro Tips

- **Start without WhatsApp**: System works fine, just logs to console
- **Use Preview Endpoints**: See exact message format before sending
- **Test Manual Send First**: Before relying on automatic schedule
- **Monitor Logs**: Check for "report sent successfully" messages
- **Customize Schedule**: Adjust to your business hours

---

## 📞 Need Help?

1. Check logs: `tail -f agency-service/logs/combined.log`
2. Test preview: `GET /api/reports/preview/hourly`
3. Run test suite: `node test-whatsapp-reports.mjs`
4. Read full guide: `WHATSAPP_REPORTS_GUIDE.md`

---

## 🌟 Features

✅ Automatic hourly reports (every hour)  
✅ Automatic daily reports (8 AM & 8 PM)  
✅ Success/failure tracking  
✅ Amount totals and breakdowns  
✅ Service-level statistics  
✅ Failed transaction details  
✅ High failure rate alerts  
✅ REST API for on-demand reports  
✅ Preview without sending  
✅ Multi-language support (EN, FR, RW, SW)  
✅ Comprehensive logging  
✅ Easy customization  

---

**Implementation Date**: December 10, 2025  
**Status**: ✅ Complete & Ready to Use  
**Service**: agency-service (Port 4001)  

---

🎉 **You're all set! The system will automatically send reports once you add WhatsApp credentials.**
