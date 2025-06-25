# Staff Edit Components

This directory contains the modular edit components for the staff data management system.

## Overview

The editData system is a modular approach to handle CRUD operations for different data types in the staff section. The main page (`/staff/editData/:type/:id?`) dynamically loads the appropriate component based on the `type` parameter and handles create/edit modes based on the presence of the `id` parameter.

## Components

### 1. CurriculumEdit
- **Route**: `/staff/editData/curriculum` (create) or `/staff/editData/curriculum/:id` (edit)
- **Data Type**: Curriculum
- **Fields**:
  - Program (dropdown, disabled in edit mode)
  - Curriculum Code (disabled in edit mode)
  - Curriculum Name
  - Effective Date

### 2. SubjectEdit
- **Route**: `/staff/editData/subject` (create) or `/staff/editData/subject/:id` (edit)
- **Data Type**: Subject
- **Fields**:
  - Subject Code (disabled in edit mode)
  - Subject Name
  - Credits (1-6)
  - Description

### 3. ProgramEdit
- **Route**: `/staff/editData/program` (create) or `/staff/editData/program/:id` (edit)
- **Data Type**: Program
- **Fields**:
  - Program Code (disabled in edit mode)
  - Program Name

### 4. ComboEdit
- **Route**: `/staff/editData/combo` (create) or `/staff/editData/combo/:id` (edit)
- **Data Type**: Combo
- **Fields**:
  - Combo Name
  - Description
  - Subject Selection (multiple select)

## Usage Examples

### Creating a new curriculum:
```javascript
navigate('/staff/editData/curriculum');
```

### Editing an existing curriculum:
```javascript
navigate('/staff/editData/curriculum/1');
```

### Creating a new subject:
```javascript
navigate('/staff/editData/subject');
```

### Editing an existing subject:
```javascript
navigate('/staff/editData/subject/2');
```

## Features

- **Form Validation**: Each component includes comprehensive form validation
- **Loading States**: All components show loading states during operations
- **Error Handling**: Proper error messages for failed operations
- **Success Feedback**: Success messages for completed operations
- **Responsive Design**: All components are responsive and follow the app's design system
- **Data Persistence**: In edit mode, forms are pre-populated with existing data
- **Delete Functionality**: Edit mode includes delete buttons for removing records

## Styling

All components use the existing staff styling system (`staffTranscript.module.css`) and follow the app's design patterns:
- Consistent color scheme (#1E40AF primary, #f97316 accent)
- Rounded corners and modern UI elements
- Proper spacing and typography
- Glassmorphism effects with backdrop blur

## Data Flow

1. **Create Mode**: Form starts empty, user fills in required fields
2. **Edit Mode**: Form loads existing data, user can modify fields
3. **Validation**: Client-side validation ensures data integrity
4. **Submission**: Data is processed and success/error feedback is shown
5. **Navigation**: Users can navigate back to the appropriate listing page

## Future Enhancements

- Real API integration (currently using mock data)
- Bulk operations
- Advanced validation rules
- File upload capabilities
- Audit logging
- Permission-based field access 