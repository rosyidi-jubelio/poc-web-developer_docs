---
title: Your first API call
sidebar_position: 2
---

# Your first API call

The examples use a variable for the API base URL shown in the [API reference](/docs/api).

```bash
export JUBELIO_API_BASE="https://poc-open-api.qm-staging-k8s.jubelio.io/openapi/v1"
```

## 1. Get tokens

After a merchant installs your app, your redirect URI receives a `code`. Exchange it from your
backend:

```bash
curl -X POST "$JUBELIO_API_BASE/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "<code from the redirect>",
    "client_id": "<your client id>",
    "client_secret": "<your client secret>",
    "redirect_uri": "https://app.example.com/oauth/callback"
  }'
```

```json
{
  "access_token": "jblat_...",
  "refresh_token": "jblrt_...",
  "token_type": "Bearer",
  "expires_in": 21600,
  "merchant_id": "7K2QX9M4BDH3",
  "scopes": ["product.read"]
}
```

Save the tokens together with the `merchant_id`.

## 2. Call the API

```bash
curl "$JUBELIO_API_BASE/merchant" \
  -H "Authorization: Bearer <access_token>" \
  -H "x-jbl-merchant-id: <merchant_id>"
```

```json
{
  "data": { "merchant_id": "7K2QX9M4BDH3", "company_name": "Toko Contoh" },
  "meta": null,
  "error": null,
  "request_id": "3fa4c1e0-1234-4a5b-8c6d-c1d2e3f4a5b6"
}
```

Read [Authentication](../authentication.md) to learn how to keep the token fresh.
