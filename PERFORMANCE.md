# Performance Optimization Guide for tSa Admin Hub

This guide provides tips and best practices for maintaining optimal performance in the tSa Admin Hub application.

## Performance Monitoring

We've added a built-in performance monitor that you can toggle with `Alt+P`. This will display:
- Current FPS (frames per second)
- Memory usage (if available)
- Render times

## Common Performance Issues

If you're experiencing lag or slowness, here are some potential causes and solutions:

### 1. Database Connection Issues

The application connects to Supabase for authentication and data. Performance issues might be related to:

- **Too many requests**: Ensure you're not making redundant database calls
- **Large datasets**: Implement pagination for large data tables
- **Network latency**: Consider using a Supabase instance in a region closer to your users

### 2. React Rendering

Excessive re-renders can cause performance issues:

- Use React DevTools to identify components that re-render too often
- Implement `React.memo()` for components that don't need to re-render with every state change
- Use `useCallback()` and `useMemo()` for functions and values that don't need to be recalculated

### 3. Authentication Overhead

Supabase authentication can sometimes cause performance issues:

- We've optimized AuthContext to reduce unnecessary profile fetches
- The refreshProfile function is now called only when necessary
- Session initialization happens only once

## Implemented Optimizations

We've already implemented several optimizations:

1. **Optimized AuthContext**:
   - Reduced unnecessary profile fetches
   - Implemented caching for department data
   - Improved state updates to reduce render cycles

2. **Enhanced Role-Based Routing**:
   - Memoized permission checks
   - Added debounce for profile refreshes
   - Used React.memo to prevent unnecessary renders

3. **React Query Optimizations**:
   - Disabled refetching on window focus
   - Set appropriate stale times for query data
   - Limited retry attempts to reduce server load

4. **General Performance Improvements**:
   - Added performance monitoring tools
   - Optimized Vite configuration for faster development
   - Implemented lazy loading for components (when appropriate)

## Additional Recommendations

### For Developers

1. **Code Splitting**:
   - Use dynamic imports to split code into manageable chunks
   - Implement React.lazy() for route components

2. **Asset Optimization**:
   - Compress and optimize images
   - Use SVGs for icons where possible
   - Consider using a CDN for static assets

3. **State Management**:
   - Keep state as local as possible
   - Consider using React Query for server state
   - Avoid storing large objects in state

### For Deployment

1. **Production Build**:
   - Always use the production build in deployment
   - Enable gzip/Brotli compression on your server
   - Implement proper caching headers

2. **Supabase Configuration**:
   - Use Row Level Security (RLS) efficiently
   - Index frequently queried columns
   - Use prepared statements for complex queries

3. **Monitoring**:
   - Set up monitoring for API endpoints
   - Track Supabase usage to avoid hitting limits
   - Monitor client-side performance with tools like Google Lighthouse

## Specific Supabase Recommendations

1. **Batch Operations**:
   - Use .upsert() for batch operations instead of multiple .insert() calls
   - Leverage Supabase's .in() filter for fetching multiple records at once

2. **Subscriptions**:
   - Be cautious with real-time subscriptions, as they can consume resources
   - Unsubscribe from unnecessary subscriptions when components unmount

3. **PostgreSQL Functions**:
   - Consider using PostgreSQL functions for complex operations
   - This can reduce round trips between client and server

## Troubleshooting

If you're still experiencing performance issues:

1. **Identify the bottleneck**:
   - Is it network requests? (Check Network tab in DevTools)
   - Is it JavaScript execution? (Check Performance tab in DevTools)
   - Is it rendering? (Check React Profiler)

2. **Reduce complexity**:
   - Simplify complex components
   - Implement virtualization for long lists
   - Consider paginating or lazy loading data

3. **Optimize development workflow**:
   - Use Fast Refresh effectively
   - Consider using a more powerful development machine
   - Close unnecessary browser tabs and applications

---

Remember that performance optimization should be data-driven. Measure first, then optimize where it matters most! 