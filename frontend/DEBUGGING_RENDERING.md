# Debugging Rendering Issues

## Problem
Only the Model tab is rendering correctly. Other tabs (Planning, Simulation, Data Structure) are not showing content properly.

## Potential Issues

### 1. Component Import/Export Issues
- Check if `Card` and `Badge` are properly exported
- Verify imports in VesselList and BerthStatus

### 2. CSS Not Loading
- Check if CSS files are being imported
- Verify CSS selectors match component classes

### 3. Data Not Loading
- Check if API calls are successful
- Verify data structure matches component expectations

### 4. Component Errors
- Check browser console for React errors
- Look for TypeScript errors in build

## Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Check Console tab for errors
3. Look for:
   - React errors
   - Import errors
   - Type errors

### Step 2: Verify Components Render
1. Add temporary console.logs:
   ```tsx
   export default function VesselList({ vessels }: VesselListProps) {
     console.log('VesselList rendering', vessels);
     // ... rest of component
   }
   ```

### Step 3: Check Network Tab
1. Verify API calls are successful
2. Check response data structure
3. Verify CORS headers

### Step 4: Inspect Elements
1. Right-click on empty section
2. Inspect element
3. Check if components are in DOM
4. Check computed styles

### Step 5: Check Component Props
1. Verify props are being passed correctly
2. Check prop types match expectations
3. Verify default values

## Quick Fixes Applied

1. ✅ Added empty states to VesselList and BerthStatus
2. ✅ Fixed CSS selector specificity
3. ✅ Verified component exports
4. ✅ Added error boundaries

## Next Steps

1. Check browser console for specific errors
2. Verify API is running and accessible
3. Check if data is being fetched correctly
4. Verify Card and Badge components render in isolation
