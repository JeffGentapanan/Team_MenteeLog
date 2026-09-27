# Duplicate cleanup — 27 September 2026

Kept frontend/ as the single working website. SHA-256 content comparisons confirmed every removed file had a retained copy.

Removed the extracted MenteeLog-Frontend/ folder (27 matching files) and redundant MenteeLog-Frontend.zip (27 matching archive entries). Recreate an archive from frontend/ when needed; there is no separate version to maintain.

Removed duplicate images (removed → retained):

- MenteeLog-Database-ERD.png → Team MenteeLog Files\MenteeLog-Database-ERD.png
- MenteeLog-Sitemap.png → Team MenteeLog Files\MenteeLog-Sitemap.png
- MenteeLog-System-Architecture.png → Team MenteeLog Files\MenteeLog-System-Architecture.png
- MenteeLog - UI_UX Design On Process - Finalize\Coordinator  Dashboard - User Dropdown Navigation Bar.png → MenteeLog - UI_UX Design On Process - Finalize\Coordinator  Dashboard - Notfication Dropdown Navigation Bar.png
- MenteeLog - UI_UX Design On Process - Finalize\Critical).png → MenteeLog - UI_UX Design On Process - Finalize\Supervisor Dashboard - Send Emergency Alert -_ Send Emergency Broadcast Alert (High\Critical).png
- MenteeLog - UI_UX Design On Process - Finalize\Supervisor Dashboard - Main-2.png → MenteeLog - UI_UX Design On Process - Finalize\Supervisor Dashboard - Main-1.png
- MenteeLog - UI_UX Design On Process - Finalize\Supervisor Dashboard - Main-3.png → MenteeLog - UI_UX Design On Process - Finalize\Supervisor Dashboard - Main-1.png


Kept home.png and company.png in frontend/dist/assets/references/ even though they match the design exports: these are required deployment assets. Original design exports stay in the design folder. Distinct PNGs with similar names were not removed.

Recovered 10.42 MiB.

