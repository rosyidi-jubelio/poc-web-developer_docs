---
title: purchase_order
sidebar_label: purchase_order
sidebar_position: 5
---

# `purchase_order`

A purchase order is created, changed or deleted.

| | |
| --- | --- |
| Event code | `purchase_order` |
| Actions | `updated`, `deleted` |
| Record id in `data` | `purchaseorder_id` |
| Read the record | Not available yet |

## `updated`

Sent when a purchase order is created or changed.

```json
{
  "event_id": "71c3e8b5-0a9d-4f62-8c14-d5e2a7b9f016",
  "event_code": "purchase_order",
  "action": "updated",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "purchaseorder_id": 3307
  }
}
```

## `deleted`

Sent when a purchase order is deleted. The record no longer exists, so remove it on your side instead of reading it.

```json
{
  "event_id": "9d2f6a40-3e8c-4b17-a5f9-1c7e0b4d2a86",
  "event_code": "purchase_order",
  "action": "deleted",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "purchaseorder_id": 3307
  }
}
```

## Read the record

:::info Coming soon
An API endpoint to read this record is on the way. Until then, use the event as a signal that the record changed.
:::

See [Webhooks](../overview.md) for headers, verification and retries.
