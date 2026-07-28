# Automated Invoice Report Builder - Complete Feature Set

An enterprise-grade RDL (Report Definition Language) design platform that transforms invoice report creation from complex XML editing to intuitive visual design.

## Core Features

### 1. RDL Parser & Upload System
- Upload existing RDL files and parse them into editable schemas
- Reconstructs invoice layout and field structure from existing reports
- "Figma for RDL" - reverse-engineer and modify existing reports

### 2. Modular Components Architecture
- 8 atomic modules: Header, Company Info, Customer Info, Invoice Details, Item Table, Tax Breakdown, Totals, Footer
- Toggle modules on/off like Lego bricks
- Build flexible invoice templates without code

### 3. Real-Time HTML/CSS Preview
- Live preview of invoice layout as you build
- See changes instantly without generating full RDL
- Fast feedback loop during design

### 4. Version History & Storage
- Save versions of your invoice templates
- Restore previous versions
- Track changes with timestamps
- LocalStorage-based persistence

### 5. Formula/Logic Builder
- Create calculated fields with RDL expressions
- Visual formula editor with field reference insertion
- Support for RDL functions: Sum, Avg, Count, IIf, CDec, Format
- Data type awareness: Currency, Number, Percentage

### 6. Developer Mode
- XML editor for advanced users
- Direct RDL editing with formatting tools
- Copy/paste functionality
- For developers who need full control

### 7. Business Central Compatibility Checker
- Validates RDL against BC requirements
- Checks field naming conventions
- Detects unsupported functions
- Generates compatibility reports
- Actionable suggestions for fixes

### 8. Template Theming System
- Pre-built themes: Professional, Minimal, Modern
- Customize colors, fonts, borders
- Row alternation for tables
- Apply themes to HTML previews

## Technical Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Storage**: LocalStorage for version history
- **RDL Support**: Full SQL Server Reporting Services 2016+ compatibility

## Workflow

### For Template Designers
1. Select template or upload existing RDL
2. Configure invoice schema (fields, columns, totals)
3. Toggle modules on/off for custom layout
4. Preview in real-time
5. Save versions for future reference
6. Export as RDL

### For Developers
1. Create calculated fields with formulas
2. Enable Developer Mode for XML editing
3. Run Business Central compatibility check
4. Export as RDLC for Visual Studio
5. Version control and track changes

## Key Differentiators

- **RDL Parsing**: Unlike competitors, import and reverse-engineer existing reports
- **Modular Architecture**: Flexible composition without complex templating
- **BC Integration**: Built specifically for Business Central compatibility
- **Developer Tools**: XML editor + formula builder + compatibility checker for power users
- **Enterprise-Grade**: Version history, themes, comprehensive validation

## Data Flow

\`\`\`
Upload RDL/Create New
    ↓
Select Template & Configure Schema
    ↓
Toggle Modules (optional)
    ↓
Real-Time Preview
    ↓
(Optional) Add Calculated Fields
    ↓
Run Compatibility Check
    ↓
Edit XML (Developer Mode)
    ↓
Save Version
    ↓
Download RDL
\`\`\`

## Future Enhancements

- Cloud storage for version history
- Collaborative editing
- Custom parameter support
- Subreport integration
- Advanced layout designer
- Team templates library
- RDL to RDLC conversion
- Business Central direct deployment
