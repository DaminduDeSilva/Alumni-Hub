# Alumni Hub - Supervisor User Guide

## Overview
Alumni Hub is a centralized platform designed to connect alumni, manage their data, and organize events. It features a hierarchical administration system ensuring that data verification and event management are handled efficiently across different engineering fields.

---

## 1. Access & Authentication
*   **Super Admin Login**: Logs in using an **email and password** (hardcoded/assigned in the database).
*   **General User Login (Members & Field Admins)**: Log in using their **email account via Google OAuth2**.
*   **Account Creation**: 
    *   New users log in with Google. If the email is new, an account is created with the role **UNVERIFIED**.
    *   If the email matches an existing record, they are logged in with their assigned role (e.g., Verified Member or Field Admin).

---

## 2. User Roles & Hierarchy

### A. Super Admin
*   **Authority**: Highest level of access.
*   **Key Responsibilities**:
    *   **Manage System Admins**: The exclusive ability to assign or remove **Field Admins** for specific engineering fields.
    *   **Global Oversight**: Can view and manage data across *all* engineering fields.
    *   **Event Management**: Can create, edit, delete events, and manage attendance for any event.

### B. Field Admin
*   **Authority**: Mid-level access, restricted to a specific engineering field (e.g., Computer, Civil, Electrical).
*   **Key Responsibilities**:
    *   **Verification**: Reviewing and approving/rejecting profile submissions from alumni in their assigned field.
    *   **Data Management**: Generating reports and viewing directory data for their specific field.
    *   **Event Support**: Can mark attendance for events.

### C. Verified Member
*   **Authority**: Standard user access.
*   **Capabilities**:
    *   **Profile**: Can view and edit their own profile details.
    *   **Events**: Can browse upcoming events and register for them.
    *   **Note**: Verified members **cannot** view the directory of other members for privacy reasons.

### D. Unverified / New User
*   **Authority**: Restricted access.
*   **Capabilities**:
    *   Can only access the "Submit Data" form to provide their details for verification.
    *   Cannot view the directory or register for events until verified.

---

## 3. The User Lifecycle Flow

### Step 1: Onboarding
1.  A new batchmate logs in with Google.
2.  They are directed to the **Submit Data** page.
3.  They fill out their profile (Full Name, Engineering Field, Contact Info, Work Place, etc.) and upload a photo.
4.  Upon submission, their status remains **PENDING** review.

### Step 2: Verification (The Admin's Role)
1.  **Field Admins** (or Super Admins) log into their Dashboard.
2.  Top Navigation Bar **Notification Bell**:
    *   Admins see a badge count (e.g., +1, +2) indicating new pending submissions.
    *   Clicking the notification leads directly to the **Pending Submissions** review page.
    *   *Example: The Computer Engineering Admin sees only Computer Engineering applicants.*
3.  The Admin reviews the data:
    *   **Approve**: The user becomes a **VERIFIED MEMBER**. They gain full access to the portal.
    *   **Reject**: The submission is returned with a reason. The user must correct their data and resubmit.

### Step 3: Verified User Access
1.  Once approved, the next time the user logs in:
    *   They see a **Notification** confirming their account verification.
    *   They gain access to the **Events** and **Profile** sections.

---

## 4. Administrative Workflows

### 4.1 Assigning Field Admins (Super Admin Only)
*   **Navigate to**: Admin Dashboard > Field Admin Management.
*   **Action**: Select an Engineering Field (e.g., "Mechanical") and a registered user from the dropdown.
*   **Result**: That user is elevated to **FIELD_ADMIN**. They will now see the Admin Dashboard when they log in.
*   **Note**: You can also remove admin privileges here.

### 4.2 Managing Events
*   **Create Event**: Super Admins navigate to the **Events** page and click "Create Event".
*   **Event Details**: Add title, description, date, time, and location.
*   **Registration**: Verified members can click "Register" on an event card.
*   **Attendance**:
    *   Admins (Super & Field) go to the event details.
    *   They can see a list of registered users.
    *   They can mark users as **Present** or **Absent**.

### 4.3 Generating Reports
*   **Navigate to**: Admin Dashboard > Reports.
*   **Filtering**: Select specific Engineering Fields or Countries.
*   **Export**: Download the filtered data as a formatted **PDF** or **Excel** file.

### 4.4 Directory
*   **Access**: Restricted to **Super Admins** and **Field Admins** only.
*   **Function**: A searchable list of alumni. Admins can view full details to manage and verify membership.
*   **Note**: Regular members do not have access to the directory.

---

## 5. Summary of Flow
1.  **User logs in** (Google).
2.  **User submits data** (Field, Contact info).
3.  **Field Admin reviews data** (Notified via Bell Icon).
4.  **Admin approves user** -> User becomes **Verified Member**.
5.  **Verified Member** is notified via Bell Icon and can now:
    *   Register for Events.
    *   Update their Profile.
6.  **Super Admin** oversees the whole process and manages the Field Admin team and Directory.
