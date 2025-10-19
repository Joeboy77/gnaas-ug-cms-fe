# GNAAS CMS Frontend

A modern, responsive frontend application for the Ghana National Association of Adventist Students (GNAAS) Content Management System, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Authentication System**: Secure login with role-based access control
- **Student Management**: Complete CRUD operations with search, filtering, and pagination
- **Attendance System**: Mark attendance, track members, manage visitors
- **Dashboard Analytics**: Real-time statistics and insights
- **Data Export**: Export data in multiple formats with advanced filtering
- **Reports & Charts**: Interactive reports with high-quality visualizations

### Advanced Features
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Notification System**: Real-time notifications with toast messages
- **Profile Management**: User profile images and password management
- **Interactive Charts**: Professional charts using Recharts library
- **Advanced Filtering**: Multi-criteria filtering with real-time preview
- **Batch Operations**: Bulk student promotion and management

### User Interfaces
- **Secretary Dashboard**: Student overview, quick actions, attendance tracking
- **Admin Dashboard**: Comprehensive analytics, user management, system controls
- **Student Management**: Full CRUD interface with advanced search
- **Reports Page**: Interactive charts and data visualizations
- **Export Data**: Advanced filtering and multi-format export

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Icons**: Heroicons
- **Date Handling**: date-fns
- **HTTP Client**: Fetch API
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running (see backend README)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gnaas-cms-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   VITE_APP_NAME=GNAAS CMS
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 📁 Project Structure

