# ERP Module Implementation Tasks

## Backend
- [x] server/models/ErpStudent.js
- [x] server/models/Attendance.js
- [x] server/models/InternalMarks.js
- [x] server/models/SemesterResult.js
- [x] server/models/AcademicReport.js
- [x] server/models/ErpSyncLog.js
- [x] server/routes/erp.js (fake ERP + sync + all ERP APIs)
- [x] Register route in server/index.js

## Frontend Service
- [x] src/services/erpApi.ts

## Frontend Components
- [x] src/components/erp/CircularProgress.tsx
- [x] src/components/erp/RiskCategoryBadge.tsx

## Frontend Pages
- [x] src/pages/erp/ERPDashboard.tsx
- [x] src/pages/erp/SyncERP.tsx
- [x] src/pages/erp/AcademicRecords.tsx
- [x] src/pages/erp/AttendancePage.tsx
- [x] src/pages/erp/InternalMarksPage.tsx
- [x] src/pages/erp/SemesterResults.tsx
- [x] src/pages/erp/AIAnalytics.tsx
- [x] src/pages/erp/AcademicReports.tsx

## Modifications to Existing Files
- [x] src/components/AppSidebar.tsx — add ERP nav group
- [x] src/App.tsx — add ERP routes
- [x] server/index.js — register ERP route and update MongoDB URI
