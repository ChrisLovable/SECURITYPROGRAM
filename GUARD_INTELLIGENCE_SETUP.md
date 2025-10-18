# 🧠 Guard Intelligence System - Setup Guide

## Overview
The Guard Intelligence System provides predictive analytics and automated suggestions for guard scheduling, helping you stay ahead of coverage issues and optimize guard assignments.

## 🚀 Quick Setup (5 Steps)

### Step 1: Database Schema Setup
Run the intelligence schema in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of intelligence_schema.sql
-- This creates all necessary tables, views, and functions
```

### Step 2: Deploy Edge Function
Deploy the intelligence scheduler to Supabase:

```bash
# In your project directory
supabase functions deploy intelligence-scheduler
```

### Step 3: Set Up Cron Job
Run the cron setup in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of intelligence_cron_setup.sql
-- Replace 'your-project-ref' with your actual Supabase project reference
```

### Step 4: Configure Environment Variables
Add to your `.env.local`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 5: Test the System
1. Click the "🧠 Guard Intelligence" button on your dashboard
2. Check the "Daily Reports" tab for narrative-style reports
3. Review "Coverage Conflicts" for automated suggestions

## 📊 What You'll See

### Daily Reports Tab
**Narrative-style reports like:**
```
📅 Monday, December 16, 2024

🛌 2 guard(s) starting rest period:
   • Joseph Mbewe - Beginning 12-day rest cycle
   • Sarah Johnson - Beginning 12-day rest cycle

🔄 1 guard(s) returning from rest:
   • Michael Brown - Ready for duty after rest period

⚠️ 3 site(s) affected by absences:
   • Aliwal Noord - Coverage may be impacted
   • BA Treasury - Coverage may be impacted
   • Harmony Piggeries - Coverage may be impacted

📊 Daily Summary:
   • 2 guard(s) going off duty
   • 1 guard(s) returning to duty
   • Net change: -1 guards
```

### Coverage Conflicts Tab
**Smart suggestions like:**
```
⚠️ Coverage Conflicts Detected

Aliwal Noord
Joseph Mbewe - 12/20/2024
Conflict: predicted_rest (12/18/2024 - 12/30/2024)

💡 Replacement Suggestions:
1. Michael Brown - Score: 85
   🔫 Firearm 🚗 Driver 📍 Familiar
   Reasoning: Seniority Level 4, Performance 8/10, Fatigue Score 45/100
   [✅ Accept & Assign]

2. Sarah Johnson - Score: 78
   🔫 Firearm 📍 Familiar
   Reasoning: Seniority Level 3, Performance 7/10, Fatigue Score 60/100
   [✅ Accept & Assign]
```

## 🔧 Advanced Configuration

### Intelligence Settings
Modify settings in the `guard_intelligence_settings` table:

```sql
-- Adjust notice period (default: 14 days)
UPDATE guard_intelligence_settings 
SET value = '21' 
WHERE key = 'notice_days';

-- Modify scoring rules
UPDATE guard_intelligence_settings 
SET value = '{"firearm_bonus": 20, "driver_bonus": 15, "site_familiarity_bonus": 5}' 
WHERE key = 'scoring_rules';
```

### Custom Notifications
Implement your notification system in the Edge Function:

```typescript
// In supabase/functions/intelligence-scheduler/index.ts
async function sendNotification(notification: any) {
  // Add your notification logic here:
  // - Firebase Cloud Messaging
  // - OneSignal
  // - Email via Supabase SMTP
  // - SMS via Twilio
  // - Slack webhook
}
```

## 📈 Intelligence Features

### 1. **Predictive Rest Periods**
- Automatically calculates when guards need rest (60-day cycle)
- Flags assignments that conflict with predicted rest periods
- Provides 14-day advance notice

### 2. **Smart Replacement Suggestions**
- AI-powered candidate ranking based on:
  - Firearm certification requirements
  - Driver license requirements
  - Site familiarity (worked there in last 90 days)
  - Seniority level compatibility
  - Performance ratings
  - Fatigue levels
  - Current workload

### 3. **Daily Narrative Reports**
- Human-readable daily summaries
- Shows who's going off duty and returning
- Identifies impacted sites
- Provides net change calculations

### 4. **Automated Alerts**
- Daily analysis at 03:00 SAST
- Coverage conflict detection
- Rest period predictions
- Replacement candidate suggestions

## 🎯 Business Benefits

### Proactive Management
- **14-day advance notice** of coverage issues
- **Predictive analytics** for rest periods
- **Automated suggestions** for replacements

### Operational Efficiency
- **Reduced manual planning** time
- **Optimized guard assignments** based on qualifications
- **Fair workload distribution** across guards

### Risk Mitigation
- **Prevents coverage gaps** before they happen
- **Ensures qualified guards** are assigned to appropriate sites
- **Maintains compliance** with rest period regulations

## 🔍 Troubleshooting

### Common Issues

**1. "No data found" in Daily Reports**
- Ensure you have guard assignments in `shift_assignments` table
- Check that employees have `appointment_date` set
- Verify rest periods are in `leave_periods` table

**2. "No replacement candidates found"**
- Check that employees have required certifications
- Verify site requirements are properly set
- Ensure guards aren't already assigned or on leave

**3. Cron job not running**
- Verify pg_cron extension is enabled
- Check Supabase project reference in cron setup
- Ensure Edge Function is deployed correctly

### Debug Mode
Enable debug logging in the Edge Function:

```typescript
// Add this to the top of intelligence-scheduler/index.ts
const DEBUG = true;

if (DEBUG) {
  console.log('🔍 Debug mode enabled');
}
```

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Review Supabase logs in the Edge Functions section
3. Verify database permissions and RLS policies
4. Test individual components (views, functions) in SQL Editor

## 🎉 Success Metrics

Track these KPIs to measure success:
- **Coverage Gap Reduction**: % decrease in uncovered shifts
- **Planning Time Savings**: Hours saved on manual scheduling
- **Guard Satisfaction**: Improved work-life balance from fair assignments
- **Site Compliance**: % of sites with properly qualified guards

---

**Ready to revolutionize your guard management?** 🚀

The Guard Intelligence System transforms reactive scheduling into proactive, intelligent management. You'll never be caught off-guard by coverage issues again!





