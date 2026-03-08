# Co-op Support Application

A web-based platform designed to streamline the co-op program administration process, supporting applicants, students, work supervisors, and co-op coordinators throughout the full co-op lifecycle.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Iteration Plan](#iteration-plan)
- [Security](#security)
- [Contributing](#contributing)

---

## Overview

The Co-op Support Application replaces manual co-op program coordination with a centralized platform. It handles the full lifecycle of a student's co-op experience — from initial application and provisional acceptance, through work term report submission and employer evaluation, to final acceptance decisions.

---

## Features

### For Applicants
- Submit a co-op application using name, student ID, and school email
- Receive email notifications on provisional and final acceptance decisions

### For Students (Accepted Applicants)
- Log in with school email and a system-generated default password
- Mandatory password setup on first login
- Password reset via email verification
- Upload work term report as a PDF before the deadline
- Access a downloadable report template
- View submission status and upcoming deadlines from a personal dashboard

### For Work Supervisors
- Create a supervisor account and log in securely
- Submit an employer evaluation for a supervised student by either:
  - Uploading a scanned PDF of the paper evaluation form, or
  - Completing an equivalent online form

### For Co-op Coordinators
- Access an admin dashboard to manage all applicants and students
- Create student accounts using school emails
- Review applications and issue provisional and final acceptance decisions
- Track work term report and employer evaluation submission statuses
- Send email reminders to students and supervisors with outstanding submissions
- Track students rejected from or dismissed from their co-op placements

---

## User Roles

| Role | Description |
|---|---|
| **Applicant** | A prospective student who has submitted a co-op application |
| **Student** | A finally accepted applicant with a system account |
| **Supervisor** | An employer who supervises a student during their work term |
| **Co-op Coordinator** | An administrator who manages the full co-op program |

---

## Getting Started

### Prerequisites

- Node.js v18+
- A running database instance (e.g., PostgreSQL)
- An email service configured (e.g., SMTP or SendGrid)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/coop-support-app.git
   cd coop-support-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```
   Fill in your database connection string, email service credentials, and any secret keys.

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

---

## Usage

### Student Login Flow
1. The co-op coordinator creates a student account using the student's school email.
2. The student receives a confirmation email with their default password (generated from their student ID).
3. On first login, the student is prompted to set a new password before accessing the platform.
4. From the dashboard, the student can upload their work term report before the deadline.

### Supervisor Evaluation Flow
1. The supervisor creates an account using their name, company, and email.
2. The supervisor logs in and is linked to the student(s) they supervised.
3. The supervisor submits an evaluation either as a scanned PDF upload or by filling in the online form.

### Coordinator Workflow
1. Review incoming applications from the admin dashboard.
2. Issue provisional acceptance or rejection decisions.
3. At a later date, issue final acceptance or rejection decisions.
4. Monitor report and evaluation submission statuses and send reminders as needed.

---

## Requirements

### Functional
- Student account creation by co-op coordinators
- Secure student authentication with forced first-login password change
- Password reset via time-limited email verification link
- Work term report submission (PDF) with deadline enforcement
- Employer evaluation submission (PDF upload or online form)
- Supervisor account creation and authentication
- Application status tracking (provisional and final decisions)
- Co-op placement rejection tracking
- Coordinator reporting dashboard
- Email notifications and reminders

### Non-Functional
- All passwords stored using secure hashing (e.g., bcrypt)
- HTTPS enforced across all communications
- Role-based access control separating student, supervisor, and coordinator capabilities
- File uploads validated by extension, MIME type, and file size to prevent malicious file uploads
- Uploaded files stored outside the web root to prevent direct execution
- All key actions logged with timestamps and actor identity

---

## Iteration Plan

| Iteration | Focus | Key Stories |
|---|---|---|
| **Iteration 1** | Authentication & Account Foundation | Create student accounts, first-login password setup, student login |
| **Iteration 2** | Core Student Features | Work term report upload, student dashboard, deadline enforcement |
| **Iteration 3** | Supervisor & Recovery Features | Supervisor accounts, employer evaluation submission, forgot password |
| **Iteration 4** | Coordinator Tools & Reporting | Application review, reporting dashboard, email reminders, placement rejection tracking |

---

## Security

- Passwords are hashed before storage and never stored in plain text
- Password reset tokens are time-limited and invalidated after a single use
- File uploads are restricted to PDF format only, validated by both file extension and MIME type
- The system is protected against unrestricted file upload vulnerabilities by storing files outside the publicly accessible web directory
- Sessions expire after a period of inactivity
- Failed login attempts are rate-limited to prevent brute force attacks

---

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Follow the existing code style and naming conventions.
3. Write or update tests for any new functionality.
4. Open a pull request with a clear description of your changes.

For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.