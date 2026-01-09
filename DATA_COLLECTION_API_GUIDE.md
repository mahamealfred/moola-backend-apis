## Data Collection API Endpoints - Postman Guide

### Base URLs
- **Production**: `{{AF_PROD}}` = `https://afriqollect.com/api`
- **Development**: `http://localhost:4001`

---

### 1. GET - Retrieve External Forms

**Endpoint**: `GET {{AF_PROD}}/external/forms`

**Description**: Fetches available forms from the external data collection service with language support.

**Headers**:
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403",
  "Accept-Language": "en",
  "X-Language": "en"
}
```

**Query Parameters** (Optional):
- `lang`: Language code (en, rw, fr, sw) - defaults to en

**Example Request**:
```bash
curl --location 'http://localhost:4001/api/external/forms?lang=en' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403' \
  --header 'Accept-Language: en'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Forms retrieved successfully",
  "language": "en",
  "data": {
    "forms": [
      {
        "id": "form_001",
        "name": "Customer Registration",
        "fields": [...],
        "language": "en"
      }
    ],
    "language": "en",
    "timestamp": "2025-12-16T10:30:45.123Z",
    "source": "external_api"
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "data_collection.authentication_failed",
  "language": "en"
}
```

---

### 2. POST - Submit Form Data

**Endpoint**: `POST {{AF_PROD}}/external/forms`

**Description**: Submits form data to the external data collection service with language support.

**Headers**:
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403",
  "X-Language": "en",
  "X-Agent-ID": "AGENT_123",
  "X-Session-ID": "SESSION_456"
}
```

**Request Body**:
```json
{
  "formId": "form_001",
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+250123456789",
    "language": "en"
  }
}
```

**Query Parameters** (Optional):
- `lang`: Language code (en, rw, fr, sw) - defaults to en

**Example Request**:
```bash
curl --location 'http://localhost:4001/api/external/forms' \
  --header 'Content-Type: application/json' \
  --header 'X-API-Key: ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403' \
  --header 'X-Language: en' \
  --header 'X-Agent-ID: AGENT_123' \
  --header 'X-Session-ID: SESSION_456' \
  --data '{
    "formId": "form_001",
    "formData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+250123456789"
    }
  }'
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "language": "en",
  "data": {
    "formId": "form_001",
    "submissionId": "sub_789456",
    "status": "pending",
    "message": "Form received and queued for processing",
    "language": "en",
    "timestamp": "2025-12-16T10:30:45.123Z",
    "source": "external_api"
  }
}
```

**Error Response** (400 - Validation):
```json
{
  "success": false,
  "message": "Invalid form data",
  "error": "data_collection.invalid_form_data",
  "language": "en",
  "details": {
    "missingFields": ["formId"]
  }
}
```

**Error Response** (503 - Service Unavailable):
```json
{
  "success": false,
  "message": "Service unavailable",
  "error": "data_collection.service_unavailable",
  "language": "en"
}
```

---

### Language Support

All endpoints support multiple languages:
- **English**: `en`
- **Kinyarwanda**: `rw`
- **French**: `fr`
- **Swahili**: `sw`

**Language Detection Order**:
1. Query parameter: `?lang=rw`
2. Header: `X-Language: rw`
3. Header: `Accept-Language: rw`
4. Default: `en`

---

### Environment Variables Configuration

Add these to your `.env` file:

```env
# Data Collection Service
DATA_COLLECTION_API_KEY=ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403
DATA_COLLECTION_BASE_URL=https://afriqollect.com/api

# Or for development:
# DATA_COLLECTION_BASE_URL=http://localhost:5000
```

---

### Postman Collection Setup

**Steps**:
1. Create a new Postman collection
2. Add variable: `AF_PROD` = `https://afriqollect.com/api`
3. Create two requests following the examples above
4. Test with different languages using the `lang` query parameter

---

### Response Format

All responses follow the standard format:
```json
{
  "success": boolean,
  "message": "localized message",
  "language": "en|rw|fr|sw",
  "error": "error.code",  // Only on errors
  "data": {
    // Response payload
  }
}
```

---

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `data_collection.forms_retrieved_successfully` | 200 | Forms fetched successfully |
| `data_collection.form_submitted_successfully` | 201 | Form submitted successfully |
| `validation.missing_form_fields` | 400 | Required fields missing |
| `data_collection.invalid_form_data` | 400 | Form data validation failed |
| `data_collection.authentication_failed` | 401 | API key invalid or missing |
| `data_collection.forms_not_found` | 404 | Forms endpoint not found |
| `data_collection.service_unavailable` | 503 | External service unavailable |
| `common.server_error` | 500 | Internal server error |

---

### Testing Multi-Language Support

**English (en)**:
```bash
curl 'http://localhost:4001/api/external/forms?lang=en' \
  -H 'X-API-Key: ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403'
```

**French (fr)**:
```bash
curl 'http://localhost:4001/api/external/forms?lang=fr' \
  -H 'X-API-Key: ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403'
```

**Kinyarwanda (rw)**:
```bash
curl 'http://localhost:4001/api/external/forms?lang=rw' \
  -H 'X-API-Key: ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403'
```

**Swahili (sw)**:
```bash
curl 'http://localhost:4001/api/external/forms?lang=sw' \
  -H 'X-API-Key: ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403'
```
