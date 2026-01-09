# 📊 WhatsApp Transaction Reports - System Architecture

## 🏗️ System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TRANSACTION PROCESSING                        │
│                    (Payment Controller, Services)                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │  TransactionStatus │ ◄── Stores every transaction
                  │   Database Table   │     (success/failed/pending)
                  └─────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│   HOURLY    │   │    DAILY     │   │   CUSTOM     │
│  SCHEDULER  │   │  SCHEDULER   │   │  API CALLS   │
│             │   │              │   │              │
│ Every hour  │   │  8 AM & 8 PM │   │ On demand    │
│  at :00     │   │   Daily      │   │ via REST API │
└─────┬───────┘   └──────┬───────┘   └──────┬───────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Transaction Stats     │
            │  Service               │
            │                        │
            │  • Query database      │
            │  • Calculate stats     │
            │  • Group by service    │
            │  • Get failed txns     │
            │  • Format for WhatsApp │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │  WhatsApp Service      │
            │                        │
            │  • Format message      │
            │  • Send via API        │
            │  • Check failure rate  │
            │  • Send alerts         │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │  Facebook/Twilio API   │
            └───────────┬────────────┘
                        │
                        ▼
                ┌───────────────┐
                │   WHATSAPP    │
                │    MESSAGE    │
                │   Delivered   │
                │  to Company   │
                └───────────────┘
```

## 📁 File Structure

```
agency-service/
├── src/
│   ├── services/
│   │   ├── transactionStatsService.js  ◄── Statistics calculations
│   │   └── whatsappService.js          ◄── WhatsApp message sending
│   │
│   ├── jobs/
│   │   └── reportScheduler.js          ◄── Cron job scheduler
│   │
│   ├── routes/
│   │   └── report-routes.js            ◄── REST API endpoints
│   │
│   ├── models/
│   │   └── TransactionStatus.js        ◄── Database model
│   │
│   ├── utils/
│   │   └── logsData.js                 ◄── Database queries
│   │
│   └── server.js                       ◄── App initialization
│
├── .env                                ◄── Configuration
├── .env.whatsapp.example              ◄── Config template
└── package.json                        ◄── Dependencies

Root/
├── WHATSAPP_REPORTS_GUIDE.md          ◄── Full documentation
├── WHATSAPP_QUICK_START.md            ◄── Quick reference
├── IMPLEMENTATION_SUMMARY.md          ◄── This file
└── test-whatsapp-reports.mjs          ◄── Test suite
```

## 🔄 Data Flow Example

### Hourly Report Flow:

```
1. ⏰ Cron triggers at 14:00
   └─> reportScheduler.sendHourlyReport()

2. 📊 Query transactions from 13:00-14:00
   └─> transactionStatsService.getHourlyStats()
       └─> Query: SELECT * FROM TransactionStatus 
           WHERE date BETWEEN '13:00' AND '14:00'

3. 🧮 Calculate statistics
   ├─> Total: 150 transactions
   ├─> Success: 142 (94.67%)
   ├─> Failed: 8 (5.33%)
   ├─> Amount: 45,250,000 RWF
   └─> By Service: Electricity(65), Airtime(45), Bills(40)

4. 📝 Format for WhatsApp
   └─> transactionStatsService.formatStatsForWhatsApp()
       └─> Creates formatted message with emojis

5. 📱 Send to WhatsApp
   └─> whatsappService.sendTransactionReport()
       └─> POST https://graph.facebook.com/v18.0/{phone_id}/messages
           Body: { to: "250788123456", text: "📊 Hourly Report..." }

6. ✅ Log result
   └─> logger.info('Hourly report sent successfully')

7. 🚨 Check if failure rate high (>20%)
   └─> If yes: Send alert message
```

## 🎯 API Endpoint Flow

### GET /api/reports/preview/hourly

```
Client Request
    │
    ▼
┌─────────────────────────┐
│  Report Routes Handler  │
│  /api/reports/preview/  │
│        hourly           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  getHourlyStats()       │
│  • Query last hour data │
│  • Calculate stats      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  formatStatsForWhatsApp()│
│  • Format message       │
│  • Add emojis           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  getFailedTransactions()│
│  • Get failed txn list  │
│  • Format details       │
└───────────┬─────────────┘
            │
            ▼
    JSON Response:
    {
      "success": true,
      "data": {
        "statsReport": "📊 Hourly Report...",
        "failedReport": "❌ Failed Txns...",
        "stats": { ... }
      }
    }
