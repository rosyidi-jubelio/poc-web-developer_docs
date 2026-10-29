---
title: purchase_return
sidebar_label: purchase_return
sidebar_position: 6
---

# `purchase_return`

A purchase return is created, changed or deleted.

| | |
| --- | --- |
| Event code | `purchase_return` |
| Actions | `updated`, `deleted` |
| Record id in `data` | `return_id` |
| Read the record | Not available yet |

## `updated`

Sent when a purchase return is created or changed.

```json
{
  "event_id": "2e8b5d17-9c4a-4f30-b6e1-7a0d3c9f5b24",
  "event_code": "purchase_return",
  "action": "updated",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "return_id": 418
  }
}
```

## `deleted`

Sent when a purchase return is deleted. The record no longer exists, so remove it on your side instead of reading it.

```json
{
  "event_id": "f6a1c937-4b2e-4d58-9e07-3c8b1a5d6f92",
  "event_code": "purchase_return",
  "action": "deleted",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "return_id": 418
  }
}
```

## Read the record

:::info Coming soon
An API endpoint to read this record is on the way. Until then, use the event as a signal that the record changed.
:::

See [Webhooks](../overview.md) for headers, verification and retries.
