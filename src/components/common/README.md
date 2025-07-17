# DataImport Component Documentation

## Overview
The `DataImport` component is a reusable, drag-and-drop Excel import component that supports multiple data types with predefined header configurations and TypeScript constraints. The component has been refactored for better maintainability with configurations separated into `src/data/importConfigurations.ts`.

## Architecture

### Component Structure
- **Component**: `src/components/common/dataImport.tsx` - UI logic and file processing
- **Configurations**: `src/data/importConfigurations.ts` - All header configs and types
- **Styling**: `src/css/admin/dataImport.module.css` - Component styling

### Imports Required
```typescript
import DataImport from '../../components/common/dataImport';
// Configuration types are automatically available through the component
```

## Features
- ✅ **Predefined Header Configurations** for common data types
- ✅ **Custom Header Support** for specific use cases
- ✅ **TypeScript Constraints** for type safety
- ✅ **Single or Multiple Row Import** modes
- ✅ **Dynamic Field Mapping** based on configuration
- ✅ **Comprehensive Validation** with user-friendly error messages
- ✅ **Responsive Design** with modern UI
- ✅ **Empty Cell Handling** and data cleaning
- ✅ **Separated Configuration** for better maintainability

## Predefined Header Configurations

### STUDENT
```typescript
headers: ['First Name', 'Last Name', 'Email', 'Password', 'Address', 'Phone', 'Date of Birth', 'Student Code', 'Enroll Date']
fieldMap: {
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Email': 'email',
  'Password': 'password',
  'Address': 'address',
  'Phone': 'phone',
  'Date of Birth': 'dateOfBirth',
  'Student Code': 'studentCode',
  'Enroll Date': 'enrollDate'
}
```

### STAFF
```typescript
headers: ['First Name', 'Last Name', 'Email', 'Password', 'Date of Birth', 'Campus', 'Department', 'Position', 'Start Work Date']
fieldMap: {
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Email': 'email',
  'Password': 'password',
  'Date of Birth': 'dateOfBirth',
  'Campus': 'campus',
  'Department': 'department',
  'Position': 'position',
  'Start Work Date': 'startWorkAt'
}
```

### CURRICULUM
```typescript
headers: ['Program Code', 'Curriculum Code', 'Curriculum Name', 'Effective Date']
fieldMap: {
  'Program Code': 'programCode',
  'Curriculum Code': 'curriculumCode',
  'Curriculum Name': 'curriculumName',
  'Effective Date': 'effectiveDate'
}
```

### SUBJECT
```typescript
headers: ['Subject Code', 'Subject Name', 'Credits', 'Description']
fieldMap: {
  'Subject Code': 'subjectCode',
  'Subject Name': 'subjectName',
  'Credits': 'credits',
  'Description': 'description'
}
```

### PROGRAM
```typescript
headers: ['Program Code', 'Program Name']
fieldMap: {
  'Program Code': 'programCode',
  'Program Name': 'programName'
}
```

### COMBO
```typescript
headers: ['Combo Name', 'Combo Description']
fieldMap: {
  'Combo Name': 'comboName',
  'Combo Description': 'comboDescription'
}
```

### ADMIN_PROFILE
```typescript
headers: ['First Name', 'Last Name', 'Email', 'Password', 'Date of Birth']
fieldMap: {
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Email': 'email',
  'Password': 'password',
  'Date of Birth': 'dateOfBirth'
}
```

## Component Props

```typescript
type DataImportProps = {
  onClose: () => void;
  onDataImported: (data: { [key: string]: string }[]) => void;
  headerConfig: HeaderConfiguration;
  allowMultipleRows?: boolean; // Default: false
  dataType?: string; // Default: 'data'
};

type HeaderConfiguration = HeaderConfigType | CustomHeaderConfig;
type HeaderConfigType = 'STUDENT' | 'STAFF' | 'CURRICULUM' | 'SUBJECT' | 'PROGRAM' | 'COMBO' | 'ADMIN_PROFILE';

interface CustomHeaderConfig {
  headers: string[];
  fieldMap: { [header: string]: string };
}
```

## Configuration Management

### Adding New Predefined Configurations
To add a new predefined configuration, edit `src/data/importConfigurations.ts`:

```typescript
// In HEADER_CONFIGS object
EMPLOYEE: {
  headers: ['Employee ID', 'Full Name', 'Department', 'Salary'],
  fieldMap: {
    'Employee ID': 'empId',
    'Full Name': 'fullName',
    'Department': 'department',
    'Salary': 'salary'
  }
}
```

### Available Helper Functions
```typescript
import { 
  getHeaderConfig, 
  getAvailableHeaderTypes, 
  isValidHeaderType 
} from '../../data/importConfigurations';

// Get configuration object
const config = getHeaderConfig('STUDENT');

// Get all available types
const types = getAvailableHeaderTypes(); // ['STUDENT', 'STAFF', ...]

// Validate header type
const isValid = isValidHeaderType('STUDENT'); // true
```

