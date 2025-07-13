# Robertson Education School Website

## Overview

This is a comprehensive multi-page school website for Robertson Education built with modern web technologies. The application features an informational frontend for visitors, students, and parents, along with a robust result checker system and administrative dashboard. The website provides a complete digital presence for the educational institution with dynamic functionality and beautiful design.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Animations**: AOS (Animate on Scroll) library for smooth page transitions
- **State Management**: TanStack Query for server state management
- **Routing**: Hash-based client-side routing
- **Forms**: React Hook Form with Zod validation
- **Authentication Pages**: Separate auth folder with SignIn and SignUp components

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Dual system - Replit Auth for public users + Custom admin authentication
- **Session Management**: Express sessions with PostgreSQL storage
- **Password Security**: bcryptjs for password hashing and validation

### Build System
- **Bundler**: Vite for frontend development and building
- **Build Tool**: ESBuild for server-side bundling
- **Development**: Hot module replacement and runtime error overlay

## Key Components

### Public Pages
1. **Home Page**: Hero slider with 4 slides, feature sections, FAQ, and history
2. **About Page**: Mission, vision, history, and values with animated sections
3. **News/Blog**: Dynamic news system with categories and search functionality
4. **Admission**: Online application form with PDF generation capability
5. **Contact**: Contact form with validation and Google Maps integration
6. **Results**: Student result checker with scratch card validation

### Admin Dashboard
- Student management (CRUD operations)
- Enhanced result management with comprehensive academic reporting
- Multi-subject grading system with behavioral assessment
- Attendance tracking and performance analytics
- Professional result template with formatted report cards
- Scratch card generation and management
- News/blog content management
- Contact message handling
- School information management

### Result Checker System
- Student ID and scratch card PIN validation
- Session/term selection
- Dynamic result display with grades and GPA
- Print/download functionality
- Scratch card expiry and usage tracking

## Data Flow

### Authentication Flow
1. User authentication through Replit Auth (OpenID Connect)
2. Session management with PostgreSQL storage
3. Role-based access control (admin/user)
4. Automatic session validation and refresh

### Result Checking Flow
1. Student enters ID and scratch card PIN
2. System validates PIN against database (expiry, usage limits)
3. If valid, retrieves and displays student results
4. Option to print or download results
5. PIN usage tracking for security

### Content Management Flow
1. Admin creates/edits content through dashboard
2. Content stored in PostgreSQL with proper relationships
3. Public pages dynamically fetch and display content
4. Real-time updates without page refresh

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: Built-in connection management
- **Migrations**: Drizzle Kit for schema management

### Third-party Services
- **Replit Auth**: Authentication and user management
- **Unsplash**: Stock images for visual content
- **Google Fonts**: Custom typography (Playfair Display, Crimson Text)
- **Lucide React**: Modern icon library

