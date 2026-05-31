# EduPredict — Student Performance Prediction System

A modern, AI-powered student performance prediction tool for **schools and colleges**. Predict outcomes, identify at-risk students, and get actionable recommendations — all in a stunning dashboard that deploys seamlessly to **Netlify**.

![EduPredict](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## Features

- **Multi-factor prediction engine** — Attendance, GPA, study hours, assignments, exams, participation, sleep, extracurriculars, and parental support
- **School & College modes** — Different weight profiles for K-12 vs. higher education
- **Risk classification** — Critical, At Risk, Moderate, Good, Excellent
- **Smart recommendations** — Personalized intervention suggestions
- **Dashboard analytics** — Class averages, risk distribution charts, recent predictions
- **Student management** — Search, filter, export/import JSON data
- **100% client-side** — No backend required; data stored in browser localStorage
- **Netlify-ready** — Static SPA with SPA redirect rules included

## Quick Start (Local)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to Netlify

### Option 1: Git-based deploy (recommended)

1. Push this repo to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Connect your repository
4. Netlify auto-detects settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**

### Option 2: Manual deploy

```bash
npm install
npm run build
```

Drag and drop the `dist` folder onto [Netlify Drop](https://app.netlify.com/drop).

### Option 3: Netlify CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## How Prediction Works

EduPredict uses a research-informed weighted scoring model:

| Factor | School Weight | College Weight |
|--------|--------------|----------------|
| Attendance | 18% | 12% |
| Previous GPA | 15% | 20% |
| Study Hours | 12% | 18% |
| Assignments | 14% | 15% |
| Exam Scores | 16% | 18% |
| Participation | 8% | 6% |
| Sleep | 7% | 5% |
| Extracurricular | 4% | 3% |
| Parental Support | 6% | 3% |

Each factor is normalized to 0–100, combined via weighted sum, and mapped to risk tiers with tailored recommendations.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — Dark glassmorphism UI
- **Framer Motion** — Smooth animations
- **Recharts** — Radar & bar charts
- **Lucide React** — Icons

## Project Structure

```
├── netlify.toml          # Netlify build & SPA redirects
├── src/
│   ├── components/       # UI components
│   ├── lib/
│   │   ├── predictor.ts  # Prediction engine
│   │   └── storage.ts    # LocalStorage helpers
│   └── types/            # TypeScript types
└── public/
```

## License

MIT — Free for educational institutions worldwide.
