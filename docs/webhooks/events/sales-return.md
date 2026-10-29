---
title: sales_return
sidebar_label: sales_return
sidebar_position: 7
---

# `sales_return`

A sales return is created.

| | |
| --- | --- |
| Event code | `sales_return` |
| Actions | `updated` |
| Record id in `data` | `return_id` |
| Read the record | Not available yet |

## `updated`

Sent when a sales return is created or changed.

```json
{
  "event_id": "4c9e1b6d-7a3f-4e82-b0d5-2f8a6c1e9b37",
  "event_code": "sales_return",
  "action": "updated",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "return_id": 926
  }
}
```

## Read the record

:::info Coming soon
An API endpoint to read this record is on the way. Until then, use the event as a signal that the record changed.
:::

See [Webhooks](../overview.md) for headers, verification and retries.
