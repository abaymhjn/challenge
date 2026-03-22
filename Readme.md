# School Management System — Solution

> Candidate submission for the Backend Developer Skill Test.

---

## Quick Start

```bash
# Database
createdb school_mgmt
psql -d school_mgmt -f seed_db/tables.sql
psql -d school_mgmt -f seed_db/seed-db.sql

# Backend
cd backend && npm install && npm start     # http://localhost:5007

# Frontend
cd frontend && npm install && npm run dev  # http://localhost:5173
```

**Demo credentials:** `admin@school-admin.com` / `3OU4zn3q6Zh9`

---

## What Was Implemented

### Task 1 — Complete Student CRUD (Backend)

The original `students-controller.js` had `// write your code` placeholders in every handler. All handlers were empty.

**Implemented all 5 student endpoints:**

| Endpoint | Handler | What was done |
|----------|---------|---------------|
| `GET /api/v1/students` | `handleGetAllStudents` | Extracts query filters, calls service, returns student list |
| `POST /api/v1/students` | `handleAddStudent` | Passes request body to service, returns 201 |
| `GET /api/v1/students/:id` | `handleGetStudentDetail` | Fetches single student by ID |
| `PUT /api/v1/students/:id` | `handleUpdateStudent` | Updates student profile |
| `POST /api/v1/students/:id/status` | `handleStudentStatus` | Activates / deactivates student |

**Added missing DELETE endpoint** (not in original at all):

```
DELETE /api/v1/students/:id
```

- **Controller** — `handleDeleteStudent`
- **Service** — `deleteStudent(id)`: validates student exists, then deletes
- **Repository** — `deleteStudentFromDB(id)`: uses a transaction to delete from `user_profiles` then `users`
- **Router** — `router.delete("/:id", checkApiAccess, studentController.handleDeleteStudent)`

**Why hard-delete with a transaction?** The original router had no middleware at all. After adding `checkApiAccess` + `validateRequest`, the student records only belong to students (role-specific), so a real DELETE is appropriate. The transaction ensures both `user_profiles` and `users` rows are removed atomically — if either fails, both are rolled back.

---

**Fixed `updateStudent` service signature:**

Original had `updateStudent(payload)` (single argument). The controller passes `(id, payload)`, so the service was never receiving the student ID:

```js
// Original (broken):
const updateStudent = async (payload) => {
    const result = await addOrUpdateStudent(payload);

// Fixed:
const updateStudent = async (id, payload) => {
    await checkStudentId(Number(id));
    const result = await addOrUpdateStudent({ userId: Number(id), ...payload });
```

---

**Added request validation and auth middleware to student router:**

Original router had no middleware on any route:

```js
// Original (no auth, no validation):
router.get("", studentController.handleGetAllStudents);
router.post("", studentController.handleAddStudent);

// Fixed:
router.get("", checkApiAccess, validateRequest(StudentFilterSchema), studentController.handleGetAllStudents);
router.post("", checkApiAccess, validateRequest(StudentSchema), studentController.handleAddStudent);
router.put("/:id", checkApiAccess, validateRequest(StudentUpdateSchema), studentController.handleUpdateStudent);
router.post("/:id/status", checkApiAccess, validateRequest(StudentStatusSchema), studentController.handleStudentStatus);
router.delete("/:id", checkApiAccess, studentController.handleDeleteStudent);
```

---

**Improved student search** in repository — changed exact match to case-insensitive partial match:

```js
// Original:
query += ` AND t1.name = $${queryParams.length + 1}`;
queryParams.push(name);

// Fixed:
query += ` AND t1.name ILIKE $${queryParams.length + 1}`;
queryParams.push(`%${name}%`);
```

---

**Cleaned up dead code** in `students-repository.js`:

Removed `findStudentToUpdate()` — it was never imported or called anywhere, and had a mismatched payload structure (`basicDetails.name` vs actual API shape).

---

### Task 2 — Fix Notice Description Not Saving (Frontend)

The `<TextField>` for description in `notice-form.tsx` was registered under the wrong field name:

```tsx
// Original (broken) — line 89:
{...register('content')}

// Fixed:
{...register('description')}
```

The Zod schema, error messages (`errors.description`), and the backend database INSERT all expected `description`. The form was submitting the field as `content`, which was `undefined` in the payload, resulting in NULL being saved to the database every time.

---

### Task 3 — Notice DELETE Endpoint (Bonus)

Notices also had no DELETE endpoint. Added across all layers:

```
DELETE /api/v1/notices/:id
```

- **Controller** — `handleDeleteNotice`: extracts `id`, calls `deleteNotice`
- **Service** — `deleteNotice(id)`: checks notice exists (404 if not), then deletes
- **Repository** — `deleteNoticeFromDB(id)`: `DELETE FROM notices WHERE id = $1`
- **Router** — `router.delete("/:id", checkApiAccess, noticeController.handleDeleteNotice)`

