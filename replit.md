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
- July 13, 2025. Enhanced Results page with dynamic sessions, improved modal display, and optimized PDF formatting
  - Added dynamic session generation using current year for automatic up-to-date session options
  - Restructured modal display to match admin result format with organized cards and tables
  - Improved modal layout with student information card, professional subjects table, and performance summary cards
  - Added color-coded grade and remark displays for better visual presentation
  - Enhanced PDF generation with thin borders (0.3px) instead of thick ones for cleaner appearance
  - Separated print content from modal display for better user experience
  - Added proper comments section display in modal matching admin interface
  - Optimized table styling with hover effects and proper spacing for better readability
- July 13, 2025. Complete website responsiveness overhaul and feature enhancements
  - Made entire website fully responsive across all screen sizes (mobile, tablet, desktop)
  - Fixed image display issues in News Management using proper error handling and fallback display
  - Added functional "Read More" feature to News page with full article modal display
  - Completely redesigned Contact page to display only contact information (removed form per user request)
  - Added call-to-action buttons, Google Maps integration, and social media links to Contact page
  - Enhanced HeroSlider with responsive text sizes, button layouts, and navigation controls
  - Updated Navigation component with responsive logo, menu items, and mobile menu improvements
  - Made Footer fully responsive with proper grid layouts and icon sizing
  - Optimized News grid layout with responsive columns (1-4 columns based on screen size)
  - Added responsive padding, margins, and typography throughout the application
  - Enhanced all components with proper mobile-first design principles
- July 13, 2025. Updated school email addresses and improved news image display
  - Replaced info@robertsoneducation.com with robertsonvocational@gmail.com and obosirobertson@gmail.com
  - Updated all email addresses across Footer, Contact page, Admission page, Results page, and email service
  - Enhanced news image display with better error handling and fallback icons
  - Fixed image loading issues in both News page and News Management with proper error states
  - Updated email service to use new primary email address for contact form submissions
- July 13, 2025. Major system updates for academic session management, school information, and PDF optimization
  - Implemented sophisticated dynamic session generation based on academic calendar (September-August)
  - Updated session system to automatically generate 5 academic years (2 past, current, 2 future)
  - Fixed PDF layout issues with improved pagination and table header repetition on new pages
  - Updated school contact information: Tel: +2348146373297, +2347016774165, Email: info@robertsoneducation.com
  - Updated school address: 1. Theo Okeke's Close, Ozuda Market Area, Obosi Anambra State. Reg No:7779525
  - Enhanced PDF generation with proper space allocation and page break handling
  - Replaced "N/A" values with meaningful default comments for better user experience
  - Updated both Results checker and Admin result creation to use dynamic session generation
  - Improved print and PDF templates with updated school information and branding
- July 13, 2025. Comprehensive system enhancements for scratch card management, contact functionality, and school information
  - Fixed cumulative results page to use dynamic session generation matching other admin pages
  - Enhanced scratch card system with unique PINs per student (removed global uniqueness constraint)
  - Increased PIN usage limit from 10 to 30 attempts per card for better accessibility
  - Added PIN regeneration functionality for expired cards (3-month expiry with admin regeneration)
  - Updated scratch card schema to link PINs to specific students (studentId field)
  - Implemented email functionality for contact form using SMTP integration
  - Created comprehensive email service with contact form notifications to info@robertsoneducation.com
  - Updated all frontend pages with correct school information:
    - Address: 1. Theo Okeke's Close, Ozuda Market Area, Obosi Anambra State. Reg No:7779525
    - Phone: +2348146373297, +2347016774165
    - Email: info@robertsoneducation.com
    - Office Hours: Monday-Friday 8:00 AM - 5:00 PM (weekends closed)
  - Enhanced footer, contact page, and about page with authentic school details
  - Added regeneration API endpoint for admin-controlled PIN renewal after expiry
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

## Recent Updates

- July 13, 2025. Updated email service to use SMTP instead of SendGrid
  - Replaced SendGrid email service with standard SMTP configuration
  - Added nodemailer package for email handling
  - Removed SendGrid dependency from the project
  - Updated email service to use environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  - Maintained same contact form functionality with SMTP backend
- July 13, 2025. Enhanced admin interface with news image support and responsive design
  - Added news image endpoint `/api/news-image/:newsId` using same method as student photo endpoint
  - Updated News.tsx and NewsManagement.tsx to use new image endpoint for proper image display
  - Fixed news image display issues with proper error handling and fallback icons
  - Made admin interface fully responsive with mobile-first design across all screen sizes
  - Enhanced NewsManagement.tsx with responsive table headers and column visibility
  - Added responsive buttons, typography, and spacing throughout admin interface
  - Improved table layouts with proper overflow handling for mobile devices
  - Added print template dropdown functionality to scratch card management
  - Created comprehensive print template system with Standard, Premium, Bulk, and Custom options
  - Added print preview functionality with sample scratch card generation
  - Enhanced scratch card management with responsive design and improved user experience
- July 13, 2025. Comprehensive admin system expansion with management modules and print fixes
  - Fixed school logo display on scratch cards by using full URL path for proper image loading
  - Added comprehensive Admission Management system with application tracking, status management, and settings
  - Created complete Message Management system for handling contact form submissions and inquiries
  - Added comprehensive Settings Management system with school information and system configuration tabs
  - Enhanced print pagination for scratch cards to prevent cutting off cards and properly handle page breaks
  - Compressed card layouts for better paper management with reduced sizes and spacing
  - Implemented 2-column grid layout for standard and premium templates for better print formatting
  - Added full responsive design to all admin management systems including mobile navigation
  - Created professional admin interfaces with statistics, filtering, and CRUD operations
  - Integrated all management systems into main admin layout with proper navigation structure
- July 13, 2025. System cleanup and admission management refinement
  - Removed message management system and all message-related functionality per user request
  - Simplified admission management to focus on publishing admission details for the front page
  - Enhanced scratch card logo display with multiple fallback methods including img tags
  - Refactored admission management to show current settings summary instead of application tracking
  - Updated admission system to focus on configuration and publishing rather than application management
  - Removed all message management navigation and components from admin interface
  - Streamlined admin navigation by removing message management option
- July 13, 2025. Created professional scratch card print templates with Robertson Education logo integration
- July 14, 2025. Removed logo dependencies from scratch card templates per user request
  - Fixed critical template error where logoPath was undefined causing print preview failure
  - Removed all logo-related code from scratch card templates to eliminate dependency issues
  - Created clean, professional templates without logos using only text-based branding
  - Enhanced admission settings with immediate refresh mechanisms (refetchOnWindowFocus, staleTime: 0)
  - Fixed news image display issues by correcting field name mismatches from featuredImage to imageUrl
  - All templates now work properly without external logo dependencies
  - Cards display school name in professional typography without requiring image assets
  - Developed sophisticated template generator function with multiple professional designs
  - Standard Template: Clean design with school logo, gradient borders, and professional styling
  - Premium Template: Enhanced layout with larger logo, advanced styling, and premium appearance
  - Bulk Template: Compact 3-column grid layout optimized for efficient printing
  - Custom Template: Specialized design with usage instructions and dashed borders
  - Integrated Robertson Education logo (red shield design) into all templates
  - Added gradient backgrounds, box shadows, and professional typography using Georgia serif font
  - Implemented responsive grid layouts that adapt to different screen sizes
  - Created color-coded PIN sections with gradient backgrounds for security emphasis
  - Added watermark stamps and official branding elements for authenticity
  - Enhanced print functionality with proper page margins and print-optimized styling
  - All templates now display school information, serial numbers, PINs, and expiry dates professionally