# Blogger Platform

A full-stack blogging platform built using Next.js, Supabase, and Google Gemini API.
This platform supports role-based authentication, blog creation, comments, AI-generated summaries, and admin moderation.

---

# Features

* User Authentication using Supabase Auth
* Role-Based Access Control

  * Viewer
  * Author
  * Admin
* Create and Manage Blog Posts
* AI Summary Generation using Gemini API
* Comments System
* Protected Routes
* Responsive Dashboard UI
* Search and Post Listing
* Role-specific Navigation and Permissions

---

# Tech Stack Used

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

## Backend

* Supabase
* Supabase Auth
* PostgreSQL Database

## AI Integration

* Google Gemini API

## Validation

* Zod

## Deployment

* Vercel 

---

# Project Structure

```bash
app/
components/
lib/
proxy.ts
public/
types/
```

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/your-username/Blogger.git
```

```bash
cd blogger
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Create Environment Variables

Create:

```bash
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 4. Configure Supabase Database

Create these tables:

### Users Table

| Column | Type |
| ------ | ---- |
| id     | UUID |
| name   | TEXT |
| email  | TEXT |
| role   | TEXT |

---

### Posts Table

| Column    | Type |
| --------- | ---- |
| id        | UUID |
| title     | TEXT |
| body      | TEXT |
| image_url | TEXT |
| summary   | TEXT |
| author_id | UUID |

---

### Comments Table

| Column       | Type |
| ------------ | ---- |
| id           | UUID |
| post_id      | UUID |
| user_id      | UUID |
| comment_text | TEXT |

---

### Bookmarks Table

| Column       | Type |
| ------------ | ---- |
| id           | UUID |
| user_id      | UUID |
| post_id      | UUID |

---

# Running Project Locally

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Deployment Steps

## Deploy to Vercel

### 1. Push Repository to GitHub

```bash
git push origin main
```

### 2. Import Project Into Vercel

* Open Vercel Dashboard
* Import GitHub Repository
* Select Project

### 3. Add Environment Variables

Add:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
GEMINI_API_KEY
```

### 4. Deploy

Click Deploy.

---

# Role Permissions

## Viewer

* View posts
* Add comments
* Cannot create posts

## Author

* Create posts
* Edit own posts
* View comments on own posts

## Admin

* View all posts
* Edit any post
* Delete comments
* Monitor platform activity

---

# AI Summary Flow

1. Author creates post
2. Post body sent to Gemini API
3. Summary generated
4. Summary stored in database
5. Summary displayed in post listing and post detail page

---


