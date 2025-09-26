# 🚀 Custom Preloader System

A comprehensive, system-wide preloader solution for the Jurisight application with smooth animations, multiple variants, and intelligent loading states.

## ✨ Features

- **Multiple Variants**: Default, Minimal, and Fullscreen loading states
- **Progress Tracking**: Real-time progress bars for long-running operations
- **API Integration**: Automatic loading states for API calls
- **Navigation Loading**: Page transition loading with smooth animations
- **Global State Management**: Centralized loading state control
- **TypeScript Support**: Fully typed with excellent developer experience
- **Responsive Design**: Works seamlessly across all device sizes
- **Customizable**: Easy to customize messages, colors, and animations

## 🎯 Components

### 1. Preloader Component (`/src/components/ui/preloader.tsx`)

The main preloader component with three variants:

```tsx
import { Preloader } from '@/components/ui/preloader';

// Basic usage
<Preloader 
  isLoading={true} 
  message="Loading..." 
  variant="default" 
/>

// With progress
<Preloader 
  isLoading={true} 
  message="Processing..." 
  progress={75} 
  showProgress={true} 
/>

// Fullscreen variant
<Preloader 
  isLoading={true} 
  message="Loading page..." 
  variant="fullscreen" 
/>
```

**Props:**
- `isLoading`: Boolean to show/hide preloader
- `message`: Loading message text
- `progress`: Progress percentage (0-100)
- `variant`: 'default' | 'minimal' | 'fullscreen'
- `showProgress`: Show progress bar
- `showMessage`: Show loading message
- `className`: Additional CSS classes

### 2. Preloader Provider (`/src/components/providers/preloader-provider.tsx`)

Global state management for loading states:

```tsx
import { PreloaderProvider } from '@/components/providers/preloader-provider';

// Wrap your app
<PreloaderProvider>
  <YourApp />
</PreloaderProvider>
```

### 3. Loading Hooks (`/src/hooks/use-loading.ts`)

Custom hooks for easy loading state management:

```tsx
import { usePreloader, useAPILoading } from '@/hooks/use-loading';

function MyComponent() {
  const { setLoading, hideLoading, showPageTransition } = usePreloader();
  const { fetchWithLoading, fetchWithProgress } = useAPILoading();

  // Basic loading
  const handleClick = () => {
    setLoading(true, { message: 'Processing...' });
    // Do something
    hideLoading();
  };

  // API loading
  const fetchData = async () => {
    const data = await fetchWithLoading('/api/data', {}, {
      message: 'Loading data...'
    });
  };
}
```

## 🎨 Variants

### Default Variant
- White background with backdrop blur
- Centered spinner and message
- Perfect for overlays and modals

### Minimal Variant
- Compact design for inline loading
- Smaller spinner and text
- Ideal for buttons and small components

### Fullscreen Variant
- Dark gradient background
- Large animated logo
- Floating particles animation
- Perfect for page transitions

## 🔧 Usage Examples

### 1. Basic Loading State

```tsx
import { usePreloader } from '@/hooks/use-loading';

function MyComponent() {
  const { setLoading, hideLoading } = usePreloader();

  const handleSubmit = async () => {
    setLoading(true, { 
      message: 'Submitting form...',
      variant: 'default'
    });
    
    try {
      await submitForm();
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### 2. API Calls with Loading

```tsx
import { useAPILoading } from '@/hooks/use-loading';

function ArticlesList() {
  const { fetchWithLoading } = useAPILoading();
  const [articles, setArticles] = useState([]);

  const loadArticles = async () => {
    const data = await fetchWithLoading(
      '/api/articles',
      {},
      { message: 'Loading articles...' }
    );
    setArticles(data.articles);
  };

  return <div>...</div>;
}
```

### 3. Progress Loading

```tsx
import { usePreloader } from '@/hooks/use-loading';

