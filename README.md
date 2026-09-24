# Ninja Kekkai Training & Solver

A modern, responsive Mastermind entropy-based solver and interactive training simulator for Ninja Kekkai (Barrier) exams.

## 🚀 How to Run in GitHub

### Option A: Host Free on GitHub Pages (Automated Deployment)

A GitHub Actions workflow is already configured in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push this code to a new repository on your GitHub account (see instructions below).
2. On GitHub, go to your repository **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. That's it! GitHub Actions will automatically build and publish your website at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

### Option B: Run in GitHub Codespaces (Browser-Based Cloud IDE)

1. On your GitHub repository page, click the green **Code** button.
2. Select the **Codespaces** tab and click **Create codespace on main**.
3. Once the Codespace terminal loads, run:
   ```bash
   npm install
   npm run dev
   ```
4. A popup will prompt you to open the forwarded port (port 3000) in your browser.

---

## 📦 How to Push this Code to Your GitHub

If you are downloading or cloning this project, follow these steps in your terminal:

```bash
# 1. Initialize git repository
git init

# 2. Stage all files
git add .

# 3. Commit your changes
git commit -m "feat: Ninja Kekkai Training & Solver"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository (replace with your actual GitHub URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm (comes with Node.js)

### Installation & Execution

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features
- **Mastermind Information Entropy Algorithm**: Calculates mathematically optimal guesses across 2, 3, 4, and 5-slot sequences.
- **Kekkai Sequence Stepper**: Progress from Genin (2-slot) to Jounin (5-slot) exams.
- **Interactive Training Dojo**: Play and train with feedback hints and win streak tracker.
- **Fully Responsive**: Fluid layout adapted for desktop monitors, tablets, and smartphones.
- **Direct Link**: Integrated link to the [Official Ninja Game](https://www.ninjasaga.online/).
