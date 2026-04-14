# Booking API

An HTTP API for creating and managing room bookings with overlap protection.

## User Stories

### US-1: Create a booking

**Story**
As an API consumer
I want to create a booking for a room and time range
So that I can reserve a room

**Acceptance Criteria**
- `POST /api/bookings` accepts `room_id`, `guest_name`, `start_at`, and `end_at`
- A successful create returns 201 with the created booking, including a unique ID
- `start_at` must be earlier than `end_at`
- Use in-memory storage

**Additional Notes**
- Use ISO 8601 datetime strings for request and response payloads

### US-2: Reject overlapping bookings

**Story**
As an API consumer
I want conflicting bookings to be rejected
So that a room cannot be double-booked

**Acceptance Criteria**
- Overlapping bookings for the same `room_id` return 409
- Bookings for different rooms may overlap
- Requests with missing or invalid fields return 400

**Additional Notes**
- Two bookings that touch at the boundary are allowed, for example one booking ending exactly when the next starts

### US-3: List and filter bookings

**Story**
As an API consumer
I want to list bookings and filter them
So that I can inspect a room schedule

**Acceptance Criteria**
- `GET /api/bookings` returns all bookings sorted by `start_at` ascending
- `GET /api/bookings?room_id=A` filters bookings by room
- `GET /api/bookings?day=2026-04-13` filters bookings to a calendar day

**Additional Notes**
- Filtering by both `room_id` and `day` should be supported together

### US-4: Reschedule and cancel a booking

**Story**
As an API consumer
I want to update or cancel an existing booking
So that schedules can change over time

**Acceptance Criteria**
- `PUT /api/bookings/:id` updates a booking's room, guest name, or time range
- Updated bookings must follow the same overlap rules as creation
- `DELETE /api/bookings/:id` removes a booking
- Unknown booking IDs return 404

**Additional Notes**
- When updating a booking, it must not be treated as conflicting with itself
