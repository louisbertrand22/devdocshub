# API_CONTRACT

This UI expects the following endpoints (paths relative to API base):

Auth:
- POST `/auth/register` -> {id, email, ...}
- POST `/auth/login` -> {access_token: string}
- GET  `/auth/me` -> {id, email, name}

Docs:
- GET  `/docs/all` -> Doc[]
- GET  `/docs/doc/{doc_id}` -> Doc
- GET  `/docs/{slug}` -> Doc
- POST `/docs/add` -> Doc

Notes:
- GET  `/notes` -> Note[]
- POST `/notes` -> Note
- GET  `/notes/doc/{doc_id}/notes` -> Note[]
- GET  `/notes/{note_id}` -> Note
- PUT  `/notes/{note_id}` -> Note
- DELETE `/notes/{note_id}` -> 204

Users:
- GET  `/users/` -> User[]
- GET  `/users/{user_id}` -> User
- GET  `/users/{email}/by-email` -> User

Collections:
- GET  `/collections/` -> Collection[]
- POST `/collections/` -> Collection
- GET  `/collections/{collection_id}` -> Collection
- PUT  `/collections/{collection_id}` -> Collection
- DELETE `/collections/{collection_id}` -> 204
- POST `/collections/{collection_id}/docs` -> Collection (linked)
- GET  `/collections/{collection_id}/docs` -> Doc[]
- DELETE `/collections/{collection_id}/docs/{doc_id}` -> 204

> Auth: Bearer token in `Authorization: Bearer <token>` header.
