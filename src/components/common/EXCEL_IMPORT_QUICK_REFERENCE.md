# Excel Import Quick Reference

## 🚀 Quick Start

1. **Find Import Button** - Look for "Import [Data Type]" or "Bulk Import" button
2. **Upload File** - Drag & drop Excel file or click to browse
3. **Review Data** - Check the preview and confirm
4. **Import** - Click import to complete

## 📋 Required Headers by Data Type

| Data Type | Required Headers |
|-----------|------------------|
| **Student** | First Name, Last Name, Email, Password, Address, Phone, Date of Birth, Student Code, Enroll Date |
| **Staff** | First Name, Last Name, Email, Password, Address, Phone, Date of Birth, Campus, Department, Position, Start Work Date |
| **Subject** | Subject Code, Subject Name, Credits, Description |
| **Program** | Program Code, Program Name |
| **Combo** | Combo Name, Combo Description |
| **Curriculum** | Program Code, Curriculum Code, Curriculum Name, Effective Date |

## 📍 Import Locations

### Admin Pages
- `/admin/students` - Import students
- `/admin/staff` - Import staff
- `/admin/managers` - Import managers
- `/admin/advisors` - Import advisors

### Staff Pages
- `/staff/subject` - Import subjects
- `/staff/program` - Import programs
- `/staff/curriculum` - Import curriculum

### Manager Pages
- `/manager/subject` - Import subjects
- `/manager/combo` - Import combos

## ⚡ Bulk Import

**Available on:** Admin pages (e.g., `/admin/students`)

**Features:**
- Upload multiple files at once
- Automatic data type detection
- Review all data before import
- Import multiple data types simultaneously

## 📁 File Requirements

- **Format:** `.xlsx` or `.xls`
- **Headers:** First row
- **Data:** Second row onwards
- **Encoding:** UTF-8 recommended

## 🔧 Tips

✅ **Do:**
- Use provided templates
- Check header spelling exactly
- Test with small files first
- Clean data before import

❌ **Don't:**
- Skip required headers
- Leave empty required fields
- Use special characters in headers
- Import without reviewing data

## 🚨 Common Errors

| Error | Solution |
|-------|----------|
| "Missing required headers" | Check header spelling and case |
| "File is empty" | Ensure data starts from row 2 |
| "No valid data found" | Check for empty rows |
| "Invalid format" | Use .xlsx or .xls format |

## 📞 Need Help?

1. Download templates from import interface
2. Check error messages for specific issues
3. Review example data formats
4. Contact system administrator

---

**💡 Pro Tip:** Use bulk import for large datasets with multiple data types! 