```
gnaas-cms-fe/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, logos, static files
│   ├── components/        # Reusable UI components
│   │   ├── AdminProfileDropdown.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── Card.tsx
│   │   ├── ConfirmationModal.tsx
│   │   ├── EditStudentModal.tsx
│   │   ├── ExportDataModal.tsx
│   │   ├── NotificationDropdown.tsx
│   │   ├── NotificationManager.tsx
│   │   ├── NotificationToast.tsx
│   │   ├── ProfileModal.tsx
│   │   ├── SecretaryProfileButton.tsx
│   │   ├── StatIcon.tsx
│   │   └── UserInfoModal.tsx
│   ├── contexts/          # React contexts
│   │   └── NotificationContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useNotificationShortcuts.ts
│   ├── pages/             # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── ExportData.tsx
│   │   ├── Login.tsx
│   │   ├── ManageLevels.tsx
│   │   ├── MarkAttendance.tsx
│   │   ├── Reports.tsx
│   │   ├── SecretaryDashboard.tsx
│   │   ├── StudentAdd.tsx
│   │   ├── Students.tsx
│   │   └── WeeklyAttendance.tsx
│   ├── services/          # API services
│   │   └── notificationService.ts
│   ├── store/             # State management
│   │   ├── auth.ts
│   │   └── notifications.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── index.ts
│   │   └── notification.ts
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 UI Components

### Core Components

#### AdminProfileDropdown
- **Purpose**: Admin profile management with password change and secretary creation
- **Features**: Avatar display, password change, logout, add secretary functionality
- **Responsive**: Mobile-optimized with full-screen modal on small devices

#### SecretaryProfileButton
- **Purpose**: Secretary profile button with image support
- **Features**: Profile image display, fallback to initials, error handling
- **Usage**: Used across all secretary pages

#### NotificationDropdown
- **Purpose**: Real-time notification management
- **Features**: Bell icon with count, notification list, mark as read, clear all
- **Integration**: Keyboard shortcuts support

#### AdminSidebar
- **Purpose**: Navigation sidebar for admin pages
- **Features**: Responsive design, mobile menu, navigation links
- **Pages**: Dashboard, Students, Reports, Export Data, Manage Levels

### Modal Components

#### UserInfoModal
- **Purpose**: Display detailed student information
- **Features**: Complete student profile, academic info, contact details
- **Usage**: Triggered by clicking student rows or view buttons

#### ProfileModal
- **Purpose**: User profile management for secretaries
- **Features**: Profile image display, password change, logout
- **Integration**: Secretary profile button integration

#### ConfirmationModal
- **Purpose**: Confirmation dialogs for destructive actions
- **Features**: Customizable message, confirm/cancel actions
- **Usage**: Delete confirmations, critical actions

#### EditStudentModal
- **Purpose**: Edit student information
- **Features**: Form validation, all student fields, save/cancel
- **Integration**: Students page integration

## 📱 Pages & Features

### Authentication
- **Login Page**: Role-based login (SUPER_ADMIN, SECRETARY)
- **Protected Routes**: Automatic redirection based on user role
- **Session Management**: Persistent authentication with Zustand

### Secretary Interface

#### Secretary Dashboard
- **Student Overview**: Total students, recent additions, quick stats
- **Quick Actions**: Add student, mark attendance, view reports
- **Recent Students**: Latest student additions with search
- **Student Table**: Paginated list with search and filters
- **Profile Integration**: Profile image in navbar and modal

#### Mark Attendance
- **Daily Attendance**: Mark present/absent members
- **Visitor Management**: Add and track visitors
- **Attendance Summary**: Real-time attendance statistics
- **Session Management**: Open/close attendance sessions

#### Weekly Attendance
- **Statistics Display**: Weekly and monthly attendance trends
- **Interactive Charts**: Bar charts and trend visualizations
- **Date Filtering**: Week selection and date range filtering
- **Export Options**: Export attendance reports

### Admin Interface

#### Admin Dashboard
- **System Overview**: Total users, students, attendance statistics
- **Analytics Charts**: Attendance insights, gender distribution, hall distribution
- **Batch Operations**: Student promotion, alumni management
- **Export Tools**: Data export with filtering options
- **Profile Management**: Admin profile with secretary creation

#### Students Management
- **Student CRUD**: Create, read, update, delete students
- **Advanced Search**: Search by name, ID, email, phone
- **Filtering**: Filter by level, hall, gender, role, status
- **Pagination**: Efficient data loading with pagination
- **Bulk Operations**: Batch actions and operations

#### Reports Page
- **Interactive Charts**: Professional charts with Recharts
- **Report Types**: Attendance, levels, halls, gender, trends
- **Date Filtering**: Custom date range selection
- **Export Functionality**: Export reports in multiple formats
- **Real-time Data**: Live data from backend API

#### Export Data
- **Advanced Filtering**: Multi-criteria filtering system
- **Format Options**: PDF, Excel, CSV export formats
- **Preview System**: Real-time preview of filtered data
- **Include Options**: Select specific fields to export
- **Date Range**: Custom date range filtering

#### Manage Levels
- **Student Promotion**: Batch promotion between levels
- **Alumni Management**: Manage alumni status transitions
- **Level Analytics**: Level-wise student distribution
- **Validation**: Smart promotion validation based on program duration

## 🎯 State Management

### Zustand Stores

#### Auth Store (`store/auth.ts`)
```typescript
interface AuthState {
  token: string | null;
  role: 'SUPER_ADMIN' | 'SECRETARY' | null;
  user: any | null;
  setAuth: (token: string, role: Role, user: any) => void;
  updateUser: (user: any) => void;
  logout: () => void;
}
```

#### Notification Store (`store/notifications.ts`)
```typescript
interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}
```

## 🎨 Styling & Design

### Tailwind CSS Configuration
- **Custom Colors**: Brand colors for GNAAS
- **Responsive Design**: Mobile-first approach
- **Component Classes**: Reusable utility classes
- **Dark Mode**: Ready for future dark mode implementation

### Design System
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized spacing scale
- **Colors**: Brand-consistent color palette
- **Components**: Reusable component patterns

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔔 Notification System

### Features
- **Real-time Notifications**: Instant notification display
- **Toast Messages**: Non-intrusive toast notifications
- **Notification Dropdown**: Centralized notification management
- **Keyboard Shortcuts**: Quick notification access
- **Auto-dismiss**: Automatic notification cleanup

### Notification Types
- **Success**: Operation completed successfully
- **Error**: Operation failed or error occurred
- **Warning**: Important warnings or alerts
- **Info**: General information messages
- **System**: System-generated notifications

## 📊 Charts & Visualizations

### Recharts Integration
- **Bar Charts**: Attendance statistics, level distribution
- **Pie Charts**: Gender distribution, hall distribution
- **Area Charts**: Attendance trends over time
- **Line Charts**: Monthly trends and patterns

### Chart Features
- **Responsive**: Automatically adapts to container size
- **Interactive**: Hover effects and tooltips
- **Customizable**: Brand colors and styling
- **Export Ready**: Charts can be exported with reports

## 🚀 Performance Optimizations

### Code Splitting
- **Route-based Splitting**: Lazy loading of page components
- **Component Splitting**: Dynamic imports for heavy components
- **Bundle Optimization**: Minimized bundle sizes

### State Management
- **Selective Updates**: Only update necessary components
- **Memoization**: React.memo for expensive components
- **Efficient Re-renders**: Optimized state updates

### API Optimization
- **Debounced Search**: Reduced API calls for search
- **Pagination**: Efficient data loading
- **Caching**: Smart caching strategies

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 📱 Mobile Responsiveness

### Mobile-First Design
- **Touch-friendly**: Large touch targets and gestures
- **Responsive Navigation**: Collapsible sidebar and mobile menu
- **Optimized Forms**: Mobile-optimized form inputs
- **Readable Typography**: Appropriate font sizes for mobile

### Responsive Components
- **Tables**: Horizontal scroll on mobile
- **Charts**: Responsive chart containers
- **Modals**: Full-screen modals on mobile
- **Navigation**: Mobile-optimized navigation patterns

## 🔧 Development

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality assurance

### Development Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables (Production)
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=GNAAS CMS
VITE_APP_VERSION=1.0.0
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFront, Cloudflare
- **Server**: Nginx, Apache

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **Session Management**: Secure session handling
- **Password Security**: Secure password handling

### Data Protection
- **Input Validation**: Client-side validation
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Cross-site request forgery protection
- **Secure Headers**: Security headers configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation
- Review the component examples

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added notification system and profile management
- **v1.2.0** - Enhanced charts and reporting features
- **v1.3.0** - Improved mobile responsiveness and performance
- **v1.4.0** - Added advanced filtering and export capabilities

## 🎯 Future Enhancements

### Planned Features
- **Dark Mode**: Theme switching capability
- **Offline Support**: Progressive Web App features
- **Advanced Analytics**: More detailed reporting
- **Bulk Operations**: Enhanced batch processing
- **Real-time Updates**: WebSocket integration
- **Multi-language**: Internationalization support

### Performance Improvements
- **Virtual Scrolling**: For large data sets
- **Image Optimization**: Lazy loading and compression
- **Bundle Splitting**: Further optimization
- **Caching Strategy**: Advanced caching mechanisms

---

**Built with ❤️ for GNAAS UG**