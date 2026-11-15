# ShopSphere API Standards

## 1. Base URL

Local development base URL: `http://localhost:5000`

API endpoints are grouped under `/api`.

## 2. Success Response Envelope

Successful responses use a consistent JSON structure.

```json
{
  "status": "success",
  "data": {
    "message": "ShopSphere API is running"
  }
}
```

- `status`: indicates successful processing.
- `data`: contains the response payload.

## 3. Error Response Envelope

Errors should use a consistent JSON structure.

```json
{
  "status": "fail",
  "message": "Resource not found"
}
```

For unexpected server errors:

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

- `status`: `fail` for client-related errors and `error` for server errors.
- `message`: safe, readable description of the error.
- Do not expose stack traces, secrets, or database credentials in production responses.

## 4. HTTP Status Codes

| Code | Meaning               | Typical use                                |
| ---- | --------------------- | ------------------------------------------ |
| 200  | OK                    | Successful GET or update                   |
| 201  | Created               | Resource created                           |
| 204  | No Content            | Successful operation with no response body |
| 400  | Bad Request           | Invalid request data                       |
| 401  | Unauthorized          | Authentication required or invalid         |
| 403  | Forbidden             | Insufficient permission                    |
| 404  | Not Found             | Resource or endpoint not found             |
| 409  | Conflict              | Duplicate or conflicting resource          |
| 422  | Unprocessable Content | Validation failure                         |
| 500  | Internal Server Error | Unexpected server failure                  |

## 5. Pagination Standards

List endpoints should support these query parameters:

| Parameter | Default           | Description                                                              |
| --------- | ----------------- | ------------------------------------------------------------------------ |
| `page`    | `1`               | Page number; must be an integer greater than or equal to 1               |
| `limit`   | `10`              | Number of records per page; must be a positive integer and capped at 100 |
| `sort`    | Endpoint-specific | Field used for sorting; prefix with `-` for descending order             |

Example:

`GET /api/products?page=2&limit=10&sort=-createdAt`

Pagination response example:

```json
{
  "status": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 2,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

The example endpoint and response describe the standard; they do not imply that product listing has already been implemented.

## 6. Current Endpoints

| Method | Path        | Purpose            |
| ------ | ----------- | ------------------ |
| GET    | `/api`      | Health check       |
| GET    | `/api/ping` | Ping service check |

## 7. Testing

Use the Postman collection in `postman/shopsphere.collection.json` with the local environment in `postman/local.environment.json`.

The collection checks HTTP status codes, JSON response structure, and expected response values for the Health and Ping endpoints.