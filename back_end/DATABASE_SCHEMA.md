# MongoDB Atlas Schema

This backend uses Mongoose, so MongoDB Atlas collections are created automatically when the app writes the first documents.

## Core Collections

- `users`: account data for all roles (`user`, `admin`, `shipper`)
- `admins`: admin profile metadata linked to `users`
- `shippers`: shipper profile metadata linked to `users`
- `shipments`: delivery assignment and tracking for orders
- `addresses`: shipping addresses
- `carts`: shopping carts
- `categories`: product categories
- `charities`: charity campaigns
- `donations`: donation records
- `favorites`: saved posts
- `orders`: purchase orders
- `posts`: product posts
- `reports`: moderation reports
- `reviews`: user reviews
- `transactions`: payment and wallet transactions

## Role Design

- `users.role = user` for normal customers
- `users.role = admin` for administrators
- `users.role = shipper` for delivery staff

The `admins` and `shippers` collections are optional profile collections. They do not replace `users`; they store extra operational data for those roles.

## Suggested Shipments Flow

1. An order is created in `orders`.
2. A shipment document is created in `shipments`.
3. The shipment is assigned to a shipper.
4. Status changes are stored in `shipments.timeline`.
5. The order can move to `shipping` and then `completed`.
