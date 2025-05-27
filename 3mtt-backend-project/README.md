# Mini Project: Simple REST API with Express.js

This project is a simple REST API built with Express.js to manage a collection of items. It demonstrates basic CRUD (Create, Read, Update, Delete) operations using an in-memory data store.

## Objective

To evaluate the ability to create a simple REST API using Express.js, demonstrating an understanding of routing, middleware, data management, error handling, and basic API design principles.

## Features

*   Basic Express.js application setup.
*   Root URL ("/") returns a "Hello, World!" message.
*   Middleware for JSON parsing.
*   In-memory array for data storage.
*   CRUD operations for items:
    *   GET all items
    *   GET a single item by ID
    *   POST (create) a new item
    *   PUT (update) an existing item by ID
    *   DELETE an item by ID
*   Input validation for creating and updating items.
*   Appropriate HTTP status codes and meaningful error messages (400, 404, 500).
*   Error handling for invalid routes.

## Item Structure

Each item in the data store has the following structure:

```json
{
  "id": 1,
  "name": "Item Name",
  "description": "A brief description of the item."
}