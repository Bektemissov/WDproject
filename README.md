# Lost & Found (KBTU)

A campus **Lost & Found** web application where students can publish items they **lost** or **found**, browse posts, and contact owners.

## Goal
Make it easy to return lost items by providing:
- clear item posts (title, description, category, location, status)
- search / filters
- secure access (login)

## Main features (planned)
- Authentication (JWT): login / logout
- Create a post: Lost or Found
- Browse all posts + filtering by category/location/status
- Post details page
- Mark item as “Resolved/Closed”
- Contact/claim request (message to the owner)

## Tech stack
- Frontend: Angular
- Backend: Django + Django REST Framework
- Auth: JWT
- DB: SQLite (dev), later can be PostgreSQL

## Repo structure
- `/frontend` — Angular app
- `/backend` — Django API (will be added)
- `/postman` — Postman collection (will be added)

## How to run (frontend)
```bash
cd frontend
npm install
ng serve
