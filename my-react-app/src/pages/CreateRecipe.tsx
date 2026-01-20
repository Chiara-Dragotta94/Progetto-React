import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';
import type { UserRecipe, Ingredient } from '../types/recipe';
import './CreateRecipe.css';

const INGREDIENT_CATEGORIES = {
  '🥬 Verdure': ['🍅 Pomodori', '🥒 Zucchine', '🍆 Melanzane', '🫑 Peperoni', '🥕 Carote', '🥦 Broccoli', '🥬 Spinaci', '🥬 Cavolo', '🥔 Patate', '🧅 Cipolla', '🧄 Aglio'],
  '🫘 Legumi': ['🫘 Ceci', '🫘 Lenticchie', '🫘 Fagioli', '🫘 Piselli', '🫘 Fave', '🫘 Soia', '🫘 Edamame'],
  '🌾 Cereali': ['🍚 Riso', '🍝 Pasta', '🌾 Quinoa', '🌾 Farro', '🌾 Orzo', '🌾 Bulgur', '🌾 Avena'],
  '🍎 Frutta': ['🍎 Mele', '🍌 Banane', '🍊 Arance', '🍓 Fragole', '🫐 Mirtilli', '🍇 Uva', '🥝 Kiwi'],
  '🧂 Altro': ['🫒 Olio d\'oliva', '🧂 Sale', '🌶️ Pepe', '🌿 Basilico', '🌿 Prezzemolo', '🌿 Rosmarino', '🌿 Origano', '🥑 Avocado', '🥜 Noci']
};

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { addUserRecipe } = useRecipe();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Verdure');

  const handleAddIngredient = (ingredientName: string) => {
    // Rimuove l'emoji dal nome per il confronto
    const cleanName = ingredientName.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, '').trim();
    const existing = ingredients.find(ing => ing.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      setIngredients(ingredients.filter(ing => ing.id !== existing.id));
    } else {
      const newIngredient: Ingredient = {
        id: Date.now() + Math.random(),
        name: cleanName,
        amount: 1,
        unit: '',
        original: ingredientName,
      };
      setIngredients([...ingredients, newIngredient]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const newRecipe: UserRecipe = {
      id: Date.now(),
      title,
      image: image || '/placeholder-recipe.jpg',
      summary: description,
      readyInMinutes: prepTime ? parseInt(prepTime) : undefined,
      servings: servings ? parseInt(servings) : undefined,
      extendedIngredients: ingredients,
      instructions: instructions.split('\n').filter(Boolean).join('\n'),
      vegetarian: true,
      isUserCreated: true,
    };

    addUserRecipe(newRecipe);
    navigate('/my-recipes');
  };

  return (
    <div className="create-recipe">
      <h1>Crea la Tua Ricetta</h1>
      <form onSubmit={handleSubmit} className="create-recipe-form">
        <div className="form-group">
          <label>Titolo *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>URL Immagine</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg (opzionale)"
          />
        </div>

        <div className="form-group">
          <label>Descrizione *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tempo di preparazione (minuti)</label>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Porzioni</label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Ingredienti</label>
          <div className="ingredient-categories">
            {Object.entries(INGREDIENT_CATEGORIES).map(([category, items]) => (
              <div key={category} className="ingredient-category">
                <h4>{category}</h4>
                <div className="ingredient-buttons">
                  {items.map((item) => {
                    const cleanName = item.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, '').trim();
                    const isSelected = ingredients.some(ing => 
                      ing.name.toLowerCase() === cleanName.toLowerCase()
                    );
                    return (
                      <button
                        key={item}
                        type="button"
                        className={`ingredient-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleAddIngredient(item)}
                        title={cleanName}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {ingredients.length > 0 && (
            <div className="selected-ingredients">
              <h4>✨ Ingredienti selezionati ({ingredients.length}):</h4>
              <div className="selected-ingredients-grid">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="selected-ingredient-item">
                    <span className="ingredient-emoji">🍽️</span>
                    <span className="ingredient-name">{ing.name}</span>
                    <button
                      type="button"
                      className="remove-ingredient"
                      onClick={() => setIngredients(ingredients.filter(i => i.id !== ing.id))}
                      title="Rimuovi"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Istruzioni</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={8}
            placeholder="Scrivi i passaggi della ricetta..."
          />
        </div>

        <button type="submit" className="submit-button">
          Salva Ricetta
        </button>
      </form>
    </div>
  );
}
