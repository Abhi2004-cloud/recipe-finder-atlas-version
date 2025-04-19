import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../config/api';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/recipes`, {
                ...config.fetchOptions,
                headers: config.headers
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const data = await response.json();
            setRecipes(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="recipe-list">
            <h2>All Recipes</h2>
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
        </div>
    );
};

export default RecipeList; 