**Added validation to notice router** — original had no `validateRequest` on POST/PUT:

```js
router.post("", checkApiAccess, validateRequest(NoticeSchema), noticeController.handleAddNotice);
router.put("/:id", checkApiAccess, validateRequest(NoticeUpdateSchema), noticeController.handleUpdateNotice);
router.post("/:id/status", checkApiAccess, validateRequest(NoticeStatusSchema), noticeController.handleNoticeStatus);
```

---

### Task 4 — Test Suite (151 Tests)

The original had no test files at all. Wrote a full test suite:

```
Test Suites: 3 passed, 3 total
Tests:       151 passed, 151 total

students-service.test.js      — 39 tests   (unit — mocks repository layer)
students-controller.test.js   — 40 tests   (unit — mocks service layer)
students-integration.test.js  — 72 tests   (integration — hits real DB)
```

```bash
cd backend && npm test
```

**Key fix for integration tests — cookie-parser first-occurrence-wins:**

Login calls `clearAllCookies()` before `setAllCookies()`, producing 6 `Set-Cookie` headers: 3 empty clear cookies first, then 3 real tokens. `cookie-parser` takes the first occurrence of each cookie name — so `accessToken=''` was overwriting the real token. All 72 tests were returning 401 until this was discovered.

Fix: filter empty cookie values when building the test `Cookie` header:

```js
authCookies = rawCookies
    .map(c => c.split(';')[0])
    .filter(c => { const v = c.split('=')[1]; return v && v.length > 0; })
    .join('; ');
```

Also required: all routes use `csrfProtection` middleware — tests must send the `x-csrf-token` header on every request.

---

### Task 5 — Postman Collection

Fixed `School_Management_API.postman_collection.json` so it works end-to-end:

**Login script fix:** `pm.response.headers.get('Set-Cookie')` returns only the first `Set-Cookie` header (the empty clear cookie). Fixed by iterating all headers to find the real csrfToken:

```js
pm.response.headers.all().forEach(function(header) {
    if (header.key.toLowerCase() === 'set-cookie') {
        var match = header.value.match(/csrfToken=([^;]+)/);
        if (match && match[1] && match[1].length > 5) {
            csrfToken = match[1];
        }
    }
});
pm.collectionVariables.set('csrfToken', csrfToken);
```

**Other fixes:**
- Removed `Authorization: Bearer {{accessToken}}` headers (API uses HttpOnly cookies, not Bearer tokens)
- Added `x-csrf-token: {{csrfToken}}` to all authenticated requests
- Fixed Create Student body field names (`class`/`section`, added required `guardianName`, `guardianPhone`, `relationOfGuardian`)
- Fixed Leave Management URLs to match actual router paths
- Added collection variables: `studentId`, `noticeId`, `staffId`, `recipientId`, `leaveRequestId`
- Added Delete Student request (was missing entirely)

---

## Files Changed vs Original

### Backend

| File | Change |
|------|--------|
| `students-controller.js` | Implemented all 5 handlers + added `handleDeleteStudent` |
| `students-service.js` | Fixed `updateStudent(id, payload)` signature + added `deleteStudent` |
| `students-repository.js` | Added `deleteStudentFromDB` (transaction), ILIKE search, removed dead code |
| `sudents-router.js` | Added `checkApiAccess` + `validateRequest` middleware on all routes + DELETE route |
| `students-schema.js` | Added `StudentSchema`, `StudentFilterSchema`, `StudentStatusSchema`, `StudentUpdateSchema` |
| `notices-controller.js` | Added `handleDeleteNotice` |
| `notices-service.js` | Added `deleteNotice` |
| `notices-repository.js` | Added `deleteNoticeFromDB` |
| `notices-router.js` | Added `validateRequest` on POST/PUT/status + DELETE route |
| `notices-schema.js` | Added `NoticeSchema`, `NoticeUpdateSchema`, `NoticeStatusSchema` |
| `jest.setup.js` | Added `RESEND_API_KEY` env var so email module loads during tests |

### Frontend

| File | Change |
|------|--------|
| `notice-form.tsx` | Fixed `register('content')` → `register('description')` |

### New Files

| File | Description |
|------|-------------|
| `backend/tests/modules/students/students-service.test.js` | 39 unit tests for service layer |
| `backend/tests/modules/students/students-controller.test.js` | 40 unit tests for controller layer |
| `backend/tests/modules/students/students-integration.test.js` | 72 integration tests against real DB |
| `School_Management_API.postman_collection.json` | Working Postman collection with CSRF flow |
| `BACKEND_ANALYSIS_REPORT.md` | Detailed analysis of all modules and bugs |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (HttpOnly cookies) + CSRF protection |
| Validation | Zod |
| Testing | Jest + Supertest |
| Frontend | React 18, TypeScript, MUI, Redux Toolkit, React Hook Form |
