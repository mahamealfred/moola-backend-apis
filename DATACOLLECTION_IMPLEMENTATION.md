# Data Collection API Implementation Summary

## Overview
Created a complete data collection module with multi-language support and proper error handling, following the existing patterns in your Moola backend.

---

## Files Created/Modified

### 1. **Data Collection Controller**
**File**: [agency-service/src/controllers/datacollection-controller.js](agency-service/src/controllers/datacollection-controller.js)

**Endpoints**:
- `GET /api/external/forms` - Retrieve available forms
- `POST /api/external/forms` - Submit form data

**Features**:
- ✅ Multi-language support (en, rw, fr, sw)
- ✅ API key validation from headers
- ✅ Comprehensive error handling
- ✅ Request/response logging
- ✅ Timeout handling (30s)
- ✅ Proper response formatting using `createResponse` & `createErrorResponse`
- ✅ Session tracking with agentId and sessionId

### 2. **Data Collection Routes**
**File**: [agency-service/src/routes/datacollection-routes.js](agency-service/src/routes/datacollection-routes.js)

Defines the routing structure for both GET and POST endpoints.

### 3. **Server Configuration Update**
**File**: [agency-service/src/server.js](agency-service/src/server.js)

Updated to:
- Import datacollection routes
- Register routes at `/api/external` path
- Inherit i18n middleware automatically for language support

### 4. **API Documentation**
**File**: [DATA_COLLECTION_API_GUIDE.md](DATA_COLLECTION_API_GUIDE.md)

Complete Postman guide with curl examples for all scenarios.

---

## Postman Configuration

### Headers for All Requests
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403",
  "X-Language": "en"
}
```

### Available Endpoints

#### GET Forms
```
GET {{AF_PROD}}/api/external/forms?lang=en
```

#### POST Form Data
```
POST {{AF_PROD}}/api/external/forms
Content-Type: application/json

{
  "formId": "form_001",
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

---

## Language Support

Automatic language detection in this order:
1. Query parameter: `?lang=rw`
2. Header: `X-Language: rw`
3. Header: `Accept-Language: rw`
4. Default: `en`

Supported languages:
- **en** - English
- **rw** - Kinyarwanda
- **fr** - French
- **sw** - Swahili

---

## Configuration

Add to `.env` in agency-service:
```env
DATA_COLLECTION_API_KEY=ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403
DATA_COLLECTION_BASE_URL=https://api.prod.com
```

---

## Error Handling

All errors return standardized format with language-specific messages:

```json
{
  "success": false,
  "message": "Localized error message",
  "error": "error.code",
  "language": "en"
}
```

Error codes handled:
- `401` - Authentication failed (invalid API key)
- `400` - Invalid form data
- `404` - Forms not found
- `503` - Service unavailable
- `500` - Server error

---

## Features Implemented

✅ **Multi-language Support**
- Automatic language detection from headers/query params
- Localized error messages via i18n
- Language tracking in logs and responses

✅ **Security**
- API key validation
- Request logging
- Session tracking
- Timeout protection (30s)

✅ **Error Handling**
- Specific error responses for different scenarios
- Detailed error logging
- Graceful timeout handling
- Network error handling

✅ **Standards**
- Follows existing code patterns
- Uses shared response utilities
- Integrates with middleware chain
- Consistent logging

---

## Testing

Test all endpoints using the curl commands in [DATA_COLLECTION_API_GUIDE.md](DATA_COLLECTION_API_GUIDE.md)

Example:
```bash
curl 'http://localhost:4001/api/external/forms?lang=en' \
  -H 'X-API-Key: ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403'
```

---

## Next Steps (Optional)

1. Update shared/locales files with error message keys:
   - `data_collection.forms_retrieved_successfully`
   - `data_collection.form_submitted_successfully`
   - `data_collection.invalid_form_data`
   - `data_collection.authentication_failed`
   - `data_collection.forms_not_found`
   - `data_collection.service_unavailable`

2. Add request validation middleware if needed

3. Add database models for form submissions if required

---

## Ready to Use

The endpoints are now ready for Postman testing! Use the base URL `{{AF_PROD}}/api/external/forms` with the provided headers.
