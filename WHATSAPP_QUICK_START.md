# 📊 WhatsApp Transaction Reports - Quick Reference

## ⚡ Quick Setup (5 Minutes)

### 1. Add to .env file:
```bash
COMPANY_WHATSAPP_NUMBER=250788123456
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

### 2. Install & Run:
```bash
cd agency-service
npm install
npm run dev
```

### 3. Test:
```bash
# In another terminal
node test-whatsapp-reports.mjs
```

---

## 📅 Automatic Schedules

| Report | Schedule | Contains |
|--------|----------|----------|
| Hourly | Every hour (:00) | Last hour transactions |
| Daily Morning | 8:00 AM | Today's transactions |
| Daily Evening | 8:00 PM | Full day summary |

---

## 🔗 API Endpoints

### Statistics
- `GET /api/reports/stats/hourly` - Last hour stats
- `GET /api/reports/stats/daily` - Today's stats
- `GET /api/reports/stats/custom?startDate=2025-12-01&endDate=2025-12-10`

### Failed Transactions
- `GET /api/reports/failed/hourly?limit=10`
- `GET /api/reports/failed/daily?limit=20`

### Preview (No WhatsApp Send)
- `GET /api/reports/preview/hourly`
- `GET /api/reports/preview/daily`

### Manual Send
- `POST /api/reports/send/manual` 
  Body: `{ "type": "hourly" }`

---

## 📱 WhatsApp Setup Options

### Option A: Facebook (Recommended)
1. Visit: https://developers.facebook.com/apps
2. Create app → Add WhatsApp product
3. Get Phone Number ID & Access Token
4. Add to .env

### Option B: Twilio
1. Visit: https://www.twilio.com/console
2. Get Account SID & Auth Token
3. Use sandbox or apply for production
4. Uncomment Twilio code in `whatsappService.js`

---

## 🧪 Testing Commands

```bash
# Test without sending WhatsApp (just logs)
npm run dev

# Preview what would be sent
curl http://localhost:4001/api/reports/preview/hourly

# Test actual sending (if configured)
curl -X POST http://localhost:4001/api/reports/send/manual \
  -H "Content-Type: application/json" \
  -d '{"type":"hourly"}'

# Run test suite
node test-whatsapp-reports.mjs
```

---

## 📊 What's Included in Reports

✅ **Success/Failed Counts**
💰 **Total Amounts (Success & Failed)**
📈 **Success Rate %**
🔧 **Breakdown by Service** (Electricity, Airtime, Bills, etc.)
❌ **Top Failed Transactions** with reasons
🚨 **Automatic Alerts** if failure rate > 20%

---

## 🔧 Customization

### Change Schedule
Edit: `src/jobs/reportScheduler.js`

```javascript
// Every 2 hours
cron.schedule('0 */2 * * *', sendHourlyReport);

// Weekdays only at 9 AM
cron.schedule('0 9 * * 1-5', sendDailyReport);

// Every 30 minutes
cron.schedule('*/30 * * * *', sendHourlyReport);
```

### Change Failure Alert Threshold
Edit: `src/jobs/reportScheduler.js`

```javascript
// Alert if failure rate > 30%
await sendFailureAlert(stats, 30);
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| No WhatsApp sent | Check .env has correct credentials |
| Phone format error | Use format: `250788123456` (no + or 0) |
| No stats showing | Make sure transactions exist in DB |
| Cron not running | Check server logs for "Scheduled jobs initialized" |

---

## 📞 Get WhatsApp Credentials

**Facebook WhatsApp Business API (Free Tier)**
- URL: https://developers.facebook.com/apps
- Guide: See `WHATSAPP_REPORTS_GUIDE.md` for detailed steps

**Twilio (Paid, but easier setup)**
- URL: https://www.twilio.com/console
- Has sandbox for testing

---

## ✅ Quick Verification Checklist

- [ ] `node-cron` installed
- [ ] `.env` has `COMPANY_WHATSAPP_NUMBER`
- [ ] `.env` has WhatsApp API credentials
- [ ] Service starts without errors
- [ ] Logs show "Scheduled jobs initialized"
- [ ] Preview endpoint returns data
- [ ] Test send works

---

**Full Documentation**: See `WHATSAPP_REPORTS_GUIDE.md` 📖
