---
title: Embedded apps
sidebar_position: 4
---

# Embedded apps

An embedded app opens inside the Jubelio App Store. To tell your backend which merchant and user
are viewing it, your app frontend gets a **session token** from the Jubelio SDK and sends it to
your backend.

:::info Coming soon
The embedded app SDK and its setup guide are on the way.
:::

The session token is a JWT signed with your client secret. On your backend:

1. Verify the signature with your client secret.
2. Check that it has not expired and that `aud` is your Client ID.
3. Read `merchant_id` from it, and call the Open API with the access token you stored for that
   merchant.

The session token only identifies the viewer. Do not send it to the Open API.
