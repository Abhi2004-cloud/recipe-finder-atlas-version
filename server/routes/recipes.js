const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const multer = require('../config/multer');
const fs = require('fs');
const path = require('path');

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single recipe
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('createdBy', 'username');
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        console.error('Error fetching recipe:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Create recipe
router.post('/', [auth, multer.single('image')], async (req, res) => {
    try {
        const { title, description, cuisine, prepTime, cookTime, servings, ingredients, instructions } = req.body;

        // Validate required fields
        if (!title || !description || !cuisine || !prepTime || !cookTime || !servings || !ingredients || !instructions) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Parse and validate ingredients
        let parsedIngredients;
        try {
            parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
                return res.status(400).json({ message: 'Ingredients must be a non-empty array' });
            }
        } catch (err) {
            return res.status(400).json({ message: 'Invalid ingredients format' });
        }

        // Parse and validate instructions
        let parsedInstructions;
        try {
            parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
            if (!Array.isArray(parsedInstructions) || parsedInstructions.length === 0) {
                return res.status(400).json({ message: 'Instructions must be a non-empty array' });
            }
        } catch (err) {
            return res.status(400).json({ message: 'Invalid instructions format' });
        }

        // Create new recipe
        const newRecipe = new Recipe({
            title,
            description,
            cuisine,
            prepTime: parseInt(prepTime),
            cookTime: parseInt(cookTime),
            servings: parseInt(servings),
            ingredients: parsedIngredients,
            instructions: parsedInstructions,
            image: req.file ? req.file.filename : 'default.jpg',
            createdBy: req.user._id
        });

        const recipe = await newRecipe.save();
        res.status(201).json(recipe);
    } catch (err) {
        console.error('Error creating recipe:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update recipe
router.put('/:id', [auth, multer.single('image')], async (req, res) => {
    try {
        const { title, description, cuisine, prepTime, cookTime, servings, ingredients, instructions } = req.body;

        // Find recipe
        let recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user owns recipe
        if (recipe.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Parse and validate ingredients if provided
        let parsedIngredients = recipe.ingredients;
        if (ingredients) {
            try {
                parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
                if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
                    return res.status(400).json({ message: 'Ingredients must be a non-empty array' });
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid ingredients format' });
            }
        }

        // Parse and validate instructions if provided
        let parsedInstructions = recipe.instructions;
        if (instructions) {
            try {
                parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
                if (!Array.isArray(parsedInstructions) || parsedInstructions.length === 0) {
                    return res.status(400).json({ message: 'Instructions must be a non-empty array' });
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid instructions format' });
            }
        }

        // If new image is uploaded, delete old image if it's not the default
        if (req.file && recipe.image !== 'default.jpg') {
            const oldImagePath = path.join('uploads', recipe.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update recipe
        recipe.title = title || recipe.title;
        recipe.description = description || recipe.description;
        recipe.cuisine = cuisine || recipe.cuisine;
        recipe.prepTime = prepTime ? parseInt(prepTime) : recipe.prepTime;
        recipe.cookTime = cookTime ? parseInt(cookTime) : recipe.cookTime;
        recipe.servings = servings ? parseInt(servings) : recipe.servings;
        recipe.ingredients = parsedIngredients;
        recipe.instructions = parsedInstructions;
        recipe.image = req.file ? req.file.filename : recipe.image;

        await recipe.save();
        res.json(recipe);
    } catch (err) {
        console.error('Error updating recipe:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user owns recipe
        if (recipe.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Delete image file if it's not the default
        if (recipe.image !== 'default.jpg') {
            const imagePath = path.join('uploads', recipe.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await recipe.deleteOne();
        res.json({ message: 'Recipe removed' });
    } catch (err) {
        console.error('Error deleting recipe:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 