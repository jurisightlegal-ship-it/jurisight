# Microsoft Clarity Integration

This project includes Microsoft Clarity analytics integration for user behavior tracking and insights.

## Setup Instructions

### 1. Get Your Clarity Project ID

1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Sign in with your Microsoft account
3. Create a new project or use an existing one
4. Copy your Project ID from the project settings

### 2. Configure Environment Variables

Add your Clarity Project ID to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-actual-project-id-here
```

Replace `your-actual-project-id-here` with your actual Clarity project ID.

### 3. Deploy to Production

Make sure to add the environment variable to your production environment (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-actual-project-id-here
```

## Features Implemented

### Automatic Tracking

- **User Authentication**: Tracks login/logout events
- **Article Views**: Tracks when users view articles
- **Custom Tags**: Sets article title and section as custom tags
- **User Identification**: Links Clarity sessions to authenticated users

### Manual Tracking

Use the `useClarity` hook in your components:

```tsx
import { useClarity } from '@/hooks/use-clarity';

function MyComponent() {
  const { trackEvent, setCustomTag, setUserId } = useClarity();

  const handleButtonClick = () => {
    trackEvent('button_click', {
      buttonName: 'subscribe',
      location: 'header'
    });
  };

  const handleUserAction = () => {
    setCustomTag('userType', 'premium');
    trackEvent('premium_feature_used', {
      feature: 'advanced_search'
    });
  };

  return (
    <button onClick={handleButtonClick}>
      Subscribe
    </button>
  );
}
```

## Available Methods

### `trackEvent(eventName, data?)`
Track custom events with optional data.

### `setCustomTag(key, value)`
Set custom tags that persist across the session.

### `setUserId(userId)`
Set the user ID for the current session.

### `identify(userId, sessionId?, pageId?, friendlyName?)`
Identify a user with additional context.

### `consent(consent)`
Set user consent for data collection.

### `upgrade(sessionId, sequenceNumber)`
Upgrade a session (for advanced use cases).

## Events Being Tracked

### Automatic Events

- `user_login` - When a user logs in
- `user_logout` - When a user logs out
- `article_view` - When a user views an article

### Custom Tags

- `articleTitle` - Current article title
- `articleSection` - Current article section
- `userId` - Current user ID

## Privacy Considerations

- Clarity respects user privacy and doesn't collect personal information
- All tracking is anonymous by default
- User IDs are only set for authenticated users
- Custom tags should not contain sensitive information

## Testing

1. Set your Clarity Project ID in `.env.local`
2. Start the development server: `npm run dev`
3. Open your browser's developer console
4. Look for Clarity initialization messages
5. Check the Clarity dashboard for incoming data

## Troubleshooting

### Clarity Not Initializing

- Check that `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set correctly
- Ensure the project ID is not the placeholder value
- Check browser console for error messages

### No Data in Dashboard

- Wait 5-10 minutes for data to appear
- Check that the project ID is correct
- Verify that tracking events are being fired (check console logs)

### Development vs Production

- Make sure to set the environment variable in production
- Test with the actual production URL
- Check that the domain is added to your Clarity project settings
