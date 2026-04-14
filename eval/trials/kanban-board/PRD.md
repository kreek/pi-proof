# Kanban Board

A fullstack kanban board with a separate backend API and frontend app.

## Structure

The project should be organized as two top-level applications:

- `backend/` -- the API service
- `frontend/` -- the user-facing web app

The frontend should talk to the backend over HTTP. No authentication is required.
For this trial, in-memory storage is acceptable; data does not need to persist across restarts.

## Data Model

### Column

| Field | Type | Notes |
|-------|------|-------|
| id | string | unique identifier |
| name | string | display label |
| cards | Card[] | ordered list of cards in the column |

### Card

| Field | Type | Notes |
|-------|------|-------|
| id | string | unique identifier |
| title | string | required |
| description | string | optional |
| labels | string[] | optional |
| column_id | string | current column |

## User Stories

### US-1: Create and view cards

**Story**
As a team member
I want to create cards on a board
So that I can track work

**Acceptance Criteria**
- The board starts with three columns: `Todo`, `Doing`, and `Done`
- The frontend lets the user create a card with a title and optional description
- New cards are added to the end of the `Todo` column
- `GET /api/board` returns the columns with cards in display order

**Additional Notes**
- `POST /api/cards` is a suitable create endpoint for the backend API

### US-2: Move cards and preserve order

**Story**
As a team member
I want to move cards between columns and positions
So that the board reflects current progress

**Acceptance Criteria**
- A card can be moved to another column
- A card can be reordered within the same column
- Moving a card preserves the relative order of unaffected cards
- The updated order is reflected in subsequent board reads

**Additional Notes**
- This story is intentionally regression-prone because ordering invariants are easy to break

### US-3: Edit and filter cards

**Story**
As a team member
I want to edit card details and filter the board
So that I can keep tasks organized

**Acceptance Criteria**
- A card's title, description, and labels can be edited
- The frontend can filter cards by text match on title and by label
- Filtering does not mutate the underlying board order

**Additional Notes**
- A `PATCH /api/cards/:id` endpoint is acceptable for edits

### US-4: Delete cards safely

**Story**
As a team member
I want to remove cards I no longer need
So that the board stays clean

**Acceptance Criteria**
- Cards can be deleted from any column
- After deletion, the remaining cards keep their order without gaps
- Deleting an unknown card returns 404
- Filtered views update correctly after deletion

**Additional Notes**
- This story should not break move, reorder, or filter behavior from earlier stories