function FileUpload() {
  const { setLoading, setProgress, hideLoading } = usePreloader();

  const uploadFile = async (file) => {
    setLoading(true, {
      message: 'Uploading file...',
      showProgress: true,
      progress: 0
    });

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }

    hideLoading();
  };

  return <input type="file" onChange={uploadFile} />;
}
```

### 4. Page Transitions

```tsx
import { useEnhancedRouter } from '@/components/navigation-wrapper';

function Navigation() {
  const router = useEnhancedRouter();

  return (
    <button onClick={() => router.push('/articles')}>
      Go to Articles
    </button>
  );
}
```

## 🎯 Integration Points

### 1. Layout Integration

The preloader is integrated into the main layout:

```tsx
// src/app/layout.tsx
<PreloaderProvider>
  <NavigationWrapper>
    {children}
  </NavigationWrapper>
</PreloaderProvider>
```

### 2. Page Integration

Pages automatically get loading states for:
- Initial page load
- Navigation between pages
- API calls
- Form submissions

### 3. Component Integration

Components can use the preloader hooks for:
- Button loading states
- Form submission feedback
- Data fetching indicators
- User action feedback

## 🎨 Customization

### Colors and Styling

The preloader uses CSS custom properties for easy theming:

```css
:root {
  --preloader-primary: #3b82f6;
  --preloader-secondary: #1e40af;
  --preloader-background: rgba(255, 255, 255, 0.95);
  --preloader-text: #1f2937;
}
```

### Animation Timing

Customize animation durations:

```tsx
<Preloader 
  isLoading={true}
  message="Loading..."
  // Animations are controlled by Framer Motion
  // Duration can be customized in the component
/>
```

## 🧪 Testing

### Test Page

Visit `/test-preloader` to test all preloader variants and functionality.

### Manual Testing

1. **Basic Loading**: Click "Test Basic Loading"
2. **Fullscreen**: Click "Test Fullscreen"
3. **Progress**: Click "Test Progress"
4. **API Loading**: Click "Test API Loading"
5. **Navigation**: Navigate between pages

## 📱 Responsive Behavior

- **Mobile**: Optimized touch interactions and sizing
- **Tablet**: Balanced layout and animations
- **Desktop**: Full feature set with smooth animations

## 🔄 State Management

The preloader system uses React Context for global state management:

- **Loading State**: Boolean for show/hide
- **Message**: Current loading message
- **Progress**: Progress percentage (0-100)
- **Variant**: Current preloader variant
- **Options**: Additional display options

## 🚀 Performance

- **Lazy Loading**: Components load only when needed
- **Optimized Animations**: Hardware-accelerated CSS animations
- **Memory Efficient**: Proper cleanup and state management
- **Bundle Size**: Minimal impact on bundle size

## 🛠️ Development

### Adding New Variants

1. Add variant to the `PreloaderProps` interface
2. Add styling to the `variants` object
3. Update the component logic

### Custom Animations

The preloader uses Framer Motion for animations. Customize by modifying the motion components in the preloader component.

## 📚 API Reference

### usePreloader Hook

```tsx
const {
  isLoading,           // Current loading state
  message,            // Current message
  progress,           // Current progress
  setLoading,         // Set loading state
  setMessage,         // Update message
  setProgress,        // Update progress
  showPageTransition, // Show page transition
  showAPILoading,     // Show API loading
  showInlineLoading,  // Show inline loading
  hideLoading         // Hide loading
} = usePreloader();
```

### useAPILoading Hook

```tsx
const {
  fetchWithLoading,   // Fetch with basic loading
  fetchWithProgress   // Fetch with progress updates
} = useAPILoading();
```

## 🎉 Benefits

1. **Consistent UX**: Uniform loading experience across the app
2. **Better Feedback**: Users always know what's happening
3. **Professional Feel**: Smooth animations and transitions
4. **Easy Integration**: Simple hooks and components
5. **Flexible**: Multiple variants for different use cases
6. **Type Safe**: Full TypeScript support
7. **Performance**: Optimized for smooth performance

The preloader system provides a comprehensive solution for all loading states in the Jurisight application, ensuring a professional and consistent user experience across all interactions.
