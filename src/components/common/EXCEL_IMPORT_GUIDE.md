# Excel Import Guide

This guide explains how to prepare Excel files for bulk import into the system.

## 📋 Supported Data Types

The system supports importing the following data types:
- **STUDENT** - Student accounts and profiles
- **STAFF** - Staff member accounts and profiles  
- **ADVISOR** - Academic advisor accounts and profiles
- **MANAGER** - Manager accounts and profiles
- **SUBJECT** - Course subjects and curriculum data
- **PROGRAM** - Academic programs
- **COMBO** - Subject combinations/packages
- **CURRICULUM** - Curriculum structures
- **ASSESSMENT** - Assessment configurations
- **MATERIAL** - Learning materials and resources
- **OUTCOME** - Learning outcomes
- **SESSION** - Class sessions and schedules

## 🔀 Flexible Header System

Our import system uses **flexible header matching** that automatically recognizes different header formats:

### ✅ Supported Header Variations

The system accepts headers in multiple formats for each field:

#### Examples for "firstName":
- `firstName` (camelCase)
- `FirstName` (PascalCase) 
- `first_name` (snake_case)
- `first-name` (kebab-case)
- `first name` (space separated)
- `First Name` (Title Case)
- `FIRST NAME` (UPPER CASE)
- `FIRST_NAME` (UPPER_SNAKE_CASE)

#### Examples for "dateOfBirth":
- `dateOfBirth`
- `DateOfBirth`
- `date_of_birth`
- `date-of-birth`
- `date of birth`
- `Date Of Birth`
- `DATE OF BIRTH`
- `DATE_OF_BIRTH`

### 🎯 Header Recognition

The system automatically:
1. **Normalizes** your headers by removing spaces, underscores, hyphens
2. **Converts** to lowercase for comparison
3. **Matches** against all possible variations
4. **Identifies** the correct data type based on header patterns

## 📊 Required Headers by Data Type

### STUDENT Import
**Required Fields:**
- First Name: `firstName`, `FirstName`, `first_name`, `First Name`, etc.
- Last Name: `lastName`, `LastName`, `last_name`, `Last Name`, etc.
- Email: `email`, `Email`, `EMAIL`, etc.
- Password: `password`, `Password`, `PASSWORD`, etc.
- Address: `address`, `Address`, `ADDRESS`, etc.
- Phone: `phone`, `Phone`, `PHONE`, etc.
- Date of Birth: `dateOfBirth`, `DateOfBirth`, `date_of_birth`, `Date Of Birth`, etc.
- Student Code: `studentCode`, `StudentCode`, `student_code`, `Student Code`, etc.
- Enroll Date: `enrollDate`, `EnrollDate`, `enroll_date`, `Enroll Date`, etc.

### STAFF Import
**Required Fields:**
- First Name, Last Name, Email, Password, Address, Phone, Date of Birth (same as Student)
- Campus: `campus`, `Campus`, `CAMPUS`, etc.
- Department: `department`, `Department`, `DEPARTMENT`, etc.
- Position: `position`, `Position`, `POSITION`, etc.
- Start Work Date: `startWorkAt`, `StartWorkAt`, `start_work_at`, `Start Work At`, etc.

### PROGRAM Import
**Required Fields:**
- Program Code: `programCode`, `ProgramCode`, `program_code`, `Program Code`, etc.
- Program Name: `programName`, `ProgramName`, `program_name`, `Program Name`, etc.

### CURRICULUM Import
**Required Fields:**
- Program ID: `programId`, `ProgramId`, `program_id`, `Program ID`, etc.
- Curriculum Code: `curriculumCode`, `CurriculumCode`, `curriculum_code`, `Curriculum Code`, etc.
- Curriculum Name: `curriculumName`, `CurriculumName`, `curriculum_name`, `Curriculum Name`, etc.
- Effective Date: `effectiveDate`, `EffectiveDate`, `effective_date`, `Effective Date`, etc.

### SUBJECT Import
**Required Fields:**
- Subject Code: `subjectCode`, `SubjectCode`, `subject_code`, `Subject Code`, etc.
- Subject Name: `subjectName`, `SubjectName`, `subject_name`, `Subject Name`, etc.
- Credits: `credits`, `Credits`, `CREDITS`, etc.
- Description: `description`, `Description`, `DESCRIPTION`, etc.

**💡 Note:** Subject bulk import is fully implemented and supports comprehensive validation including credit parsing and required field validation.

*[Continue with other data types...]*

## ✨ Key Benefits

### 🔄 Automatic Recognition
- No need to worry about exact header formatting
- System automatically detects your data type
- Supports common Excel naming conventions

### 🛡️ Error Prevention
- Flexible matching reduces import errors
- Clear error messages if headers don't match
- Preview step allows verification before import

### 📈 User Friendly
- Works with existing Excel templates
- No need to rename headers manually
- Supports various naming conventions

## 🚀 Import Process

### Step 1: Prepare Your Excel File
1. **Create** an Excel file (.xlsx or .xls)
2. **Add headers** in row 1 using any supported format
3. **Enter data** starting from row 2
4. **Save** the file

### Step 2: Upload and Verify
1. **Upload** your Excel file
2. **Review** the automatically detected data type
3. **Preview** the parsed data
4. **Edit** any incorrect values if needed

### Step 3: Import to System
1. **Confirm** the data looks correct
2. **Click** "Upload to Server"
3. **Verify** successful import message

## ⚠️ Important Notes

### Data Validation
- All required fields must have values
- Empty rows are automatically skipped
- Invalid data formats will be highlighted

### File Requirements
- **Format**: Excel (.xlsx, .xls)
- **Size**: Maximum 10MB recommended
- **Encoding**: UTF-8 preferred
- **Headers**: Must be in row 1

### Common Issues
1. **Mixed Data Types**: Each file should contain only one data type
2. **Missing Required Fields**: All required headers must be present
3. **Data Format**: Dates should be in recognizable format (YYYY-MM-DD, MM/DD/YYYY, etc.)
4. **Duplicate Headers**: Each header should appear only once

## 💡 Tips for Success

### Header Formatting
- ✅ Use consistent naming within your file
- ✅ Any common format works (camelCase, Title Case, snake_case, etc.)
- ✅ Spaces, underscores, and hyphens are all supported
- ❌ Don't mix different formats for the same field type

### Data Entry
- ✅ Use consistent date formats
- ✅ Keep text data clean (no extra spaces)
- ✅ Use valid email formats
- ✅ Phone numbers can include formatting (123-456-7890 or 1234567890)

### File Organization
- ✅ One data type per file
- ✅ Clear, descriptive filenames
- ✅ Remove empty rows at the end
- ✅ Check for merged cells (not recommended)

## 🆘 Troubleshooting

### "Could not identify data type"
- **Check** that you have all required headers
- **Verify** header names match supported variations
- **Ensure** headers are in row 1
- **Remove** any merged cells or formatting

### "No valid data found"
- **Check** that you have data rows below headers
- **Verify** required fields are not empty
- **Remove** completely empty rows

### Import Errors
- **Review** the preview step carefully
- **Edit** any highlighted errors
- **Check** data formats (especially dates)
- **Verify** all required fields have values

## 📞 Support

If you continue to experience issues:
1. **Check** this guide for common solutions
2. **Verify** your file format and headers
3. **Contact** system administrator for assistance
4. **Include** sample data and error messages when reporting issues

---

*This guide covers the flexible import system. The system automatically handles various header formats, making your import process smooth and error-free.* 