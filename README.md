# Lost & Found KBTU

Campus lost-and-found platform for KBTU with user registration, moderated announcements, profile management, and direct contact information inside each approved post.

## Stack

- Frontend: Angular
- Backend: Django + Django REST Framework
- Authentication: JWT
- Database: SQLite

## Main roles

- `user` registers, creates announcements, edits profile information, and tracks the moderation status of personal posts
- `admin` reviews pending announcements, approves or rejects publication, and manages already published posts

## Demo accounts

- `admin / admin123`
- `student / student123`

## Project structure

- `/frontend` - Angular application
- `/backend` - Django API
- `/postman` - Postman collection

## Run backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo_data
.venv/bin/python manage.py runserver
```

Backend address:

- `http://127.0.0.1:8000`

## Run frontend

```bash
cd frontend
npm install
npm start
```

Frontend address:

- `http://127.0.0.1:4200`

## Implemented frontend flow

- public landing page with featured approved posts
- styled login page
- working registration page
- protected announcements board
- create-announcement page for users
- profile page with editable contact information and personal announcement statuses
- admin moderation page
- full details page with contact information
- footer and redesigned visual style

## Implemented backend flow

- JWT login/logout
- user registration endpoint
- user profile endpoint
- public approved announcements endpoint
- personal announcements endpoint
- admin moderation queue endpoint
- admin published announcements endpoint
- status toggle and delete actions

## Backend models

- `Category`
- `CampusLocation`
- `UserProfile`
- `Item`

## Item lifecycle

- user creates an announcement
- announcement starts with `moderation_status = pending`
- admin reviews it
- admin sets it to `approved` or `rejected`
- approved announcements appear in the public board
- later the announcement can be `open` or `closed`

## API endpoints

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET /api/profile/`
- `PUT /api/profile/`
- `GET /api/categories/`
- `GET /api/locations/`
- `GET /api/items/`
- `GET /api/items/my/`
- `POST /api/items/my/`
- `GET /api/items/pending/`
- `GET /api/items/published/`
- `GET /api/items/:id/`
- `PUT /api/items/:id/`
- `DELETE /api/items/:id/`
- `POST /api/items/:id/moderate/`
- `POST /api/items/:id/toggle-status/`

## Postman

Collection file:

- `/postman/Lost-Found-KBTU.postman_collection.json`
