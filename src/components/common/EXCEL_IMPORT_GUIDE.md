# Excel Data Import Guide

## Overview

The system provides comprehensive Excel data import functionality to quickly add large amounts of data. There are two main import options:

1. **Single Type Import** - Import one data type at a time with preview and editing
2. **Bulk Import** - Import multiple data types from multiple files at once with advanced preview

## 🆕 New Preview & Edit Features

### **Quality Assurance Preview**
Both import types now include comprehensive preview functionality:

- **📊 Data Preview** - See exactly what data will be imported
- **✏️ Inline Editing** - Edit individual cells before import
- **🗑️ Row Management** - Delete individual or multiple rows
- **✅ Bulk Selection** - Select multiple rows for bulk operations
- **📋 Import Summary** - Review final data before confirming

### **Preview Workflow**
1. **Upload File** → Drag & drop Excel file
2. **Preview Data** → Review and edit imported data
3. **Confirm Import** → Final confirmation before backend processing

## Available Import Locations

### Admin Pages
- **Students** (`/admin/students`) - Import student data
- **Staff** (`/admin/staff`) - Import staff data  
- **Managers** (`/admin/managers`) - Import manager data
- **Advisors** (`/admin/advisors`) - Import advisor data
- **Account** (`/admin/account`) - Import admin profile data

### Staff Pages
- **Subjects** (`/staff/subject`) - Import subject data
- **Programs** (`/staff/program`) - Import program data
- **Curriculum** (`/staff/curriculum`) - Import curriculum data

### Manager Pages
- **Subjects** (`/manager/subject`) - Import subject data
- **Combos** (`/manager/combo`) - Import combo data

## Data Type Configurations

### Student Import
**Headers Required:**
- First Name
- Last Name
- Email
- Password
- Address
- Phone
- Date of Birth
- Student Code
- Enroll Date

**Example Excel:**
| First Name | Last Name | Email | Password | Address | Phone | Date of Birth | Student Code | Enroll Date |
|------------|-----------|-------|----------|---------|-------|---------------|--------------|-------------|
| John | Doe | john@example.com | password123 | 123 Main St | 555-0123 | 1990-01-15 | ST001 | 2023-09-01 |

### Staff Import
**Headers Required:**
- First Name
- Last Name
- Email
- Password
- Address
- Phone
- Date of Birth
- Campus
- Department
- Position
- Start Work Date

**Example Excel:**
| First Name | Last Name | Email | Password | Address | Phone | Date of Birth | Campus | Department | Position | Start Work Date |
|------------|-----------|-------|----------|---------|-------|---------------|--------|------------|----------|-----------------|
| Jane | Smith | jane@example.com | password456 | 456 Oak Ave | 555-0456 | 1985-03-22 | HCMC Campus | IT | Lecturer | 2020-01-15 |

### Subject Import
**Headers Required:**
- Subject Code
- Subject Name
- Credits
- Description

**Example Excel:**
| Subject Code | Subject Name | Credits | Description |
|--------------|--------------|---------|-------------|
| SE101 | Introduction to Software Engineering | 3 | Basic concepts of software engineering |
| SE102 | Object-Oriented Programming | 4 | Learn OOP principles and practices |

### Program Import
**Headers Required:**
- Program Code
- Program Name

**Example Excel:**
| Program Code | Program Name |
|--------------|--------------|
| SE | Software Engineering |
| CE | Computer Engineering |

### Combo Import
**Headers Required:**
- Combo Name
- Combo Description

**Example Excel:**
| Combo Name | Combo Description |
|------------|-------------------|
| SE_COM1 | Software Engineering Core Subjects |
| SE_COM2 | Advanced Software Engineering |

### Curriculum Import
**Headers Required:**
- Program Code
- Curriculum Code
- Curriculum Name
- Effective Date

**Example Excel:**
| Program Code | Curriculum Code | Curriculum Name | Effective Date |
|--------------|-----------------|-----------------|----------------|
| SE | SE2024 | Software Engineering 2024 | 2024-09-01 |

## How to Use Single Type Import

### Step 1: Upload File
1. **Navigate** to the appropriate page (e.g., `/admin/students`)
2. **Click** the "Import [Data Type]" button (e.g., "Import Students")
3. **Drag and drop** your Excel file or click to browse
4. **Verify** the expected headers are shown

### Step 2: Preview & Edit Data
1. **Review** the imported data in the preview table
2. **Edit** individual cells by clicking on them
3. **Select** rows using the checkboxes for bulk operations
4. **Delete** unwanted rows individually or in bulk
5. **Navigate** through pages if you have many records

### Step 3: Confirm Import
1. **Review** the import summary
2. **Click** "Import [X] Records" to proceed
3. **Wait** for confirmation of successful import

## How to Use Bulk Import

### Step 1: Upload Multiple Files
1. **Navigate** to a page with bulk import (e.g., `/admin/students`)
2. **Click** the "Bulk Import" button
3. **Upload multiple Excel files** - the system will automatically detect the data type
4. **Review** the uploaded files and their data types

### Step 2: Preview & Edit All Data
1. **Click** "Preview & Edit Data" to see all imported data
2. **Navigate** between data types using tabs
3. **Edit** individual cells, delete rows, or select multiple rows
4. **Review** the comprehensive import summary

### Step 3: Confirm Bulk Import
1. **Verify** all data types and record counts
2. **Click** "Import All Data" to process everything
3. **Review** the final confirmation screen

