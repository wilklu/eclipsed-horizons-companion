# API Reference

## Base URL

`http://localhost:3000/api`

## Endpoints

### Health Check

Check if server is running

**Request:**

```api_syntax
GET /health
```

**Response (200):**

```json
{
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Request**

````
GET /systems

**Response (200):**

```json
[
  {
    "id": 1,
    "sector": "Orion",
    "subsector": "Alpha-1",
    "system_name": "Sol System",
    "seed": 12345,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
````

### Get All Systems

Retrieve all star systems

```api_syntax
GET /systems
```

**Response (200):**

```json
[
  {
    "id": 1,
    "sector": "Orion",
    "subsector": "Alpha-1",
    "system_name": "Sol System",
    "seed": 12345,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### Get Single System

Retrieve one specific system with all its stars and planets

**Request:**

```api_syntax
GET /systems/:id
```

**Example**

```api_command
GET /systems/1
```

**Response (200):**

```json
{
  "id": 1,
  "sector": "Orion",
  "subsector": "Alpha-1",
  "system_name": "Sol System",
  "seed": 12345,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Response (404):**

```json
{
  "error": "System not found"
}
```

### Generate System

Generate a new star system using the generator algorithm

**Request:**

```api_command
POST /systems/generate
Content-Type: application/json

{
"sector": "Orion",
"subsector": "Alpha-1",
"systemName": "New System",
"seed": 54321
}
```

**Response (501)**

```json
{
  "message": "Generator logic not implemented yet (Sprint 4)"
}
```

### Create System

Not Implemented (Sprint 4)

**Request**

```api_command
POST /systems
Content-Type: application/json

{
  "sector": "Orion",
  "subsector": "Alpha-1",
  "systemName": "New System",
  "seed": 54321,
  "stars": [...],
  "planets": [...]
}
```

**Response (?)**

### Delete System

Delete a system from the database

**Request**

```api_syntax
DELETE /systems/:id
```

**Example**

```api_command
DELETE /systems/1
```

**Response (200)**

```json
{
  "message": "System deleted",
  "id": 1
}
```
