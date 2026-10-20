---
title: Overview
slug: /api
sidebar_position: 0
---

# API reference

The Open API is organized by module. Each module groups related endpoints.

| Module | What it covers |
| ------ | -------------- |
| Authentication | Getting and refreshing tokens |
| Merchant | The installing merchant's profile |
| Catalogue | Products and categories |
| WMS | Warehouse locations and transfer orders |
| Finance | Invoices and accounts |
| Reference | Shared reference data |

## Requests

Every call except `POST /oauth/token` sends these headers. See [Authentication](./authentication.md).

```http
Authorization: Bearer <access_token>
x-jbl-merchant-id: <merchant_id>
```

## Responses

Responses use one envelope:

```json
{
  "data": {},
  "meta": null,
  "error": null,
  "request_id": "3fa4c1e0-1234-4a5b-8c6d-c1d2e3f4a5b6"
}
```

- `data`: the result, an object or a list.
- `meta`: paging info on list endpoints (`page`, `page_size`).
- `error`: `null` on success, otherwise `{ "code", "message" }`.
- `request_id`: include it when you contact support.

To read every page of a list, request the next `page` until a page returns fewer items than
`page_size`.
