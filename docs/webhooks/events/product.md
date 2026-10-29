---
title: product
sidebar_label: product
sidebar_position: 3
---

# `product`

A product is created, changed or deleted.

| | |
| --- | --- |
| Event code | `product` |
| Actions | `updated`, `deleted` |
| Record id in `data` | `item_group_id` |
| Read the record | [`GET /products`](/docs/api/catalogue/products/list-products) |

## `updated`

Sent when a product is created or changed.

```json
{
  "event_id": "c41e9f02-6a3b-4d7c-8e15-0b9a2f6d3c78",
  "event_code": "product",
  "action": "updated",
  "merchant_id": "7K2QX9M4BDH3",
  "timestamp": "2026-09-15T10:14:22.481Z",
  "data": {
    "item_group_id": 12
  }
}
```

## `deleted`

Sent when a product is deleted. The record no longer exists, so remove it on your side instead of reading it.

```json
{
  "event_id": "5b7f2e9a-1d4c-4a86-b3e0-9c6f1a2d8e54",
  "event_code": "product",
  "action": "deleted",
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
