# Loading Components

This directory contains reusable loading components to provide better user experience throughout the application.

## Components

### LoadingSpinner
A simple loading spinner with customizable message and size.

```tsx
import { LoadingSpinner } from "@/components";

<LoadingSpinner 
    message="Đang tải dữ liệu..." 
    size={40} 
    fullHeight={true} 
/>
```

**Props:**
- `message?: string` - Loading message to display
- `size?: number` - Size of the spinner (default: 40)
- `fullHeight?: boolean` - Whether to take full height (default: false)

### LoadingButton
A button component that shows loading state while performing actions.

```tsx
import { LoadingButton } from "@/components";

<LoadingButton
    onClick={handleSubmit}
    variant="contained"
    loading={submitting}
    loadingText="Đang lưu..."
    disabled={!formData.name}
>
    Lưu
</LoadingButton>
```

**Props:**
- `loading?: boolean` - Whether the button is in loading state
- `loadingText?: string` - Text to show when loading
- All standard Button props

### SkeletonLoader
A skeleton loader for tables, cards, and lists.

```tsx
import { SkeletonLoader } from "@/components";

<SkeletonLoader type="table" rows={8} columns={6} />
<SkeletonLoader type="card" rows={5} />
<SkeletonLoader type="list" rows={10} />
```

**Props:**
- `type: "table" | "card" | "list"` - Type of skeleton to render
- `rows?: number` - Number of rows to show (default: 5)
- `columns?: number` - Number of columns for table type (default: 4)

### LoadingOverlay
A full-screen loading overlay for global loading states.

```tsx
import { LoadingOverlay } from "@/components";

<LoadingOverlay 
    open={isLoading} 
    message="Đang tải dữ liệu..." 
/>
```

**Props:**
- `open: boolean` - Whether the overlay is visible
- `message?: string` - Loading message to display

### LoadingContext
A React context for managing global loading states.

```tsx
import { LoadingProvider, useLoading } from "@/components";

// In your app
<LoadingProvider>
    <YourApp />
</LoadingProvider>

// In components
const { isLoading, setLoading, loadingMessage, setLoadingMessage } = useLoading();
```

## Usage Examples

### Page Loading
```tsx
const [loading, setLoading] = useState(true);

if (loading) {
    return (
        <Box sx={{ p: 3 }}>
            <SkeletonLoader type="table" rows={8} columns={6} />
        </Box>
    );
}
```

### Form Submission
```tsx
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
    try {
        setSubmitting(true);
        await saveData();
    } finally {
        setSubmitting(false);
    }
};

<LoadingButton
    onClick={handleSubmit}
    loading={submitting}
    loadingText="Đang lưu..."
>
    Lưu
</LoadingButton>
```

### Global Loading
```tsx
const { setLoading, setLoadingMessage } = useLoading();

const handleGlobalAction = async () => {
    setLoading(true);
    setLoadingMessage("Đang xử lý...");
    try {
        await performAction();
    } finally {
        setLoading(false);
    }
};
```

## Best Practices

1. **Use skeleton loaders** for initial page loads to show the structure
2. **Use loading buttons** for form submissions and actions
3. **Use loading spinners** for simple loading states
4. **Use loading overlays** for global operations that block the entire UI
5. **Always provide meaningful loading messages** in Vietnamese
6. **Disable form inputs** during submission to prevent multiple submissions
7. **Handle errors gracefully** and provide retry options 