## 🆕 Preview Features in Detail

### **Data Table Preview**
- **Editable Cells** - Click any cell to edit the value
- **Row Selection** - Use switches to select individual or all rows
- **Bulk Operations** - Delete multiple selected rows at once
- **Pagination** - Navigate through large datasets
- **Field Names** - Hover over column headers for field information

### **Import Summary**
- **Record Count** - See exactly how many records will be imported
- **Data Type Breakdown** - For bulk imports, see counts by data type
- **Validation Status** - Confirmation that data is ready for import
- **Backend Status** - Note about backend API implementation status

### **Quality Assurance Tools**
- **Data Validation** - Automatic validation of required fields
- **Format Checking** - Verification of data types and formats
- **Duplicate Detection** - Identification of potential duplicate entries
- **Error Highlighting** - Clear indication of any data issues

## File Requirements

### Format
- **File Type:** `.xlsx` or `.xls`
- **Encoding:** UTF-8 recommended
- **Headers:** Must be in the first row
- **Data:** Starts from the second row

### Data Validation
- **Required Fields:** All specified headers must be present
- **Empty Rows:** Will be automatically filtered out
- **Data Types:** All values are converted to strings
- **Whitespace:** Automatically trimmed

### Output Format
The component returns an array of objects where:
- Keys are the mapped field names (from `fieldMap`)
- Values are cleaned string data from Excel
- Only rows with at least one valid field are included

## Best Practices

### File Preparation
1. **Use Templates:** Download the provided templates for consistent formatting
2. **Check Headers:** Ensure exact header names match the requirements
3. **Clean Data:** Remove empty rows and fix formatting issues
4. **Test Small:** Import a few records first to verify the format

### Data Quality
1. **Unique Identifiers:** Ensure unique values for codes and emails
2. **Valid Formats:** Use proper date formats (YYYY-MM-DD)
3. **Consistent Values:** Use standardized values for campus, department, etc.
4. **Required Fields:** Fill in all required fields

### Import Process
1. **Backup:** Always backup existing data before large imports
2. **Preview:** Always review the preview before confirming import
3. **Edit:** Use the inline editing to fix any issues found during preview
4. **Monitor:** Watch for success/error messages
5. **Refresh:** Refresh the page after import to see new data

## Error Handling

### Common Errors
- **Missing Headers:** "Missing required headers for [data type]"
- **Empty File:** "The Excel file is empty"
- **No Data:** "No valid data found in the Excel file"
- **Invalid Format:** "Error reading Excel file. Please check the file format"

### Troubleshooting
1. **Check Headers:** Verify all required headers are present and spelled correctly
2. **File Format:** Ensure the file is a valid Excel format
3. **Data Rows:** Make sure there's at least one data row after headers
4. **Special Characters:** Remove any special characters from headers

## Advanced Features

### Multiple Row Import
- **Single Import:** Import one record at a time (for sensitive data)
- **Multiple Import:** Import multiple records at once (default for most types)

### Custom Headers
- **Predefined Types:** Use built-in configurations for common data types
- **Custom Types:** Create custom header configurations for specific needs

### Data Transformation
- **Automatic Mapping:** Headers are automatically mapped to database fields
- **Data Cleaning:** Whitespace and formatting are automatically handled
- **Type Conversion:** Values are converted to appropriate data types

### Preview & Edit Capabilities
- **Inline Editing:** Edit any cell directly in the preview table
- **Row Management:** Delete individual rows or bulk delete selected rows
- **Data Validation:** Real-time validation during editing
- **Import Summary:** Comprehensive summary before final confirmation

## Security Considerations

### Data Validation
- **Input Sanitization:** All imported data is sanitized
- **Type Checking:** Data types are validated before import
- **Duplicate Detection:** System checks for duplicate entries
- **Preview Security:** Data is only processed after user confirmation

### Access Control
- **Role-Based Access:** Import functionality is restricted by user roles
- **Audit Trail:** Import activities are logged for security
- **Data Privacy:** Sensitive data is handled according to privacy policies

## Backend Integration Status

### Current Status
- **Single Import:** ✅ Fully integrated with backend APIs
- **Bulk Import:** ⏳ Frontend ready, backend API pending implementation

### Preview Mode Benefits
- **Quality Assurance:** Users can review and edit data before backend processing
- **Error Prevention:** Catch and fix data issues before they reach the backend
- **User Confidence:** Clear preview of exactly what will be imported
- **Data Validation:** Comprehensive validation before backend submission

## Support

### Getting Help
1. **Check Templates:** Use the provided Excel templates
2. **Review Examples:** See the example data formats above
3. **Error Messages:** Read error messages carefully for specific issues
4. **Preview Feature:** Use the preview to identify and fix data issues
5. **Contact Admin:** Reach out to system administrators for complex issues

### Template Downloads
- Templates are available in the import interface
- Click "Download Template" to get the correct format
- Templates include example data and proper headers

### Preview Troubleshooting
- **Large Files:** Use pagination to navigate through large datasets
- **Editing Issues:** Ensure you're clicking on the cell, not the header
- **Selection Problems:** Use the "Select All" switch to select all rows
- **Data Loss:** Your original file is never modified - only the preview data

---

**Note:** This guide covers the current Excel import functionality with preview features. The preview functionality provides comprehensive quality assurance before data reaches the backend, ensuring data integrity and user confidence. 