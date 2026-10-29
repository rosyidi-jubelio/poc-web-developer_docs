---
title: invoice
sidebar_label: invoice
sidebar_position: 1
---

# `invoice`

An invoice is created or changed.

| | |
| --- | --- |
| Event code | `invoice` |
| Actions | `updated` |
| Record id in `data` | `invoice_id` |
| Read the record | [`GET /invoices`](/docs/api/finance/invoices/list-invoices) |

## `updated`

Sent when an invoice is created or changed.

```json
{
  "event_id": "3f6c1e2a-9b4d-4c7e-8a51-2d0f7b9e6c13",
  "event_code": "invoice",
  "action": "updated",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "invoice_id": 8891
  }
}
```

## Read the record

Call [`GET /invoices`](/docs/api/finance/invoices/list-invoices) with the access token and `x-jbl-merchant-id` of the merchant in the payload, and find the invoice whose `invoice_id` matches.

See [Webhooks](../overview.md) for headers, verification and retries.
