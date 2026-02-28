# 🔍 Developer Intelligence Platform

A modern recruitment intelligence platform that helps IT recruiters discover, analyze, and manage software developers through GitHub profile analysis and campaign tracking.

**Live Demo:** [dev-intel-seven.vercel.app](https://dev-intel-seven.vercel.app)

---

## ✨ Features

- **GitHub Developer Search** — Search any GitHub profile and instantly view skills, repositories, languages, and activity
- **Developer Management** — Save, annotate, and organize developer profiles with custom notes and contact info
- **Campaign System** — Create recruitment campaigns and track developers across your pipeline
- **Kanban Pipeline** — Drag-and-drop board with stages: New Lead → Contacted → Responded → Interview → Offer → Hired
- **Notification Center** — In-app notifications for campaign and developer activity
- **Secure Authentication** — Email/password auth with verification, session management, and password reset

---

## 🛠️ Tech Stack

| Layer              | Technology                  |
| ------------------ | --------------------------- |
| Framework          | Next.js 16.1.6 (App Router) |
| UI Library         | React 18                    |
| Styling            | Tailwind CSS 3.4            |
| State Management   | TanStack Query v5           |
| Backend & Database | Supabase (PostgreSQL)       |
| Authentication     | Supabase Auth               |
| Deployment         | Vercel                      |
| External API       | GitHub REST API             |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/developer-intelligence.git
cd developer-intelligence
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up the database**

Run the following SQL in your Supabase SQL editor:

```sql
-- Developers table
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES auth.users(id),
  github_username TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  skills JSONB,
  github_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign developers (pipeline)
CREATE TABLE campaign_developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  stage TEXT DEFAULT 'new_lead',
  added_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(campaign_id, developer_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_developers_recruiter ON developers(recruiter_id);
CREATE INDEX idx_developers_username ON developers(github_username);
CREATE INDEX idx_campaigns_recruiter ON campaigns(recruiter_id);
CREATE INDEX idx_campaign_devs_campaign ON campaign_developers(campaign_id);
CREATE INDEX idx_notifications_recruiter ON notifications(recruiter_id);

-- Row Level Security
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_developers" ON developers USING (recruiter_id = auth.uid());
CREATE POLICY "own_campaigns" ON campaigns USING (recruiter_id = auth.uid());
CREATE POLICY "own_notifications" ON notifications USING (recruiter_id = auth.uid());
CREATE POLICY "own_pipeline" ON campaign_developers
  USING (campaign_id IN (SELECT id FROM campaigns WHERE recruiter_id = auth.uid()));
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
developer-intelligence/
├── app/
│   ├── (auth)/               # Login, signup, reset password
│   ├── (dashboard)/          # Protected pages
│   │   ├── page.js           # Dashboard home
│   │   ├── search/           # GitHub developer search
│   │   ├── developers/       # Saved developers list
│   │   ├── campaigns/        # Campaign management
│   │   └── pipeline/[id]/    # Kanban pipeline board
│   └── api/                  # API route handlers
├── components/
│   ├── layout/               # Sidebar, Header
│   ├── ui/                   # Button, Input, Card, Modal
│   └── features/             # DeveloperCard, CampaignCard, PipelineColumn
├── hooks/                    # useNotifications, useDevelopers, useRealtimeTable
├── lib/
│   ├── supabase/             # Client, server, middleware setup
│   └── utils/                # GitHub API, validation helpers
└── middleware.js             # Auth route protection
```

---

## 🔐 Authentication

- Email and password registration with email verification
- Secure JWT sessions stored in `httpOnly` cookies
- 7-day session duration with automatic refresh
- Password reset via email link
- Route protection via Next.js middleware

---

## 🗺️ Roadmap

- [ ] Real-time pipeline updates (Supabase Realtime)
- [ ] Team/organization support with role-based access
- [ ] Advanced developer search with filters (skills, location, activity)
- [ ] Bulk email outreach campaigns
- [ ] Scheduled GitHub profile auto-refresh
- [ ] Mobile app (React Native)
- [ ] API rate limit handling with quota display

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

```

```
