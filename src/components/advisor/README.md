# Work Schedule Management

This directory contains components for managing advisor work schedules.

## Components

### 1. WorkSchedule Page (`workSchedule.tsx`)
Main page for viewing and managing work schedules.

**Features:**
- Display all work schedules in a paginated table
- Search functionality across multiple fields
- Statistics cards showing total schedules, working days, and total hours
- Color-coded day tags for easy identification
- Actions: View, Edit, Delete for each schedule

**Usage:**
```tsx
import WorkSchedule from './pages/advisor/workSchedule';

// In your router
<Route path="/advisor/work-schedule" element={<WorkSchedule />} />
```

### 2. AddWorkSchedule Component (`addWorkSchedule.tsx`)
Modal component for creating new work schedules.

**Features:**
- Single schedule creation
- Bulk schedule creation (multiple schedules at once)
- Time validation (end time must be after start time)
- Dynamic form management for bulk creation
- Duplicate and remove schedule items

**Usage:**
```tsx
import AddWorkSchedule from './components/advisor/addWorkSchedule';

<AddWorkSchedule
  visible={isModalVisible}
  onCancel={() => setIsModalVisible(false)}
  onSuccess={() => {
    // Refresh data
    getAllBookingAvailability();
  }}
/>
```

### 3. EditWorkSchedule Component (`editWorkSchedule.tsx`)
Modal component for editing existing work schedules.

**Features:**
- Pre-fills form with current schedule data
- Shows current schedule details before editing
- Time validation
- Fetches schedule data by ID

**Usage:**
```tsx
import EditWorkSchedule from './components/advisor/editWorkSchedule';

<EditWorkSchedule
  visible={isEditModalVisible}
  onCancel={() => setIsEditModalVisible(false)}
  onSuccess={() => {
    // Refresh data
    getAllBookingAvailability();
  }}
  scheduleId={selectedScheduleId}
/>
```

## API Integration

### Hooks (`useCRUDAdvisor.ts`)
- `useBookingAvailability()` - Fetch paginated work schedules
- `useCreateBookingAvailability()` - Create single schedule
- `useCreateBulkBookingAvailability()` - Create multiple schedules
- `useUpdateBookingAvailability()` - Update existing schedule
- `useDeleteBookingAvailability()` - Delete schedule
- `useGetBookingAvailabilityById()` - Fetch schedule by ID

### API Functions (`AdvisorAPI.ts`)
- `FetchBookingAvailability()` - GET /BookingAvailability
- `CreateBookingAvailability()` - POST /BookingAvailability
- `CreateBulkBookingAvailability()` - POST /BookingAvailability/bulk
- `UpdateBookingAvailability()` - PUT /BookingAvailability/{id}
- `DeleteBookingAvailability()` - DELETE /BookingAvailability/{id}
- `GetBookingAvailabilityById()` - GET /BookingAvailability/{id}

## Data Structure

### BookingAvailability Interface
```typescript
interface BookingAvailability {
  id: number;
  startTime: string; // Format: "HH:mm:ss"
  endTime: string;   // Format: "HH:mm:ss"
  dayInWeek: number; // 1=Monday, 2=Tuesday, ..., 7=Sunday
  staffProfileId: number;
}
```

### Request Interfaces
```typescript
interface CreateBookingAvailabilityRequest {
  startTime: string;
  endTime: string;
  dayInWeek: number;
}

interface UpdateBookingAvailabilityRequest {
  startTime: string;
  endTime: string;
  dayInWeek: number;
}

type CreateBulkBookingAvailabilityRequest = CreateBookingAvailabilityRequest[];
```

## Error Handling

The components handle cases where the backend doesn't return data on successful operations:
- Create operations: If no data returned, consider operation successful
- Update operations: If no data returned, consider operation successful
- Delete operations: If no error thrown, consider operation successful

## Styling

CSS modules are used for styling:
- `workSchedule.module.css` - Main page styling
- Responsive design for mobile devices
- Custom styling for Ant Design components

## Features

### Search and Filtering
- Client-side search across multiple fields
- Pagination support
- Real-time filtering

### Validation
- Time range validation (end time > start time)
- Required field validation
- Form validation with error messages

### User Experience
- Loading states for all operations
- Success/error messages
- Confirmation dialogs for destructive actions
- Responsive design
- Color-coded day indicators
- Duration calculation display 