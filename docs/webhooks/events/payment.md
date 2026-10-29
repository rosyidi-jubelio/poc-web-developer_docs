---
title: payment
sidebar_label: payment
sidebar_position: 2
---

# `payment`

A payment is created or changed.

| | |
| --- | --- |
| Event code | `payment` |
| Actions | `updated` |
| Record id in `data` | `payment_id` |
| Read the record | Not available yet |

## `updated`

Sent when a payment is created or changed.

```json
{
  "event_id": "8a0d4b71-2c5e-4f39-9b16-7e2a5c8d0f41",
  "event_code": "payment",
  "action": "updated",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "payment_id": 5120
  }
}
```

## Read the record

:::info Coming soon
An API endpoint to read this record is on the way. Until then, use the event as a signal that the record changed.
:::

See [Webhooks](../overview.md) for headers, verification and retries.
