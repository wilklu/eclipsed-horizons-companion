# API Testing Guide

This directory contains test collections for the System Generator API.

## Available Test Collections

### 1. Postman Collection

**File:** `System-Generator-API.postman_collection.json`

**Import Instructions:**

1. Open Postman
2. Click **Import** button
3. Select `System-Generator-API.postman_collection.json`
4. The collection will appear in your workspace with all endpoints organized by entity type

**Features:**

- Complete CRUD operations for all entities (Galaxies, Sectors, Systems, Worlds, Sophonts)
- Import/Export endpoints
- Health check endpoint
- Pre-configured request bodies with example data
- Environment variable support (`{{baseUrl}}`)

### 2. REST Client (.http)

**File:** `api-tests.http`

**Usage Instructions:**

1. Install [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in VS Code
2. Open `api-tests.http`
3. Click **Send Request** above any endpoint
4. View responses directly in VS Code

**Features:**

- All CRUD endpoints for every entity type
- Variable definitions at the top (`@baseUrl`, `@contentType`)
- Organized with section separators
- Same test data as Postman collection

## API Endpoints Summary

### API Documentation

- `GET /api/openapi.yaml` - OpenAPI 3.0.3 specification
- `GET /api/docs` - Swagger UI (renders the OpenAPI spec)

### Health Check

- `GET /api/health` - Check API status

### Galaxies

- `GET /api/galaxies` - List all galaxies
- `GET /api/galaxies/:id` - Get specific galaxy
- `POST /api/galaxies` - Create galaxy
- `PUT /api/galaxies/:id` - Update galaxy
- `DELETE /api/galaxies/:id` - Delete galaxy

### Sectors

- `GET /api/sectors` - List all sectors
- `GET /api/galaxies/:gid/sectors` - Get sectors by galaxy
- `GET /api/sectors/:id` - Get specific sector
- `POST /api/sectors` - Create sector
- `PUT /api/sectors/:id` - Update sector
- `DELETE /api/sectors/:id` - Delete sector

### Systems

- `GET /api/systems` - List all systems
- `GET /api/sectors/:sid/systems` - Get systems by sector
- `GET /api/systems/:id` - Get specific system
- `POST /api/systems` - Create system
- `PUT /api/systems/:id` - Update system
- `DELETE /api/systems/:id` - Delete system

### Worlds

- `GET /api/worlds` - List all worlds
- `GET /api/systems/:sid/worlds` - Get worlds by system
- `GET /api/worlds/:id` - Get specific world
- `POST /api/worlds` - Create world
- `PUT /api/worlds/:id` - Update world
- `DELETE /api/worlds/:id` - Delete world

### Sophonts

- `GET /api/sophonts` - List all sophonts
- `GET /api/worlds/:wid/sophonts` - Get sophonts by world
- `GET /api/sophonts/:id` - Get specific sophont
- `POST /api/sophonts` - Create sophont
- `PUT /api/sophonts/:id` - Update sophont
- `DELETE /api/sophonts/:id` - Delete sophont

### Import/Export

- `GET /api/export` - Export entire universe
- `GET /api/export/:galaxyId` - Export specific galaxy
- `POST /api/import` - Import universe JSON

## Testing Workflow

### 1. Start the API Server

```bash
npm run api:dev
```

The server will start on `http://localhost:3100`

### 1.5 Verify/Open API Docs

```bash
npm run api:docs
```

Optional: open Swagger UI in your default browser.

```bash
npm run api:docs:open
```

### 2. Run Health Check

Test that the API is running:

```
GET http://localhost:3100/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "system-generator-api",
  "dbPath": "...",
  "timestamp": "2026-03-08T..."
}
```

### 3. Test CRUD Operations

Follow this order to test hierarchical relationships:

1. **Galaxy** (top level)
   - Create → Get → Update → List
2. **Sector** (requires galaxyId)
   - Create → Get → Get by Galaxy → Update
3. **System** (requires galaxyId + sectorId)
   - Create → Get → Get by Sector → Update
4. **World** (requires systemId)
   - Create → Get → Get by System → Update
5. **Sophont** (requires worldId)
   - Create → Get → Get by World → Update
6. **Delete** (test cascade deletion in reverse order)
   - Sophont → World → System → Sector → Galaxy

### 4. Test Import/Export

1. Create a small test universe (1 galaxy with related entities)
2. Export the galaxy: `GET /api/export/:galaxyId`
3. Save the JSON response
4. Modify the IDs in the JSON
5. Import: `POST /api/import` with the modified JSON
6. Verify all entities were created

## Test Data

Both test collections include sample data with realistic values:

- Test galaxy with spiral morphology
- Test sector with coordinates and density
- Test system with a G2V star (Sun-like)
- Test world with UWP code and physical properties
- Test sophont species with biology and culture

## Error Testing

The API returns standard HTTP status codes:

- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `404 Not Found` - Entity not found
- `500 Internal Server Error` - Server error

Test error conditions:

1. **404 Not Found** - Try to GET/PUT/DELETE a non-existent ID
2. **400 Bad Request** - Send invalid JSON or missing required fields
3. **400 Validation Error** - Send body with wrong ID in PUT request
4. **404 Cascade** - Try to create a child without parent (e.g., sector without galaxy)

## Notes

- The API uses SQLite with foreign key constraints enabled
- Deleting a parent entity cascades to all children
- All JSON fields are validated against schemas from Sprint 1
- The `createdAt` and `lastModified` timestamps are managed automatically
- IDs must be unique across all entities of the same type
