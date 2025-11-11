# i18n Key Naming Guide

## Overview
This guide establishes consistent naming conventions for all i18n keys in the HFI Utility Center project.

## Core Principles

### 1. **Singular First Priority**
- Use singular form unless the key specifically refers to a collection
- ✅ `admin.field.name` (singular form)
- ❌ `admin.fields.name` (plural unnecessarily)

### 2. **camelCase for Compound Words**
- Use camelCase to combine multiple words in a single key
- ✅ `admin.validation.emailFormat`
- ❌ `admin.validation.email-format` or `admin.validation.email_format`

### 3. **Hierarchical Organization**
- Organize keys from general to specific
- Level 1: Feature/Module (e.g., `admin`, `reservation`)
- Level 2: Category (e.g., `field`, `validation`, `message`)
- Level 3: Specific item (e.g., `name`, `email`)
- Structure: `module.category.item`

### 4. **Semantic Key Names**
- Use meaningful, self-documenting key names
- ✅ `admin.validation.emailFormat` (clear intent: email format validation)
- ❌ `admin.v1` or `admin.x1` (unclear)

### 5. **Avoid Redundancy**
- Don't repeat names in nested keys
- ✅ `admin.validation.required`
- ❌ `admin.admin.validation.adminRequired` (redundant)

### 6. **Action-Oriented Naming**
- Use verbs for actionable items
- Use nouns for labels and fields
- Verbs: `create`, `edit`, `delete`, `approve`, `reject`
- Nouns: `name`, `email`, `password`, `reason`

## Key Categories

### **field** - Input Fields
- Stores labels and placeholders for form fields
- ✅ `admin.field.name`, `admin.field.email`
- Used in: Form labels, table headers, placeholders

### **validation** - Validation Messages
- Stores all validation error messages
- ✅ `admin.validation.emailFormat`
- ✅ `admin.validation.required`
- Pattern: `{category}.{type}` or `{category}.{field}{Error}`

### **message** - Status Messages
- Stores success/error/info feedback messages
- ✅ `admin.message.created`
- ✅ `admin.message.updated`
- Pattern: `{module}.message.{action}`

### **dialog** - Dialog Titles
- Stores titles for modal dialogs
- ✅ `admin.dialog.create`, `admin.dialog.edit`
- Pattern: `{module}.dialog.{action}.{entity}`

### **label** - UI Labels
- Stores generic labels for UI elements
- ✅ `admin.label.room`, `admin.label.campus`
- Used for: Section titles, navigation labels

### **button** - Button Labels
- Stores text for action buttons
- ✅ `admin.button.create`, `admin.button.cancel`
- Pattern: `{module}.button.{action}`

### **status** - Status Values
- Stores predefined status values
- ✅ `admin.status.enabled`, `admin.status.pending`
- Typically singular values from enums

### **action** - Action Messages
- Stores messages for completed actions
- ✅ `admin.action.created`, `admin.action.deleted`
- Deprecated in favor of `message` category

## Naming Patterns

### Form Fields
```json
{
  "admin": {
    "field": {
      "name": "Name",
      "email": "Email",
      "passwordMin": "Password (minimum 6 characters)",
      "dateRange": "Date Range"
    }
  }
}
```

### Validation Rules
```json
{
  "admin": {
    "validation": {
      "name": "Name is required.",
      "emailFormat": "Invalid email format.",
      "passwordMin": "Password must be at least 6 characters.",
      "required": "Please fill in all required fields."
    }
  }
}
```

### Messages (Success/Error/Info)
```json
{
  "admin": {
    "message": {
      "created": "Created successfully.",
      "updated": "Updated successfully.",
      "deleted": "Deleted successfully.",
      "notFound": "No items found."
    }
  }
}
```

### Dialogs and Actions
```json
{
  "admin": {
    "dialog": {
      "create": "New Admin",
      "edit": "Edit Admin",
      "editPassword": "Edit Password"
    }
  }
}
```

