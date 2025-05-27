const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Setting Up the API
// Middleware for parsing JSON request bodies
app.use(express.json());

// In-memory data store
let items = [
    { id: 1, name: "Sample Item 1", description: "This is the first sample item." },
    { id: 2, name: "Sample Item 2", description: "Another item for demonstration." }
];
let currentId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1; // Start ID after existing ones

// Root URL
app.get('/', (req, res) => {
    res.send('Hello, World! Welcome to the Simple REST API.');
});

// 2. Creating Routes (CRUD operations)

// GET /items - Retrieve all items
app.get('/items', (req, res) => {
    res.status(200).json(items);
});

// GET /items/:id - Retrieve a single item by ID
app.get('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = items.find(i => i.id === itemId);

    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
});

// POST /items - Create a new item
app.post('/items', (req, res) => {
    const { name, description } = req.body;

    // 3. Data Management - Implement proper validation for incoming data
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
    }
    if (typeof name !== 'string' || typeof description !== 'string') {
        return res.status(400).json({ message: 'Name and description must be strings' });
    }

    const newItem = {
        id: currentId++,
        name,
        description
    };
    items.push(newItem);
    res.status(201).json(newItem); // 201 Created
});

// PUT /items/:id - Update an item by ID
app.put('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
    }

    const { name, description } = req.body;

    // Validation
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required for update' });
    }
    if (typeof name !== 'string' || typeof description !== 'string') {
        return res.status(400).json({ message: 'Name and description must be strings' });
    }

    items[itemIndex] = { ...items[itemIndex], name, description };
    res.status(200).json(items[itemIndex]);
});

// DELETE /items/:id - Delete an item by ID
app.delete('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
    }

    const deletedItem = items.splice(itemIndex, 1);
    // res.status(204).send(); // No content - common for DELETE
    res.status(200).json({ message: 'Item deleted successfully', item: deletedItem[0] });
});


// 1. Setting Up the API - Implement error handling for invalid routes (should be last)
// 4. Error Handling - Implement appropriate error responses & meaningful messages
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// General error handler (catches errors from route handlers if they call next(err))
// For this simple app, most errors are handled directly in routes.
// This is more for unhandled errors or if you use `next(err)`
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging
    res.status(500).json({ message: 'Something went wrong on the server!' });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // For potential testing