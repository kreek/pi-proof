# Link Shortener

A fullstack URL shortener with a separate backend API and frontend app.

## Structure

The project should be organized as two top-level applications:

- `backend/` -- the API service
- `frontend/` -- the user-facing web app

The frontend should talk to the backend over HTTP. No authentication is required.
For this trial, in-memory storage is acceptable; data does not need to persist across restarts.

## Data Model

### Link

| Field | Type | Notes |
|-------|------|-------|
| short_code | string | unique 6-character alphanumeric code |
| original_url | string | required, validated as a URL |
| click_count | integer | starts at 0 and increments on redirect |
| created_at | datetime/string | returned by the API for display |

## User Stories

### US-1: Shorten a URL

**Story**
As a user
I want to paste a long URL and get a short link
So that I can share it more easily

**Acceptance Criteria**
- The frontend shows a form with a single URL input and a "Shorten" button
- The URL must start with `http://` or `https://`
- Invalid URLs show an error message
- `POST /api/links` accepts `{ "url": "https://example.com/long-path" }`
- The backend returns a short link response with `short_code`, `short_url`, and `original_url`
- After a successful create, the frontend displays the short link and offers a copy-to-clipboard action

**Additional Notes**
- Use a unique 6-character alphanumeric short code
- Example response: `{ "short_code": "abc123", "short_url": "http://localhost:3000/abc123", "original_url": "https://example.com/long-path" }`

### US-2: Redirect from a Short Link

**Story**
As a user
I want to visit a short link and reach the original URL
So that the shortened link is actually useful

**Acceptance Criteria**
- `GET /:short_code` responds with an HTTP 302 redirect to the original URL
- Redirecting increments the link's click count
- Unknown short codes return 404

**Additional Notes**
- Click counts should reflect real redirect traffic handled by the backend

### US-3: View Recent Links

**Story**
As a user
I want to see recently created short links
So that I can find links I made earlier

**Acceptance Criteria**
- The homepage shows the 20 most recently created links
- Each item shows the short URL, original URL, click count, and created date
- The recent-links list updates after creating a new short link
- `GET /api/links` returns a JSON array of recent links ordered newest-first

**Additional Notes**
- The frontend should fetch this list from the backend API over HTTP

### US-4: View Link Stats

**Story**
As a user
I want to inspect a short link's details
So that I can see how often it has been used

**Acceptance Criteria**
- The frontend lets the user inspect a single link's details from the recent-links list
- The detail view shows the original URL, short URL, total clicks, and created date
- `GET /api/links/:short_code` returns the full details for one link
- The click count in the detail view reflects real redirect traffic

**Additional Notes**
- The detail view can be inline, routed, or modal-based as long as the behavior is covered

## Out of Scope

- User accounts or authentication
- Custom short codes
- Link expiration
- Analytics beyond total click count
- Persistence beyond the running process
