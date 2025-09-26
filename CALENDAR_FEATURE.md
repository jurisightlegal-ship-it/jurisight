# Content Calendar Feature

## Overview

The Content Calendar feature allows contributors to schedule articles for future publication and provides a visual calendar interface to manage scheduled content.

## Features

### 1. Calendar View
- **Monthly Grid Layout**: Visual calendar showing scheduled articles by date
- **Article Previews**: Hover and click to view article details
- **Status Indicators**: Color-coded badges showing article status (Draft, In Review, Published, etc.)
- **Navigation**: Previous/Next month navigation and "Today" button

### 2. Article Scheduling
- **DateTime Picker**: Schedule articles for specific date and time
- **Validation**: Prevents scheduling in the past
- **Preview**: Shows formatted scheduled date and time

### 3. Access Control
- **Contributor Access**: Contributors can only see their own scheduled articles
- **Editor/Admin Access**: Can view all scheduled articles from all contributors
- **Role-based Restrictions**: Only contributors and above can access the calendar

## Files Created/Modified

### New Files
- `src/app/api/calendar/route.ts` - API endpoint for calendar data
- `src/app/dashboard/calendar/page.tsx` - Calendar page component
- `test-calendar.js` - Test script for calendar functionality

### Modified Files
- `src/app/dashboard/page.tsx` - Added calendar quick action button
- `src/app/dashboard/articles/new/page.tsx` - Added scheduling form fields
- `src/app/api/articles/route.ts` - Added scheduled_at field support

## Database Schema

The calendar feature uses the existing `scheduled_at` field in the articles table:

```sql
-- Add scheduled_at timestamp column for scheduled publication
ALTER TABLE "articles" ADD COLUMN "scheduled_at" timestamp;
```

## API Endpoints

### GET /api/calendar
Fetches scheduled articles for a specific month.

**Query Parameters:**
- `month` (optional): Month number (1-12), defaults to current month
- `year` (optional): Year, defaults to current year

**Response:**
```json
{
  "calendarData": {
    "2024-01-15": [
      {
        "id": 1,
        "title": "Article Title",
        "slug": "article-slug",
        "status": "DRAFT",
        "scheduledAt": "2024-01-15T10:00:00Z",
        "author": { "name": "Author Name" },
        "section": { "name": "Section Name", "color": "#ff0000" }
      }
    ]
  },
  "month": 1,
  "year": 2024,
  "totalArticles": 1
}
```

## Usage

### For Contributors
1. Navigate to Dashboard → Content Calendar
2. View your scheduled articles in the monthly calendar
3. Click on articles to view details
4. Use "Schedule New Article" to create scheduled content

### For Editors/Admins
1. Access the calendar to see all scheduled articles
2. Monitor content pipeline across all contributors
3. Review scheduled content before publication

## Security

- **Authentication Required**: All calendar endpoints require valid session
- **Role-based Access**: Contributors only see their own articles
- **Input Validation**: Scheduled dates must be in the future
- **SQL Injection Protection**: Uses Supabase's parameterized queries

## Testing

Run the test script to verify functionality:

```bash
node test-calendar.js
```

## Future Enhancements

- **Bulk Scheduling**: Schedule multiple articles at once
- **Recurring Content**: Set up recurring article schedules
- **Email Notifications**: Notify when articles are scheduled to publish
- **Drag & Drop**: Reschedule articles by dragging on calendar
- **Export/Import**: Export calendar data or import from external sources
