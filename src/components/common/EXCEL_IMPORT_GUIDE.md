# Excel Import Guide for Bulk Account Creation

This guide explains how to prepare Excel files for bulk importing different types of accounts (Students, Staff, Managers, Advisors, and Admins) into the system.

## Overview

The bulk import feature supports creating multiple accounts at once from Excel files. The system automatically detects the account type based on the headers in your Excel file and transforms the data into the proper nested structure required by the backend.

## Supported Account Types

### 1. Student Accounts
**File Headers Required:**
- `firstName` - Student's first name
- `lastName` - Student's last name  
- `email` - Student's email address
- `password` - Account password (optional, defaults to 'defaultPassword123')
- `dateOfBirth` - Date of birth (YYYY-MM-DD format)
- `enrolledAt` - Enrollment date (YYYY-MM-DD format)
- `careerGoal` - Student's career goal (optional, defaults to 'Not specified')

**Example Excel Row:**
```
firstName | lastName | email | password | dateOfBirth | enrolledAt | careerGoal
John      | Doe      | john.doe@email.com | pass123 | 2000-01-15 | 2024-09-01 | Software Engineer
```

**Data Structure:**
- Main account data goes into the base account object
- Student-specific data (`enrolledAt`, `careerGoal`) goes into `studentProfileData`
- `staffProfileData` is set to `null`

### 2. Staff Accounts (Academic Staff)
**File Headers Required:**
- `firstName` - Staff member's first name
- `lastName` - Staff member's last name
- `email` - Staff member's email address
- `password` - Account password (optional, defaults to 'defaultPassword123')
- `dateOfBirth` - Date of birth (YYYY-MM-DD format)
- `campus` - Campus location
- `department` - Department name
- `position` - Job position/title
- `startWorkAt` - Start date (YYYY-MM-DD format)

**Example Excel Row:**
```
firstName | lastName | email | password | dateOfBirth | campus | department | position | startWorkAt
Jane      | Smith    | jane.smith@email.com | pass456 | 1985-05-20 | Main Campus | Computer Science | Lecturer | 2020-08-01
```

**Data Structure:**
- Main account data goes into the base account object
- Staff-specific data (`campus`, `department`, `position`, `startWorkAt`) goes into `staffProfileData`
- `studentProfileData` is set to `null`

### 3. Manager Accounts
**File Headers Required:**
- `firstName` - Manager's first name
- `lastName` - Manager's last name
- `email` - Manager's email address
- `password` - Account password (optional, defaults to 'defaultPassword123')
- `dateOfBirth` - Date of birth (YYYY-MM-DD format)
- `campus` - Campus location
- `department` - Department name
- `position` - Job position/title
- `startWorkAt` - Start date (YYYY-MM-DD format)

**Data Structure:**
- Same as Staff accounts, but with role set to 'Manager'

### 4. Advisor Accounts
**File Headers Required:**
- `firstName` - Advisor's first name
- `lastName` - Advisor's last name
- `email` - Advisor's email address
- `password` - Account password (optional, defaults to 'defaultPassword123')
- `dateOfBirth` - Date of birth (YYYY-MM-DD format)
- `campus` - Campus location
- `department` - Department name
- `position` - Job position/title
- `startWorkAt` - Start date (YYYY-MM-DD format)

**Data Structure:**
- Same as Staff accounts, but with role set to 'Advisor'

### 5. Admin Accounts
**File Headers Required:**
- `firstName` - Admin's first name
- `lastName` - Admin's last name
- `email` - Admin's email address
- `password` - Account password (optional, defaults to 'defaultPassword123')
- `dateOfBirth` - Date of birth (YYYY-MM-DD format)

**Example Excel Row:**
```
firstName | lastName | email | password | dateOfBirth
Admin     | User     | admin@email.com | adminpass | 1990-12-25
```

**Data Structure:**
- Main account data goes into the base account object
- Both `studentProfileData` and `staffProfileData` are set to `null`

## Data Transformation Process

### 1. Excel Import
- Upload Excel file with appropriate headers
- System automatically detects account type based on headers
- Data is processed row by row

### 2. Preview & Edit
- System shows flattened data for easy editing
- You can edit individual cells, delete rows, or select multiple rows
- Changes are applied to the preview data

### 3. Data Transformation
- System transforms flat Excel data into nested structure:
  - **Students**: `studentProfileData` contains `enrolledAt` and `careerGoal`
  - **Staff/Managers/Advisors**: `staffProfileData` contains `campus`, `department`, `position`, `startWorkAt`
  - **Admins**: No profile data (both set to null)

### 4. API Submission
- Transformed data is sent to appropriate bulk registration API
- Each account type uses its specific API endpoint
- System provides feedback on success/failure

## Important Notes

### Header Flexibility
The system supports flexible header matching:
- Case-insensitive matching
- Spaces, underscores, and hyphens are ignored
- Common variations are automatically recognized

**Examples of accepted headers:**
- `firstName`, `FirstName`, `first_name`, `first-name`, `First Name`
- `dateOfBirth`, `DateOfBirth`, `date_of_birth`, `date-of-birth`, `Date Of Birth`

### Required Fields
All account types require:
- `firstName` (non-empty)
- `lastName` (non-empty)
- `email` (non-empty)

### Optional Fields
- `password`: If not provided, defaults to 'defaultPassword123'
- `username`: If not provided, defaults to email prefix (before @)
- `dateOfBirth`: If not provided, defaults to current date
- Role-specific fields: Have sensible defaults if not provided

### Data Validation
- Empty rows are automatically skipped
- Rows with missing required fields are filtered out
- Date fields are validated and converted to proper Date objects
- Email format is validated

### Error Handling
- Detailed error messages for validation failures
- Progress tracking during bulk operations
- Summary report showing success/failure counts by account type

## Best Practices

1. **Use consistent date formats** (YYYY-MM-DD recommended)
2. **Ensure email addresses are valid** and unique
3. **Test with small datasets** before large imports
4. **Review preview data** before final import
5. **Keep backup of original Excel files**
6. **Use descriptive headers** for better data identification

## Troubleshooting

### Common Issues
1. **"Missing required headers"** - Check that all required headers are present
2. **"No valid data found"** - Ensure at least one row has data in required fields
3. **"Unknown data type"** - Verify headers match one of the supported account types
4. **Import failures** - Check for duplicate emails or invalid data formats

### Getting Help
- Review the preview data carefully before importing
- Check the console for detailed error messages
- Ensure your Excel file follows the format guidelines above
- Contact system administrator for persistent issues 