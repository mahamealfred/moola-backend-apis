# 📊 Transaction Reports & WhatsApp Notifications Setup Guide

## Overview
This system automatically sends hourly and daily transaction reports to your company WhatsApp number, including:
- ✅ Success/Failed transaction counts
- 💰 Total amounts processed
- 📈 Success rate percentage
- 🔧 Breakdown by service type
- ❌ Details of failed transactions
- 🚨 Automatic alerts for high failure rates

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd agency-service
npm install
```

### 2. Configure WhatsApp (Choose One Method)

#### **Method A: Facebook WhatsApp Business API (Recommended)**

**Step 1: Create Facebook Business Account**
1. Go to https://business.facebook.com/
2. Create a Business Account if you don't have one

**Step 2: Set Up WhatsApp Business API**
1. Visit https://developers.facebook.com/apps
2. Click "Create App" → Choose "Business" type
3. Add "WhatsApp" product to your app
4. Follow the setup wizard

**Step 3: Get Your Credentials**
1. In your app dashboard, go to WhatsApp → Getting Started
2. Copy your **Phone Number ID**
3. Generate a **Permanent Access Token** (or use temporary for testing)
4. Add test phone numbers or verify your business for production

**Step 4: Update .env File**
```bash
# Copy example file
cp .env.whatsapp.example .env

# Edit .env and add:
COMPANY_WHATSAPP_NUMBER=250788123456  # Your company number (no + or spaces)
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
```

#### **Method B: Twilio WhatsApp API (Alternative)**

**Step 1: Create Twilio Account**
1. Sign up at https://www.twilio.com/
2. Go to Console → Messaging → Try it out → Send a WhatsApp message

**Step 2: Get Credentials**
1. Note your **Account SID** and **Auth Token**
2. Use Twilio's WhatsApp sandbox number or request production access

**Step 3: Update Code**
In `src/services/whatsappService.js`, uncomment the Twilio section and install:
```bash
npm install twilio
```

**Step 4: Update .env**
```bash
COMPANY_WHATSAPP_NUMBER=250788123456
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## 📅 Schedule Configuration

The system runs these scheduled jobs automatically:

### Hourly Report
- **Schedule**: Every hour at :00 (e.g., 1:00, 2:00, 3:00)
- **Contains**: Last hour's transactions
- **Alert**: If failure rate > 20%

### Daily Reports
- **Morning Report**: 8:00 AM daily
- **Evening Report**: 8:00 PM daily
- **Contains**: All transactions for the day
- **Alert**: If failure rate > 15%

### Customize Schedule
Edit `src/jobs/reportScheduler.js`:

```javascript
// Change hourly schedule (currently: every hour)
cron.schedule('0 * * * *', async () => {
  await sendHourlyReport();
});

// Change daily schedule (currently: 8 AM and 8 PM)
cron.schedule('0 8 * * *', async () => {  // 8:00 AM
  await sendDailyReport();
});

cron.schedule('0 20 * * *', async () => {  // 8:00 PM
  await sendDailyReport();
});
```

**Cron Format**: `minute hour day month weekday`
- `0 * * * *` = Every hour
- `0 8 * * *` = Every day at 8 AM
- `0 */2 * * *` = Every 2 hours
- `0 8,20 * * *` = At 8 AM and 8 PM
- `0 8 * * 1-5` = 8 AM on weekdays only

---

## 🛠️ API Endpoints

### View Statistics

**Hourly Stats**
```bash
GET http://localhost:4001/api/reports/stats/hourly
```

**Daily Stats**
```bash
GET http://localhost:4001/api/reports/stats/daily
```

**Custom Period Stats**
```bash
GET http://localhost:4001/api/reports/stats/custom?startDate=2025-12-01&endDate=2025-12-10
```

### View Failed Transactions

**Hourly Failed**
```bash
GET http://localhost:4001/api/reports/failed/hourly?limit=10
```

**Daily Failed**
```bash
GET http://localhost:4001/api/reports/failed/daily?limit=20
```

### Preview Reports (Without Sending)

**Preview Hourly Report**
```bash
GET http://localhost:4001/api/reports/preview/hourly
```

**Preview Daily Report**
```bash
GET http://localhost:4001/api/reports/preview/daily
```

### Manual Trigger

**Send Report Manually**
```bash
POST http://localhost:4001/api/reports/send/manual
Content-Type: application/json

{
  "type": "hourly"  // or "daily"
}
```

---

## 📱 WhatsApp Message Format

### Statistics Report Example
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

*Bill Payment*
  Total: 40 | ✅ 37 | ❌ 3
  Amount: 25,500,000 RWF
```

### Failed Transactions Report Example
```
❌ *Hourly Failed Transactions (Last 5)*

