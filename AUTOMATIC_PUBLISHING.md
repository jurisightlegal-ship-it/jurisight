# Automatic Publishing System

## Overview

The Jurisight blog now includes an automatic publishing system that allows articles to be scheduled for future publication. When the scheduled time arrives, articles are automatically published without manual intervention.

## How It Works

### 1. Scheduling Articles

When creating or editing an article, users can set a `scheduled_at` timestamp:

- **Location**: Article creation/edit form
- **Field**: "Schedule Publication" section
- **Input**: `datetime-local` input field
- **Validation**: Must be a future date/time

### 2. Automatic Publishing Process

The system includes several components for automatic publishing:

#### API Endpoint: `/api/publish-scheduled`
- **Method**: POST (for actual publishing)
- **Method**: GET (for read-only checking)
- **Authentication**: Requires API key (`x-api-key` header)
- **Function**: Finds and publishes articles where `scheduled_at <= current_time`

#### Cron Job Script: `scripts/publish-scheduled.js`
- **Purpose**: Executes the publishing check
- **Frequency**: Once daily at 9:00 AM UTC (Vercel Hobby plan compatible)
- **Dependencies**: Node.js, API endpoint
- **Logging**: Detailed console output

#### Vercel Cron Configuration: `vercel.json`
- **Purpose**: Automatic execution on Vercel platform
- **Schedule**: Once daily at 9:00 AM UTC (`0 9 * * *`)
- **Endpoint**: `/api/publish-scheduled`
- **Note**: Compatible with Vercel Hobby plan (daily cron jobs only)

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# API key for cron job authentication
CRON_API_KEY=your-secret-api-key-here

# App URL for cron job requests
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Database Schema

Ensure your `articles` table has the `scheduled_at` column:

```sql
ALTER TABLE "articles" ADD COLUMN "scheduled_at" timestamp;
CREATE INDEX "idx_articles_scheduled_at" ON "articles" ("scheduled_at");
```

### 3. Deployment Options

#### Option A: Vercel Cron (Recommended)
- Deploy to Vercel
- The `vercel.json` file automatically sets up cron jobs
- No additional configuration needed

#### Option B: External Cron Service
- Use services like GitHub Actions, AWS Lambda, or traditional cron
- Set up to call `/api/publish-scheduled` every 5 minutes
- Include the API key in the request headers

#### Option C: Manual Execution
- Run `node scripts/publish-scheduled.js` manually
- Useful for testing and debugging

## Testing

### 1. Test Script
Run the included test script:

```bash
node test-publish-scheduled.js
```

### 2. Manual Testing
1. Create an article with a past scheduled time
2. Call the API endpoint directly
3. Verify the article status changes to "PUBLISHED"

### 3. API Testing
```bash
# Check for scheduled articles (read-only)
curl -X GET http://localhost:3000/api/publish-scheduled

# Publish scheduled articles
curl -X POST http://localhost:3000/api/publish-scheduled \
  -H "x-api-key: your-secret-api-key"
```

## Features

### ✅ Implemented
- [x] Article scheduling in creation/edit forms
- [x] Automatic publishing API endpoint
- [x] Cron job script for regular execution
- [x] Vercel cron configuration
- [x] API key authentication
- [x] Comprehensive logging
- [x] Error handling and recovery
- [x] Test scripts and documentation

### 🔄 Process Flow
1. User creates article with `scheduled_at` timestamp
2. Article is saved with status "DRAFT"
3. Cron job runs every 5 minutes
4. System checks for articles where `scheduled_at <= now`
5. Matching articles are updated to status "PUBLISHED"
6. `published_at` timestamp is set to current time

### 📊 Monitoring
- Console logs show publishing activity
- API returns detailed response with published article count
- Error handling prevents system failures
- Timeout protection (30 seconds)

## Security

- API key authentication required
- Only processes articles with valid scheduled times
- Prevents unauthorized publishing
- Rate limiting through cron frequency

## Troubleshooting

### Common Issues

1. **Articles not publishing**
   - Check if cron job is running
   - Verify API key is correct
   - Check database connection
   - Review server logs

2. **API key errors**
   - Ensure `CRON_API_KEY` is set in environment
   - Verify API key matches in requests

3. **Database errors**
   - Check if `scheduled_at` column exists
   - Verify database permissions
   - Review Supabase logs

### Debug Commands

```bash
# Test the API endpoint
node test-publish-scheduled.js

# Check scheduled articles manually
curl -X GET http://localhost:3000/api/publish-scheduled

# Run publishing manually
curl -X POST http://localhost:3000/api/publish-scheduled \
  -H "x-api-key: your-secret-api-key"
```

## Future Enhancements

- [ ] Email notifications when articles are published
- [ ] Bulk scheduling interface
- [ ] Publishing analytics and reporting
- [ ] Timezone support for scheduling
- [ ] Preview mode for scheduled articles
- [ ] Publishing queue management

---

**Note**: The automatic publishing system is now fully functional and ready for production use! 🚀
