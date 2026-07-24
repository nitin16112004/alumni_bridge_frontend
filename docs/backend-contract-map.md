# Alumni Bridge backend contract map

Audited against `nitin16112004/alumni_bridge_backend` `main` at commit
`937fbeb9ed57338324fc61f084c2a7b7e2e1b850`.

The deployed API base is `https://alumni-bridge-backend.onrender.com/api` and
the Socket.IO origin is `https://alumni-bridge-backend.onrender.com`.

## Authentication and entities

| Frontend action | Method and endpoint | Request | Success response | Allowed entity |
| --- | --- | --- | --- | --- |
| Register student/alumni | `POST /auth/register` | `{ name, email, password, role, collegeId?, graduationYear? }` | `{ token, user }` (no `entityType`) | Public |
| Register college | `POST /auth/register-college` | `{ name, email, password, domain? }` | `{ token, college }` (no `entityType`) | Public |
| Login | `POST /auth/login` | `{ email, password }` | `{ token, entityType, user }` or `{ token, entityType, college }` | Public |
| Restore session | `GET /auth/me` | Bearer token | `{ entityType, user }` or `{ entityType, college }` | User or college |
| Request password reset | `POST /auth/forgot-password` | `{ email }` | `{ message }` | Public, User accounts only |
| Reset password | `POST /auth/reset-password` | `{ email, otp, newPassword }` | `{ message }` | Public, User accounts only |

User and College are different entities. A college has no `role`,
`isApproved`, or User profile fields. The frontend must never pass a College
session to a controller that reads `req.user`.

## Product features

| Frontend action | Method and endpoint | Request/query | Success response | Allowed role/entity |
| --- | --- | --- | --- | --- |
| List colleges | `GET /colleges` | — | College array | Public |
| College details | `GET /colleges/me` | — | College object | College |
| Approval queue | `GET /colleges/pending` | — | User array | College |
| Approve/reject | `PUT /colleges/{approve\|reject}/:userId` | — | `{ message, user? }` | College, own members |
| Public User profile | `GET /users/profile/:id` | — | populated User | Public |
| Update own profile | `PUT /users/profile` | supported profile fields only | User | Student/alumni |
| List mentors | `GET /mentors` | `expertise?`, `company?`, `collegeId?` | Mentor array | Public |
| Mentor detail | `GET /mentors/:id` | — | populated Mentor | Public |
| Own mentor profile | `GET /mentors/me` | — | Mentor or 404 | Alumni |
| Create/update mentor | `POST /mentors`, `PUT /mentors/:id` | mentor fields | Mentor | Alumni/owner |
| Send mentorship request | `POST /mentorship/request` | `{ mentorId, message? }` | MentorshipRequest | Student |
| Sent/received requests | `GET /mentorship/sent`, `GET /mentorship/received` | — | Request array | Student / Alumni mentor |
| Respond to request | `PUT /mentorship/respond/:id` | `{ status: "accepted" \| "rejected" }` | Request | Owning alumni mentor |
| List jobs | `GET /jobs` | `type?`, `skill?`, `collegeId?` | Job array | Public |
| Create job | `POST /jobs` | job fields | Job | Alumni |
| Update/delete job | `PUT/DELETE /jobs/:id` | job fields / — | Job / `{ message }` | Posting alumni |
| List/get events | `GET /events`, `GET /events/:id` | `collegeId?` | Event array / populated Event | Public |
| Create event | `POST /events` | `{ title, description, date, location? }` | Event | User session; currently not College-safe |
| Register for event | `POST /events/:id/register` | — | `{ message, count }` | User session; UI limits to Student |
| Discussions | `GET /discussions`, `GET /discussions/:id` | `collegeId?`, `tag?` | Discussion array/object | Public |
| Create/comment/upvote | `POST /discussions`, `POST /discussions/:id/comments`, `PUT /discussions/:id/upvote` | discussion/comment payload | Discussion/comment/count | User session; not College-safe |
| Conversations | `GET/POST /chat/conversations` | `{ participantId }` when creating | Conversation array/object | Student/alumni |
| Messages | `GET/POST /chat/conversations/:id/messages` | `page?`, `limit?` / `{ content }` | Message array/object | Conversation participant |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` | — | Notification array / `{ message }` | Student/alumni |
| AI career chat | `POST /ai/chat` | `{ message }` | `{ reply }` | Student/alumni |
| Clear AI history | `DELETE /ai/history` | — | `{ message }` | Student/alumni |

List endpoints currently return arrays and do not return pagination metadata.
Chat history supports `page` and `limit` but also returns only an array.

## Realtime contract

- Client authenticates with `handshake.auth.token`.
- Client emits `join-conversation`, `leave-conversation`, `send-message`,
  `typing`, `stop-typing`, and `mark-read`.
- Server emits `receive-message`, `typing`, `stop-typing`, `notification`,
  `user-status`, and `error`.
- Events do not use acknowledgement callbacks.
- Socket notification payloads may not include a database notification ID,
  type, link, or timestamp. The frontend deduplicates them using an ID when
  present and otherwise a stable payload key.

## Known backend-dependent limitations

- College event creation is not currently supported by the controller because
  it reads `req.user`, while a College session sets `req.college`.
- College discussions, notifications, chat, AI, and User profile mutation are
  likewise not College-safe.
- Event organizers are currently a `User` reference only; there is no
  `organizerModel` polymorphism in the current schema.
- Mentor, job, event, and discussion lists do not expose pagination metadata.
- Several controllers return model validation text as a 500 response. The
  frontend hides raw 5xx details and presents a safe availability message.
- Socket room joins and socket sends are not acknowledged and the socket
  handler does not independently verify conversation membership. The frontend
  loads conversations over authorized REST endpoints and uses REST as the
  reliable send path.
