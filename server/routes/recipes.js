const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('createdBy', 'username');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username');
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new recipe
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { title, description, cuisine, prepTime, cookTime, servings, ingredients, instructions } = req.body;
        
        // Validate required fields
        if (!title || !description || !cuisine || !prepTime || !cookTime || !servings) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Parse ingredients and instructions if they are strings
        const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
        const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;

        // Create new recipe
        const recipe = new Recipe({
            title,
            description,
            cuisine,
            prepTime,
            cookTime,
            servings,
            ingredients: parsedIngredients,
            instructions: parsedInstructions,
            image: req.file ? req.file.path : 'uploads/default-recipe.jpg',
            createdBy: req.user._id
        });

        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update recipe
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const { title, description, cuisine, prepTime, cookTime, servings, ingredients, instructions } = req.body;
        
        // Find recipe
        let recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user is authorized
        if (recipe.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Parse ingredients and instructions if they are strings
        const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
        const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;

        // Update recipe
        recipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                cuisine,
                prepTime,
                cookTime,
                servings,
                ingredients: parsedIngredients,
                instructions: parsedInstructions,
                image: req.file ? req.file.path : recipe.image
            },
            { new: true }
        );

        res.json(recipe);
    } catch (error) {
        console.error(error);
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

        // Check if user is the creator of the recipe
        if (recipe.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this recipe' });
        }

        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 