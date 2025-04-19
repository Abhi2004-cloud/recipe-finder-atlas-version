import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../config/api';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecipes = async () => {
        try {
            console.log('Fetching recipes from:', `${config.API_URL}/api/recipes`);
            const response = await fetch(`${config.API_URL}/api/recipes`, {
                ...config.fetchOptions,
                headers: config.headers
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch recipes: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched recipes:', data);
            setRecipes(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError(err.message || 'Failed to fetch recipes. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    if (loading) return <div>Loading recipes...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="recipe-list">
            <h2>All Recipes</h2>
            {recipes.length === 0 ? (
                <p>No recipes found. Create your first recipe!</p>
            ) : (
                <div className="recipes-grid">
                    {recipes.map(recipe => (
                        <div key={recipe._id} className="recipe-card">
                            <img 
                                src={`${config.UPLOADS_URL}/${recipe.image}`} 
                                alt={recipe.title}
                                onError={(e) => {
                                    e.target.src = '/default-recipe.jpg';
                                }}
                            />
                            <h3>{recipe.title}</h3>
                            <p>{recipe.description}</p>
                            <Link to={`/recipes/${recipe._id}`}>View Recipe</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipeList; 