## Usage Examples

### 1. Using Predefined Configuration (Student Import)
```typescript
import DataImport from '../../components/common/dataImport';

const StudentPage = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleDataImported = (data: { [key: string]: string }[]) => {
    console.log('Imported students:', data);
    // Send data to API
    // data = [
    //   { firstName: 'John', lastName: 'Doe', email: 'john@example.com', ... },
    //   { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', ... }
    // ]
  };

  return (
    <div>
      <button onClick={() => setIsImportOpen(true)}>Import Students</button>
      
      {isImportOpen && (
        <DataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
          headerConfig="STUDENT"
          allowMultipleRows={true}
          dataType="student"
        />
      )}
    </div>
  );
};
```

### 2. Using Custom Headers
```typescript
import { CustomHeaderConfig } from '../../data/importConfigurations';

const customConfig: CustomHeaderConfig = {
  headers: ['Employee ID', 'Full Name', 'Department', 'Salary'],
  fieldMap: {
    'Employee ID': 'empId',
    'Full Name': 'name',
    'Department': 'dept',
    'Salary': 'salary'
  }
};

<DataImport 
  onClose={() => setIsImportOpen(false)} 
  onDataImported={handleDataImported}
  headerConfig={customConfig}
  allowMultipleRows={true}
  dataType="employee"
/>
```

### 3. Admin Profile Import
```typescript
<DataImport 
  onClose={() => setIsImportOpen(false)} 
  onDataImported={handleDataImported}
  headerConfig="ADMIN_PROFILE"
  allowMultipleRows={false}  // Single profile import
  dataType="admin profile"
/>
```

## Excel File Requirements

### File Format
- Must be `.xlsx` format
- First row must contain headers exactly as specified
- Data starts from the second row

### Example Excel Structure for Student Import
| First Name | Last Name | Email | Password | Address | Phone | Date of Birth | Student Code | Enroll Date |
|------------|-----------|-------|----------|---------|-------|---------------|--------------|-------------|
| John | Doe | john@example.com | password123 | 123 Main St | 555-0123 | 1990-01-15 | ST001 | 2023-09-01 |
| Jane | Smith | jane@example.com | password456 | 456 Oak Ave | 555-0456 | 1991-03-22 | ST002 | 2023-09-01 |

## Data Processing Features

### Validation
- ✅ Checks for required headers
- ✅ Validates file format (.xlsx only)
- ✅ Ensures data rows exist
- ✅ Provides detailed error messages

### Data Cleaning
- ✅ Trims whitespace from cell values
- ✅ Filters out completely empty rows
- ✅ Handles null/undefined values
- ✅ Converts values to strings safely

### Output Format
The component returns an array of objects where:
- Keys are the mapped field names (from `fieldMap`)
- Values are cleaned string data from Excel
- Only rows with at least one valid field are included

## Error Handling

The component provides user-friendly error messages for:
- Empty Excel files
- Missing required headers
- Invalid file formats
- No valid data rows

## Styling

The component uses CSS modules with responsive design:
- Modern glassmorphism effect
- Responsive breakpoints for mobile devices
- Drag-and-drop visual feedback
- Error state styling

## TypeScript Benefits

### Type Safety
```typescript
// ✅ Valid - predefined configuration
<DataImport headerConfig="STUDENT" />

// ✅ Valid - custom configuration
<DataImport headerConfig={{ headers: [...], fieldMap: {...} }} />

// ❌ Invalid - TypeScript error
<DataImport headerConfig="INVALID_TYPE" />
```

### IntelliSense Support
- Auto-completion for predefined header types
- Type checking for custom configurations
- Clear prop documentation

## Best Practices

1. **Always specify `dataType`** for better user experience
2. **Use `allowMultipleRows={true}`** for batch imports
3. **Provide clear error handling** in `onDataImported`
4. **Validate data server-side** after import
5. **Use predefined configurations** when possible for consistency
6. **Add new configurations** to the central config file for reusability

## Maintenance & Updates

### To Add New Header Configurations:
1. Edit `src/data/importConfigurations.ts`
2. Add new configuration to `HEADER_CONFIGS`
3. TypeScript will automatically update the types
4. Update this documentation

### To Modify Existing Configurations:
1. Update the configuration in `src/data/importConfigurations.ts`
2. Test all components using that configuration
3. Update documentation if needed

## Future Enhancements

- [ ] CSV format support
- [ ] Real-time preview of imported data
- [ ] Column mapping interface for mismatched headers
- [ ] Progress indicators for large files
- [ ] Data validation rules (e.g., email format)
- [ ] Export template functionality
- [ ] Configuration versioning for backward compatibility 