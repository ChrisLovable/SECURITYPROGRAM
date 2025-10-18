# GuardRoster - Security Guard Scheduling PWA

A production-ready Progressive Web App for security companies to schedule and optimize guard shifts with mobile-first design and intuitive UI for all education levels.

## 🚀 Features

### Core Functionality
- **60/12 Day Cycle**: Guards work 60 days ON, 12 days OFF (72-day rolling cycle)
- **Smart Scheduling**: Permanent assignments first, then rotation with stability preference
- **Resource Optimization**: Automatic roster filling with gap detection
- **Leave Management**: Guard → Supervisor → Manager approval workflow
- **Swap System**: Guard-to-guard shift swaps with approval
- **Real-time Notifications**: Web push, SMS, and in-app alerts

### Mobile-First Design
- **Large Touch Targets**: 44px+ buttons for easy mobile interaction
- **Plain Language**: Simple words, no jargon
- **High Contrast**: Accessible design for all users
- **Offline Support**: 30-day roster cache, background sync
- **PWA Features**: Installable, works offline, push notifications

### User Roles
- **Guards**: Simple portal to view schedule, request leave/swaps
- **Supervisors**: Approve leave requests, manage swaps
- **Managers**: Final approval, resource optimization, analytics

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **State Management**: React Query + Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email + OTP)
- **Backend**: Supabase Edge Functions (TypeScript)
- **PWA**: Service Worker + Workbox
- **Time Zone**: Africa/Johannesburg

## 📊 Business Rules

### Staffing Requirements
- **Total Guards**: 69
- **Total Posts**: 39 (across 17 sites)
- **Permanent Assignments**: 20 guards
- **Rotation Pool**: 49 guards

### Site Requirements
```
Site 1:  1 base post
Site 2:  3 base + 1 relief
Site 3:  2 base posts
Site 4:  1 base post
Site 5:  2 base posts
Site 6:  1 base post
Site 7:  1 base post
Site 8:  1 base post
Site 9:  1 base post
Site 10: 1 base + 1 relief
Site 11: 7 base posts
Site 12: 2 base posts
Site 13: 1 base post
Site 14: 2 base posts
Site 15: 2 base posts
Site 16: 4 base + 1 relief
Site 17: 4 base posts
```

### Scheduling Algorithm
1. Fill permanent site assignments first
2. Use rotation pool for remaining base posts and all relief posts
3. Prefer guards who worked at the same site recently (stability)
4. Balance total days worked across guards over time
5. Respect 60/12 cycle - never schedule ON during OFF window

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd guardroster
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
1. Create a new Supabase project
2. Run the database migrations:
   ```bash
   # Copy migration files to your Supabase project
   # Run migrations in order:
   # 001_initial_schema.sql
   # 002_seed_data.sql
   # 003_leave_management.sql
   ```

### 4. Configure Environment
```bash
cp env.example .env.local
```

Update `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Deploy functions
supabase functions deploy optimize
supabase functions deploy notify
supabase functions deploy swaps-approve
```

### 6. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 📱 PWA Setup

### 1. Generate Icons
Create PWA icons (192x192 and 512x512) and place them in `/public`:
- `pwa-192x192.png`
- `pwa-512x512.png`

### 2. Test PWA Features
1. Open Chrome DevTools → Application → Service Workers
2. Test offline functionality
3. Install app on mobile device

### 3. Configure Push Notifications
1. Set up VAPID keys in Supabase
2. Update notification service in Edge Functions
3. Test push notifications on mobile

## 🗄️ Database Schema

### Core Tables
- **guards**: Guard information, cycle start, assignments
- **sites**: Site requirements and configuration
- **assignments**: Daily roster assignments
- **leave_requests**: Leave requests with approval workflow
- **swaps**: Guard swap requests
- **notifications**: Scheduled notifications
- **user_roles**: User role assignments

### Key Relationships
- Guards can be assigned to permanent sites
- Assignments link guards to sites for specific dates
- Leave requests require supervisor → manager approval
- Swaps require supervisor approval

## 🔧 Configuration

### Time Zone
Default timezone is `Africa/Johannesburg`. To change:
1. Update `TIMEZONE` constant in `src/types/index.ts`
2. Update date formatting functions in `src/utils/scheduling.ts`

### Cycle Length
Default is 72 days (60 ON + 12 OFF). To modify:
1. Update constants in `src/types/index.ts`
2. Update scheduling algorithms in `src/utils/scheduling.ts`

### Site Requirements
Modify site requirements in `supabase/migrations/002_seed_data.sql`

## 📊 Monitoring & Analytics

### Key Metrics
- **Coverage Percentage**: Filled posts / Total posts
- **Unfilled Gaps**: Posts without assigned guards
- **Resource Utilization**: Guard efficiency metrics
- **Leave Approval Rate**: Leave request statistics

### Dashboard Features
- Today's coverage overview
- Next 7 days gap analysis
- Auto-fill optimization
- Resource recommendations

## 🔐 Security

### Row Level Security (RLS)
- Guards can only view their own data
- Supervisors can manage their assigned guards
- Managers have full access
- All tables have appropriate RLS policies

### Authentication
- Email + OTP login (no passwords)
- Session management via Supabase
- Automatic token refresh

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

### Supabase Production
1. Create production Supabase project
2. Run migrations
3. Deploy Edge Functions
4. Configure custom domain

## 📱 Mobile Optimization

### Touch Targets
- Minimum 44px touch targets
- Large buttons with clear labels
- Swipe gestures for navigation

### Offline Support
- Service worker caches app shell
- 30-day roster data cached
- Background sync for offline actions

### Performance
- Lazy loading for routes
- Image optimization
- Bundle splitting

## 🧪 Testing

### Run Tests
```bash
npm run test:e2e
```

### Test Coverage
- Core scheduling algorithms
- Leave approval workflow
- Swap management
- PWA functionality

## 📞 Support

### Common Issues
1. **Authentication fails**: Check Supabase URL and keys
2. **PWA not installing**: Verify manifest.json and service worker
3. **Notifications not working**: Check VAPID configuration
4. **Offline not working**: Verify service worker registration

### Getting Help
- Check Supabase documentation
- Review React Query docs
- PWA troubleshooting guide

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor coverage metrics
- Review leave approval patterns
- Update guard assignments
- Optimize resource allocation

### Backup Strategy
- Supabase automatic backups
- Export critical data regularly
- Test restore procedures

## 📈 Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Mobile app (React Native)
- Integration with payroll systems
- AI-powered scheduling optimization
- Multi-language support

### Customization Options
- Custom cycle lengths
- Flexible site requirements
- Custom approval workflows
- Branded UI themes

---

**Built with ❤️ for security companies who value their guards and efficient operations.**