### Key NPM Packages
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities
- **aos**: Scroll animations

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` with hot reloading
- **Database**: Development database with Drizzle migrations
- **Environment**: NODE_ENV=development with debug logging

### Production
- **Build Process**: 
  1. Frontend build with Vite (`vite build`)
  2. Server build with ESBuild (`esbuild server/index.ts`)
  3. Static assets bundled and optimized
- **Deployment**: `npm start` runs production server
- **Database**: Production PostgreSQL with connection pooling
- **Environment**: NODE_ENV=production with optimized settings

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit application identifier
- `ISSUER_URL`: OpenID Connect issuer URL

### File Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express application
├── shared/          # Shared types and schemas
├── attached_assets/ # Static assets and images
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Changelog

Changelog:
- July 06, 2025. Initial setup
- July 07, 2025. Enhanced delete confirmations with SweetAlert2 for better user experience
- July 11, 2025. Enhanced Results Management System with comprehensive academic reporting
  - Added dynamic multi-subject support with 20+ predefined subjects
  - Integrated attendance tracking and behavioral assessment
  - Created professional result template with grading scales
  - Added search and filter functionality for results
  - Implemented comprehensive result viewing with formatted report cards
  - Enhanced database schema with additional fields for complete academic records
  - Restructured results system with professional sub-pages and navigation
  - Created modular results dashboard with Create, View, Analytics, and Settings sections
  - Added step-by-step result creation wizard with validation
  - Implemented comprehensive analytics dashboard with performance insights
  - Added configurable settings for grading systems and display preferences
- July 11, 2025. Major restructuring of admin interface based on user feedback
  - Eliminated duplicate dashboard structure per user request
  - Moved all result management components out of nested results folder
  - Integrated result management directly into main admin layout with dropdown navigation
  - Created flat file structure: CreateResult.tsx, ViewResults.tsx, ResultAnalytics.tsx, NigerianResultTemplate.tsx
  - Updated AdminLayout.tsx to support dropdown navigation for both Students and Results sections
  - Implemented authentic Nigerian secondary school result format with proper grading system
  - Added comprehensive result analytics and performance tracking
  - Removed unnecessary nested folders and duplicate management interfaces
  - Enhanced Create Result page with class-based student filtering for multi-class management
  - Added auto-population of class field when student is selected for streamlined workflow
  - Updated Grade Distribution in Analytics page with customizable Nigerian grading system
  - Added editable grade settings: 70-100% (Distinction), 55-69% (Credit), 40-54% (Pass), 30-39% (Fail), 0-29% (Fail)
  - Implemented dynamic grade calculation based on user-defined grade ranges
- July 12, 2025. Restored PDF download functionality with Robertson Education logo
  - Added comprehensive PDF download function using jsPDF library
  - Integrated authentic Robertson Education logo (red shield design) into PDF generation
  - Created downloadResultAsPDF function with proper logo loading and positioning
  - Added "Download PDF" button alongside existing "Print Result" button
  - Implemented complete result formatting in PDF including header, student info, grades table, and signatures
  - Enhanced print CSS with extensive !important rules to force logo display in print mode
  - Added browser-specific image printing fixes for maximum compatibility
  - Fixed PDF generation error by converting numeric values to strings for jsPDF compatibility
  - Iteratively optimized logo and passport sizes based on user feedback from 18px to final 65px
  - Achieved perfect size matching between logo and passport placeholder for professional appearance
  - Updated both print (65x65px) and PDF (32x32px) layouts with optimized dimensions
  - Enhanced passport text size to 10pt for excellent readability
  - Removed PDF download functionality and button per user request to streamline interface
  - Updated print button to blue color for improved visual design
  - Corrected implementation: Kept PDF functionality available but removed duplicate print buttons
  - Fixed print button to work properly with HTML print preview
  - Removed white print button, keeping only the blue one for clean interface
- July 12, 2025. Added passport photo upload functionality to student registration
- July 13, 2025. Fixed critical API response handling issues in Results page
  - Resolved "Cannot read properties of undefined" errors by replacing apiRequest wrapper with direct fetch() calls
  - Added proper JSON parsing for subjects data stored as strings in the database
  - Enhanced error handling with detailed debugging information about available results
  - Updated display logic to use correct field names and handle parsed data properly
  - Transformed result display from inline cards to professional modal dialog
  - Added comprehensive result modal with all student details, complete subject breakdown (CA1, CA2, Exam, Total, Grade, Remark, Position)
  - Enhanced modal with additional information section including attendance, behavioral rating, and teacher comments
  - Improved print functionality with dedicated print button in modal interface
  - Fixed scratch card system to allow multiple uses (up to 10 per card) instead of single-use limitation
- July 13, 2025. Implemented professional print and PDF functionality for Results page
  - Created dedicated print function that opens new window with only result content (no site navigation)
  - Added comprehensive print styles with proper Nigerian result template formatting
  - Fixed print layout to display authentic school result format with logo, passport photo, and professional styling
  - Enhanced PDF generation with complete result data including header, student info, subjects table, and signatures
  - Integrated both print and PDF buttons in result modal for easy access
  - Print function now opens in new window with optimized print-specific CSS styling
  - PDF download creates properly formatted document with school branding and complete result details
  - Both print and PDF maintain authentic Nigerian secondary school result appearance
- July 12, 2025. Implemented comprehensive cumulative results system for individual student performance tracking
  - Enhanced student database schema with `passportPhoto` field for Base64 image storage
  - Added passport photo upload to Add Student page with file validation (image types, 5MB limit)
  - Implemented preview functionality with image display and removal option
  - Updated result print template to display uploaded student passport photos
  - Added passport photo support to PDF generation with error handling fallback
  - Integrated passport photo display in both print and PDF formats (65x65px print, 32x32px PDF)
  - Enhanced student management with professional passport photo capability for result templates
  - Fixed student registration validation error by excluding studentId from insert schema
  - Added passport photo display to ViewStudents dialog for viewing student details
  - Enhanced edit student dialog to properly load and display existing passport photos
  - Added debugging to track passport photo data flow in result templates and student views
  - Implemented comprehensive passport photo display across all student management interfaces
  - Fixed SQL syntax error in photo serving endpoint by switching from Drizzle ORM to raw SQL queries
  - Created working `/api/student-photo/:studentId` endpoint that properly serves passport photos
  - Enhanced error handling to gracefully show placeholders for students without photos
  - Updated frontend components to use photo endpoint with fallback to placeholder text
  - System now supports individual student photos with proper error handling and placeholder display
  - Created cumulative results system showing individual student performance across all three terms
  - Added term-by-term performance tracking with first, second, and third term analysis
  - Implemented overall class position rankings based on cumulative averages and GPA
  - Added individual student cumulative reports with detailed printable format including school logo
  - Created comprehensive dialog interface for viewing individual student performance details
  - Added performance trend indicators showing improvement, decline, or stable performance patterns
  - Implemented subject-by-subject breakdown for each term with grades and remarks
  - Added cumulative summary with overall grade classifications (DISTINCTION, CREDIT, PASS, FAIL)
  - Created professional printable format with signatures section for teachers and parents
  - Enhanced navigation with new "Cumulative Results" option under Results dropdown menu
  - Optimized cumulative results print template to fit on one page with compact layout
  - Changed print layout to 3-column grid for terms (First, Second, Third) with condensed subject tables
  - Reduced font sizes and margins for better space utilization while maintaining readability
  - Limited subject display to top 5 subjects per term to save space
  - Implemented compact summary grid with essential performance metrics

## User Preferences

Preferred communication style: Simple, everyday language.