1. *Electricity*
   ID: TXN123456
   Amount: 50,000 RWF
   Time: 10/12/2025 14:23
   Reason: Insufficient balance

2. *Airtime*
   ID: TXN123457
   Amount: 5,000 RWF
   Time: 10/12/2025 14:45
   Reason: Invalid phone number
```

### High Failure Alert Example
```
🚨 *HIGH FAILURE RATE ALERT* 🚨

⚠️ Transaction failure rate is 25.50%

📊 Statistics:
• Total: 100
• Failed: 25
• Successful: 75

🕐 Period: 2025-12-10 14:00:00 - 2025-12-10 15:00:00

⚡ Immediate action may be required!
```

---

## 🧪 Testing

### 1. Test Without WhatsApp (Logs Only)
If WhatsApp credentials are not configured, messages will be logged to console:

```bash
npm run dev
```

Check logs for:
```
WhatsApp Message (would be sent): { phoneNumber: '...', message: '...' }
```

### 2. Test with Preview Endpoint
```bash
curl http://localhost:4001/api/reports/preview/hourly
```

This shows you exactly what would be sent without actually sending.

### 3. Manual Test Send
```bash
curl -X POST http://localhost:4001/api/reports/send/manual \
  -H "Content-Type: application/json" \
  -d '{"type": "hourly"}'
```

### 4. Test Scheduled Jobs
The jobs run automatically. Check logs:
```
Hourly report cron job triggered
Daily morning report cron job triggered
```

---

## 🔧 Troubleshooting

### WhatsApp Message Not Sending

**Check Logs**
```bash
# Look for errors in console
tail -f agency-service/logs/error.log
```

**Common Issues**:

1. **Invalid Phone Number Format**
   - ❌ Wrong: `+250788123456` or `0788123456`
   - ✅ Correct: `250788123456` (no + or leading 0)

2. **Invalid Access Token**
   - Generate a new permanent token from Facebook Developer Console
   - Temporary tokens expire after 24 hours

3. **Phone Number Not Verified**
   - For Facebook: Add test numbers in App Dashboard
   - For production: Complete business verification

4. **Rate Limiting**
   - Facebook: Check your message rate limits
   - Wait and retry

### No Statistics Showing

**Check Database**:
```sql
SELECT COUNT(*) FROM TransactionStatus 
WHERE date >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

If empty, no transactions have been logged yet.

### Scheduled Jobs Not Running

**Verify Cron Syntax**:
```javascript
// Test with a quick schedule (every minute)
cron.schedule('* * * * *', async () => {
  console.log('Test job running');
});
```

**Check Server Time**:
```bash
# Ensure server timezone is correct
date
```

---

## 🔐 Security Best Practices

1. **Never commit .env file**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment variables in production**
   ```bash
   # Set in your hosting platform (Heroku, AWS, etc.)
   ```

3. **Rotate access tokens regularly**
   - Facebook: Generate new tokens every 60 days
   - Twilio: Rotate auth tokens periodically

4. **Restrict WhatsApp API permissions**
   - Only grant necessary permissions
   - Use IP whitelisting if available

---

## 📊 Monitoring

### Check Report Delivery
```bash
# View logs
tail -f logs/combined.log | grep "report sent"
```

### Monitor Failure Rates
```bash
# API endpoint
curl http://localhost:4001/api/reports/stats/hourly
```

### Database Query
```sql
-- Get today's stats
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(amount) as total_amount
FROM TransactionStatus
WHERE DATE(date) = CURDATE();
```

---

## 🚀 Production Deployment

1. **Set Environment Variables**
   ```bash
   export COMPANY_WHATSAPP_NUMBER=250788123456
   export WHATSAPP_ACCESS_TOKEN=your_token
   # ... other vars
   ```

2. **Use PM2 or Forever**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name agency-service
   pm2 save
   pm2 startup
   ```

3. **Enable Production Logging**
   ```javascript
   // In logger config
   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
   ```

4. **Monitor with PM2**
   ```bash
   pm2 logs agency-service
   pm2 monit
   ```

---

## 📞 Support & Resources

- **Facebook WhatsApp API**: https://developers.facebook.com/docs/whatsapp
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp
- **Node-Cron**: https://www.npmjs.com/package/node-cron
- **Sequelize**: https://sequelize.org/docs/

---

## ✅ Checklist

- [ ] Installed dependencies (`npm install`)
- [ ] Configured WhatsApp credentials in `.env`
- [ ] Set `COMPANY_WHATSAPP_NUMBER`
- [ ] Tested preview endpoint
- [ ] Tested manual send
- [ ] Verified scheduled jobs are initialized
- [ ] Checked logs for errors
- [ ] Tested with real transactions
- [ ] Configured production environment variables

---

**Need Help?** Check the logs or test with the preview endpoints first! 🎯
