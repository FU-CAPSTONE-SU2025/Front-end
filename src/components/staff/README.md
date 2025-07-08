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

# Staff Syllabus Components

This directory contains modular components for the syllabus management functionality. The components have been extracted from the main `subjectSyllabus.tsx` page to improve maintainability and reusability.

## Components

### AssessmentTable
- **File**: `AssessmentTable.tsx`
- **Purpose**: Manages syllabus assessments with CRUD operations and Excel import
- **Features**:
  - Display assessments in a table format
  - Add new assessments via modal
  - Edit assessments inline
  - Delete assessments
  - Import assessments from Excel
  - Inline editing with save/cancel functionality

### MaterialTable
- **File**: `MaterialTable.tsx`
- **Purpose**: Manages learning materials with CRUD operations and Excel import
- **Features**:
  - Display learning materials in a table format
  - Add new materials via modal
  - Edit materials inline
  - Delete materials
  - Import materials from Excel
  - Date picker for published dates

### OutcomeTable
- **File**: `OutcomeTable.tsx`
- **Purpose**: Manages learning outcomes with CRUD operations and Excel import
- **Features**:
  - Display learning outcomes in a table format
  - Add new outcomes via modal
  - Edit outcomes inline
  - Delete outcomes
  - Import outcomes from Excel

### SessionTable
- **File**: `SessionTable.tsx`
- **Purpose**: Manages course sessions with CRUD operations, Excel import, and outcome assignment
- **Features**:
  - Display sessions in a table format
  - Add new sessions via modal
  - Edit sessions inline
  - Delete sessions
  - Import sessions from Excel
  - Add outcomes to sessions
  - Display assigned outcomes per session

## Usage

All components follow a similar pattern and accept the following props:

```typescript
interface TableProps {
  data: EntityType[];           // Array of entities to display
  isEditing: boolean;           // Whether the table is in edit mode
  onAdd: (entity: CreateEntityType) => Promise<void>;     // Add handler
  onDelete: (id: number) => void;                         // Delete handler
  onUpdate: (id: number, entity: Partial<EntityType>) => void; // Update handler
  // Additional props specific to each component...
}
```

### Example Usage

```tsx
import AssessmentTable from '../../components/staff/AssessmentTable';

// In your main component
<AssessmentTable
  assessments={syllabus?.assessments || []}
  isEditing={isEditing}
  onAddAssessment={handleAddAssessment}
  onDeleteAssessment={(id) => handleDeleteItem('assessment', id)}
  onUpdateAssessment={handleUpdateAssessment}
/>
```

## Benefits of Modularization

1. **Maintainability**: Each component is focused on a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Testability**: Each component can be tested independently
4. **Code Organization**: Easier to navigate and understand the codebase
5. **Performance**: Smaller components can be optimized individually

## File Structure

```
src/components/staff/
├── AssessmentTable.tsx    # Assessment management
├── MaterialTable.tsx      # Learning material management
├── OutcomeTable.tsx       # Learning outcome management
├── SessionTable.tsx       # Session management
└── README.md             # This documentation
```

## Dependencies

All components depend on:
- Ant Design components (`Table`, `Modal`, `Form`, etc.)
- React hooks (`useState`, `useEffect`)
- Custom interfaces from `../../interfaces/ISchoolProgram`
- Data import component from `../common/dataImport`
- Import configurations from `../../data/importConfigurations`
- CSS modules from `../../css/staff/staffEditSyllabus.module.css`

## Future Enhancements

1. **Delete Mutations**: Implement actual delete API calls instead of TODO placeholders
2. **Update Mutations**: Implement actual update API calls instead of TODO placeholders
3. **Session-Outcome Mapping**: Replace mocked outcomes display with real backend data
4. **Bulk Operations**: Add bulk delete/edit functionality
5. **Advanced Filtering**: Add search and filter capabilities
6. **Export Functionality**: Add export to Excel/PDF features 