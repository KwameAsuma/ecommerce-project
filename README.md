# 🚀 E-Commerce Platform: Developer Onboarding Guide

Welcome to the team! We have engineered this project to run entirely inside Docker. You do **not** need to install Node.js, PostgreSQL, or NGINX on your local machine. The containers will do all the heavy lifting, while you can simply write code and see it update live.

---

## 🛠️ 1. First-Time Setup (New Developers)

When you first clone this repository, you need to build the initial container blueprints.

1. Clone the repository and `cd` into the project folder.
2. Open your terminal and run the master build command:
   ```bash      
   docker compose up --build
   ```
3. Wait a few minutes for Docker to download the images and install all packages. 
4. Once the terminal output settles, your environment is live!
   * **Frontend UI:** `http://localhost`
   * **Backend API:** `http://localhost/api`
   * **Database Manager:** `http://localhost:8080`

---

## ☀️ 2. The Daily Workflow (Start & Stop)

Because the files are connected via live bind-mounts, you **rarely** need to rebuild the containers. 

**Morning Routine (Starting Work):**
1. Open your terminal and pull the latest code:
   ```bash
   git pull
   ```
2. Start the servers:
   ```bash
   docker compose up
   ```
   *(Notice there is no `--build` flag. It will wake up instantly.)*

**Evening Routine (Stopping Work):**
1. In the terminal where Docker is running, press **`Ctrl + C`**.
2. Run the cleanup command to clear your computer's memory:
   ```bash
   docker compose down
   ```
   *(Your database data is perfectly safe; it is saved in a protected Docker volume).*

---

## 💾 3. Saving & Pushing Your Code

Your Git workflow remains completely normal. Docker does not interfere with Git.

```bash
git add .
git commit -m "feat: added product grid layout"
git push
```

---

## ⚠️ 4. The Dependency Protocol (Adding new npm packages)

Installing new packages requires a specific protocol. This is a two-part rule: Part A protects **your** local environment, and Part B protects **the team's** environment.

**Part A: Protecting Yourself (The "Stop First" Rule)**
If you run `npm install` while Docker is running, the live-reload will instantly crash your container because it tries to use a package that Docker hasn't built into its internal system yet.
1. Turn off your server: `docker compose down`
2. Install your package locally: `cd frontend && npm install <package-name>`
3. Rebuild your container so it registers the package: `cd .. && docker compose up --build`

**Part B: Protecting the Team (The Commit Rule)**
When you push this new dependency to GitHub, you MUST warn the team so their containers don't crash when they download your code.
* Include a warning in your commit: `git commit -m "feat: added new router package (REQUIRES REBUILD)"`

**When you pull code that says "(REQUIRES REBUILD)":**
If you run `git pull` and see that a teammate added new dependencies, do not run the standard `up` command. Instead, run:
```bash
docker compose up --build
```
