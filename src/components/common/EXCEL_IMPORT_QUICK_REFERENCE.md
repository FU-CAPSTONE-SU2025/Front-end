# 🚀 Excel Import Quick Reference

## Header Format Examples

The system automatically recognizes ALL these header variations:

### ✅ Student Data Headers - All These Work!

| Field | Accepted Header Formats |
|-------|------------------------|
| **First Name** | `firstName`, `FirstName`, `first_name`, `first-name`, `first name`, `First Name`, `FIRST NAME`, `FIRST_NAME` |
| **Last Name** | `lastName`, `LastName`, `last_name`, `last-name`, `last name`, `Last Name`, `LAST NAME`, `LAST_NAME` |
| **Email** | `email`, `Email`, `EMAIL`, `e-mail`, `e_mail`, `E-Mail`, `E_MAIL` |
| **Date of Birth** | `dateOfBirth`, `DateOfBirth`, `date_of_birth`, `date-of-birth`, `date of birth`, `Date Of Birth`, `DOB`, `dob` |
| **Student Code** | `studentCode`, `StudentCode`, `student_code`, `student-code`, `student code`, `Student Code`, `STUDENT_CODE` |

### ✅ Program Data Headers - All These Work!

| Field | Accepted Header Formats |
|-------|------------------------|
| **Program Code** | `programCode`, `ProgramCode`, `program_code`, `program-code`, `program code`, `Program Code`, `PROGRAM_CODE` |
| **Program Name** | `programName`, `ProgramName`, `program_name`, `program-name`, `program name`, `Program Name`, `PROGRAM_NAME` |

### ✅ Curriculum Data Headers - All These Work!

| Field | Accepted Header Formats |
|-------|------------------------|
| **Program ID** | `programId`, `ProgramId`, `program_id`, `program-id`, `program id`, `Program ID`, `PROGRAM_ID` |
| **Curriculum Code** | `curriculumCode`, `CurriculumCode`, `curriculum_code`, `curriculum-code`, `curriculum code`, `Curriculum Code`, `CURRICULUM_CODE` |
| **Curriculum Name** | `curriculumName`, `CurriculumName`, `curriculum_name`, `curriculum-name`, `curriculum name`, `Curriculum Name`, `CURRICULUM_NAME` |
| **Effective Date** | `effectiveDate`, `EffectiveDate`, `effective_date`, `effective-date`, `effective date`, `Effective Date`, `EFFECTIVE_DATE` |

### ✅ Subject Data Headers - All These Work!

| Field | Accepted Header Formats |
|-------|------------------------|
| **Subject Code** | `subjectCode`, `SubjectCode`, `subject_code`, `subject-code`, `subject code`, `Subject Code`, `SUBJECT_CODE` |
| **Subject Name** | `subjectName`, `SubjectName`, `subject_name`, `subject-name`, `subject name`, `Subject Name`, `SUBJECT_NAME` |
| **Credits** | `credits`, `Credits`, `CREDITS`, `credit`, `Credit`, `CREDIT` |

## 🎯 Example Excel Files That Work

### Example 1: Traditional Format
```
| First Name | Last Name | Email Address | Date of Birth | Student Code |
|------------|-----------|---------------|---------------|--------------|
| John       | Doe       | john@test.com | 1990-01-15    | ST001       |
```

### Example 2: Programming Format  
```
| firstName | lastName | email | dateOfBirth | studentCode |
|-----------|----------|-------|-------------|-------------|
| Jane      | Smith    | jane@test.com | 1992-05-20 | ST002 |
```

### Example 3: Database Format
```
| first_name | last_name | email | date_of_birth | student_code |
|------------|-----------|-------|---------------|--------------|
| Bob        | Johnson   | bob@test.com | 1988-12-10 | ST003 |
```

### Example 4: All Caps Format
```
| FIRST NAME | LAST NAME | EMAIL | DATE OF BIRTH | STUDENT CODE |
|------------|-----------|-------|---------------|--------------|
| Alice      | Brown     | alice@test.com | 1995-08-30 | ST004 |
```

### Example 5: Curriculum Format
```
| Program ID | Curriculum Code | Curriculum Name | Effective Date |
|------------|-----------------|-----------------|----------------|
| 1          | SE2024         | Software Engineering 2024 | 2024-09-01 |
| 2          | CE2024         | Computer Engineering 2024 | 2024-09-01 |
| 1          | SE2025         | Software Engineering 2025 | 2025-09-01 |
```

### Example 6: Mixed Curriculum Format
```
| programId | curriculum_code | Curriculum Name | effective_date |
|-----------|-----------------|-----------------|----------------|
| 3         | IT2024         | Information Technology 2024 | 2024-01-15 |
| 4         | AI2024         | Artificial Intelligence 2024 | 2024-08-30 |
```

### Example 7: Subject Format
```
| Subject Code | Subject Name | Credits | Description |
|--------------|--------------|---------|-------------|
| SE101        | Introduction to Software Engineering | 3 | Basic concepts of software engineering |
| SE102        | Object-Oriented Programming | 4 | Learn OOP principles and practices |
```

### Example 8: Mixed Subject Format  
```
| subjectCode | subject_name | Credits | description |
|-------------|--------------|---------|-------------|
| AI201       | Machine Learning Fundamentals | 3 | Introduction to ML algorithms |
| DB301       | Database Design | 4 | Advanced database concepts |
```

## 💡 Quick Tips

### ✅ DO:
- **Mix formats** - You can use `First Name` and `lastName` in the same file
- **Use any spacing** - Spaces, underscores, hyphens all work
- **Use any capitalization** - UPPER, lower, Title Case, camelCase all work
- **Keep consistent within columns** - Same header name for the same column

### ❌ DON'T:
- **Use different names for same field** - Don't use both `email` and `mail` for email field
- **Add extra columns** - System ignores unknown headers (but it's cleaner without them)
- **Mix data types** - Keep one data type per file

## 🚀 Import Process

1. **Upload** your Excel file with any supported header format
2. **System automatically detects** the data type and maps headers
3. **Preview** shows your data with standard field names
4. **Edit** any values that need correction
5. **Import** to complete the process

## 🎉 Success Message Example

When you upload a file with headers like `First Name, Last Name, Email`, you'll see:

> ✅ **Successfully processed StudentData.xlsx - 25 records identified as Student data**

The system automatically converted your headers to the standard format!

---

*No more worrying about exact header formatting - just upload and let the system handle the rest!* 