### Nested Categories (for complex modules)
```json
{
  "admin": {
    "facility": {
      "label": {
        "room": "Rooms",
        "campus": "Campuses"
      },
      "message": {
        "room": {
          "created": "Room created successfully.",
          "deleted": "Room deleted successfully."
        },
        "campus": {
          "created": "Campus created successfully.",
          "deleted": "Campus deleted successfully."
        }
      }
    }
  }
}
```

## Common Key Naming Examples

### Good Examples ✅
- `admin.field.name` - Field label
- `admin.validation.emailFormat` - Validation error
- `admin.message.created` - Success message
- `admin.dialog.create` - Dialog title
- `admin.button.submit` - Button label
- `admin.status.enabled` - Status value
- `admin.weekday.full.mon` - Weekday name
- `admin.section.personal` - Section header

### Poor Examples ❌
- `admin.adminFieldName` - Don't nest module name
- `admin.field.names` - Use singular
- `admin.validation.error_email_format` - Don't use underscores
- `admin.messages.successCreated` - Redundant prefix
- `admin.btn.submit` - Use full word
- `admin.create_success_message` - Use camelCase
- `admin.weekday.full_name.mon` - Use camelCase
- `admin.form.section.personal_info` - Use camelCase

## Module Organization

### Admin Module
```
admin/
├── common/           (shared values)
│   ├── field/
│   ├── action/
│   └── status/
├── admin/            (admin management)
│   ├── dialog/
│   ├── field/
│   ├── validation/
│   └── message/
├── facility/         (facility management)
│   ├── label/
│   ├── dialog/
│   ├── field/
│   ├── validation/
│   ├── message/
│   └── weekday/
├── login/            (admin login)
│   ├── field/
│   ├── button/
│   ├── validation/
│   └── message/
└── reservation/      (reservation management)
    ├── label/
    ├── dialog/
    ├── field/
    ├── status/
    ├── section/
    ├── validation/
    ├── message/
    ├── reason/
    └── export/
```

## Migration Path

When refactoring existing keys:

1. **Identify the category**: Is it a field, validation, message, or action?
2. **Choose the right parent**: Use the module name (admin, facility, etc.)
3. **Simplify the name**: Remove redundancy and prefixes
4. **Apply camelCase**: Convert all compound words
5. **Verify hierarchy**: Ensure logical nesting from general to specific

## Examples of Key Refactoring

### Before → After

| Before | After | Reason |
|--------|-------|--------|
| `admin.admin.dialogs.newAdmin` | `admin.admin.dialog.create` | Singular + verb-based |
| `admin.facility.validation.nameRequired` | `admin.facility.validation.name` | Remove redundancy |
| `admin.facility.buttons.create` | `admin.button.create` | Move to common (shared) |
| `admin.reservation.message.reservationApproved` | `admin.reservation.message.approved` | Remove redundancy |
| `admin.facility.weekDays.monday` | `admin.facility.weekday.full.mon` | Singular + abbreviation |
| `reservation.create.form.invalid.class` | `reservation.create.validation.class` | Rename for consistency |
| `reservation.create.tables.policy.empty` | `reservation.create.table.policy.message` | Singular + semantic |

## Usage in Code

### Vue Template
```vue
<!-- Field labels -->
<label>{{ $t('admin.field.name') }}</label>

<!-- Validation messages -->
<error v-if="errors.name">{{ $t('admin.validation.name') }}</error>

<!-- Success messages -->
<toast>{{ $t('admin.message.created') }}</toast>

<!-- Dialog titles -->
<Dialog :header="$t('admin.dialog.create')">

<!-- Button labels -->
<Button>{{ $t('admin.button.submit') }}</Button>
```

### Vue Script
```typescript
const { t } = useI18n();

const validationSchema = z.object({
  name: z.string(t('admin.validation.name')),
  email: z.string().email(t('admin.validation.emailFormat'))
});

if (response.success) {
  toast.add({
    detail: t('admin.message.created')
  });
}
```

## Version History

- **v1.0** (2025-01-11): Initial naming guide established
  - Established singular-first principle
  - Defined camelCase convention
  - Created hierarchical structure
  - Documented common categories and patterns