```

## 🕐 Schedule Timeline (24-hour view)

```
Hour    Hourly Reports    Daily Reports    Description
────────────────────────────────────────────────────────
00:00   ✅ Send          -                Last hour stats
01:00   ✅ Send          -                Last hour stats
02:00   ✅ Send          -                Last hour stats
03:00   ✅ Send          -                Last hour stats
04:00   ✅ Send          -                Last hour stats
05:00   ✅ Send          -                Last hour stats
06:00   ✅ Send          -                Last hour stats
07:00   ✅ Send          -                Last hour stats
08:00   ✅ Send          ✅ MORNING       Today's stats so far
09:00   ✅ Send          -                Last hour stats
10:00   ✅ Send          -                Last hour stats
11:00   ✅ Send          -                Last hour stats
12:00   ✅ Send          -                Last hour stats
13:00   ✅ Send          -                Last hour stats
14:00   ✅ Send          -                Last hour stats
15:00   ✅ Send          -                Last hour stats
16:00   ✅ Send          -                Last hour stats
17:00   ✅ Send          -                Last hour stats
18:00   ✅ Send          -                Last hour stats
19:00   ✅ Send          -                Last hour stats
20:00   ✅ Send          ✅ EVENING       Full day summary
21:00   ✅ Send          -                Last hour stats
22:00   ✅ Send          -                Last hour stats
23:00   ✅ Send          -                Last hour stats
```

## 🔔 Alert Triggers

```
┌────────────────────────────────────────┐
│   After Each Report Calculation       │
└──────────────┬─────────────────────────┘
               │
               ▼
        Check Failure Rate
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
   < 20%              ≥ 20%
     │                   │
     ▼                   ▼
  Normal           🚨 ALERT!
   Log              │
                    ▼
            Send Alert Message:
            "HIGH FAILURE RATE ALERT
             Failure rate is 25.50%
             Total: 100
             Failed: 25
             Immediate action required!"
```

## 📊 Database Query Pattern

```sql
-- Hourly Stats Query (Last Hour)
SELECT 
    status,
    service_name,
    SUM(amount) as total_amount,
    COUNT(*) as count
FROM TransactionStatus
WHERE date BETWEEN DATE_SUB(NOW(), INTERVAL 1 HOUR) AND NOW()
GROUP BY status, service_name;

-- Daily Stats Query (Today)
SELECT 
    status,
    service_name,
    SUM(amount) as total_amount,
    COUNT(*) as count
FROM TransactionStatus
WHERE DATE(date) = CURDATE()
GROUP BY status, service_name;

-- Failed Transactions (Last Hour, Top 10)
SELECT 
    transactionId,
    service_name,
    amount,
    description,
    date,
    agent_name,
    customerId
FROM TransactionStatus
WHERE date BETWEEN DATE_SUB(NOW(), INTERVAL 1 HOUR) AND NOW()
  AND status IN ('failed', 'error', 'declined')
ORDER BY date DESC
LIMIT 10;
```

## 🔌 WhatsApp API Integration

### Facebook WhatsApp Business API

```
Request:
POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
Headers:
    Authorization: Bearer {ACCESS_TOKEN}
    Content-Type: application/json
Body:
    {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "250788123456",
      "type": "text",
      "text": {
        "preview_url": false,
        "body": "📊 *Hourly Transaction Report*..."
      }
    }

Response:
    {
      "messaging_product": "whatsapp",
      "contacts": [{
        "input": "250788123456",
        "wa_id": "250788123456"
      }],
      "messages": [{
        "id": "wamid.HBgMXXXXXXXXXXXXXX=="
      }]
    }
```

## 🎨 Message Format Components

```
Header Section:
    📊 *Report Type*
    ⏰ Time Period

Overall Stats Section:
    📈 *Overall Statistics*
    • Total Transactions: XX
    • ✅ Successful: XX
    • ❌ Failed: XX
    • Success Rate: XX%

Financial Section:
    💰 *Financial Summary*
    • Total Amount: XX RWF
    • Success Amount: XX RWF
    • Failed Amount: XX RWF

Service Breakdown:
    🔧 *By Service*
    
    *Service Name*
      Total: XX | ✅ XX | ❌ XX
      Amount: XX RWF

Failed Transactions:
    ❌ *Failed Transactions*
    
    1. *Service*
       ID: TXNXXXXX
       Amount: XX RWF
       Time: DD/MM/YYYY HH:MM
       Reason: Error message
```

## 🚀 Startup Sequence

```
1. Server Start (npm run dev)
   └─> src/server.js

2. Load Environment Variables
   └─> dotenv.config()

3. Initialize Database Connection
   └─> Sequelize connect

4. Initialize Routes
   ├─> /api/agency (banking routes)
   └─> /api/reports (report routes) ✨ NEW

5. Initialize Scheduled Jobs ✨ NEW
   └─> initializeScheduledJobs()
       ├─> Hourly: cron.schedule('0 * * * *')
       ├─> Daily AM: cron.schedule('0 8 * * *')
       └─> Daily PM: cron.schedule('0 20 * * *')

6. Listen on Port
   └─> app.listen(4001)

7. Log Success
   └─> "🚀 Agency service running on port 4001"
       "Scheduled jobs initialized successfully"
```

---

## 📝 Key Components Summary

| Component | Purpose | Location |
|-----------|---------|----------|
| **transactionStatsService** | Query & calculate statistics | `src/services/transactionStatsService.js` |
| **whatsappService** | Send WhatsApp messages | `src/services/whatsappService.js` |
| **reportScheduler** | Cron jobs for scheduling | `src/jobs/reportScheduler.js` |
| **report-routes** | REST API endpoints | `src/routes/report-routes.js` |
| **TransactionStatus** | Database model | `src/models/TransactionStatus.js` |
| **node-cron** | Scheduling library | `node_modules/node-cron` |

---

**Visual created: December 10, 2025**
