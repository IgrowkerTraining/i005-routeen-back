# 📱 Routeen

**Routeen** is a _SportTech_ app designed for trainers and athletes who want to manage workout routines in a digital, fast, and intuitive way.

It allows trainers to create and assign personalized plans for each athlete, including exercises, reps, weights, and rest times. Athletes can access their routines from any device using a unique OTP code, eliminating the need for spreadsheets or external apps.

The platform also lets athletes update their progress in real time (modify weights, mark completed exercises, etc.), and trainers receive automatic notifications to adjust routines based on performance.

A control panel for trainers is included, where they can manage athletes, routines, and quickly access training history.

---

## 🛠 Tech Stack

This repository contains the **backend** of the Routeen app, built with the following technologies:

- **Next.js** – Server-side logic and API routes
- **MongoDB** – Database for storing users, routines, exercises, and training data
- **Cloudinary** – Image hosting for exercise illustrations and uploads
- **JWT (JSON Web Tokens)** – Authentication system to protect API routes
- **Twilio** – Messaging service used to send OTP codes to athletes via WhatsApp

---

## 🚀 Getting Started

To get started with the Routeen backend, follow these steps:

1. **Fork the repository**  
   Fork this repository to your own GitHub account to start working on it.

2. **Clone the repository**  
   Clone your forked repository to your local machine:

   ```bash
   git clone https://github.com/your-username/routeen.git
   ```

3. **Install dependencies**  
   Once you have the repo in your code editor, install the project dependencies. You can use one of the following commands depending on your package manager:

   ```bash
   npm install
   #or
   yarn install
   #or
   pnpm install
   ```

4. **Create a `.env.local` file**  
   Create a `.env.local` file in the root directory of the project. Use the `.env.template` file as a reference to set up your local environment variables.

5. **Run the project**  
   After setting up the environment variables, run the following command to start the application in development mode:

   ```bash
   npm run dev
   #or
   yarn run
   #or
   pnpm run
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).
