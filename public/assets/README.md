# Logo Files Instructions

## Logo Placement

To use your custom company logo throughout the application, follow these steps:

1. Place your logo file directly in this directory (`public/assets/`)
2. Make sure the file is named exactly `logo-white.png` (case-sensitive)
3. Your logo can be **any color** - it will automatically be rendered as white in the application
4. Use a PNG file with transparency to ensure it displays correctly on colored backgrounds
5. For best results, use a square image with dimensions of at least 512x512 pixels

The logo will automatically appear in:
- The login and signup pages
- The main dashboard header
- The landing page

## Image Requirements

- **Format**: PNG with transparency
- **Name**: `logo-white.png` (exactly as written)
- **Color**: Can be any color - it will be automatically converted to white using CSS
- **Background**: Must be transparent
- **Resolution**: Higher resolution is better (minimum 512x512px recommended)
- **Shape**: Ideally centered with some padding around the edges

## Technical Note

The application uses CSS filters (`brightness(0) invert(1)`) to convert your logo to white regardless of its original color. This ensures it will look great on the blue gradient backgrounds throughout the application.

If you need to replace the logo in the future, simply overwrite this file with your new logo (keeping the same filename).
