---
title: price
sidebar_label: price
sidebar_position: 4
---

# `price`

A product's price changes.

| | |
| --- | --- |
| Event code | `price` |
| Actions | `updated` |
| Record id in `data` | `item_group_id` |
| Read the record | [`GET /products`](/docs/api/catalogue/products/list-products) |

## `updated`

Sent when a product price is created or changed.

```json
{
  "event_id": "e29a6c14-8f3b-4e05-a7d2-4b1c9e6f0a33",
  "event_code": "price",
  "action": "updated",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "item_group_id": 12
  }
}
```

## Read the record

Call [`GET /products`](/docs/api/catalogue/products/list-products) with the access token and `x-jbl-merchant-id` of the merchant in the payload, and find the product whose `product_id` equals `item_group_id`.

See [Webhooks](../overview.md) for headers, verification and retries.
