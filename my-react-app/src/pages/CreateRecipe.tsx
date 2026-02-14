// Pagina CreateRecipe: form per creare una nuova ricetta personalizzata
// L'utente compila titolo, descrizione, tempo, porzioni, ingredienti e istruzioni.
// Gli ingredienti sono selezionabili da un pannello organizzato per categorie
// con bottoni toggle (clicca per aggiungere, clicca di nuovo per rimuovere).
// La ricetta viene salvata nel localStorage tramite il RecipeContext.

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';
import type { UserRecipe, Ingredient } from '../types/recipe';
import './CreateRecipe.css';

// Dizionario degli ingredienti organizzati per categoria
// Ogni categoria ha una lista di ingredienti con emoji per una migliore UX visiva
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

  // Stato del form: ogni campo del form ha il proprio stato
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Verdure');

  // Gestisco l'aggiunta/rimozione di un ingrediente (funziona come toggle)
  // Se l'ingrediente e' gia' selezionato, lo rimuovo; altrimenti lo aggiungo
  const handleAddIngredient = (ingredientName: string) => {
    // Rimuovo l'emoji dal nome per avere un nome pulito per il confronto
    const cleanName = ingredientName.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, '').trim();

    // Controllo se l'ingrediente e' gia' nella lista
    const existing = ingredients.find(ing => ing.name.toLowerCase() === cleanName.toLowerCase());

    if (existing) {
      // Se esiste, lo rimuovo (toggle off)
      setIngredients(ingredients.filter(ing => ing.id !== existing.id));
    } else {
      // Se non esiste, lo aggiungo (toggle on)
      const newIngredient: Ingredient = {
        id: Date.now() + Math.random(), // ID univoco generato al momento
        name: cleanName,
        amount: 1,
        unit: '',
        original: ingredientName,
      };
      setIngredients([...ingredients, newIngredient]);
    }
  };

  // Gestisco l'invio del form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validazione: titolo e descrizione sono obbligatori
    if (!title || !description) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    // Creo l'oggetto ricetta con tutti i dati del form
    const newRecipe: UserRecipe = {
      id: Date.now(),                  // ID univoco basato sul timestamp
      title,
      image: image || '/placeholder-recipe.jpg',  // Immagine di default se non specificata
      summary: description,
      readyInMinutes: prepTime ? parseInt(prepTime) : undefined,
      servings: servings ? parseInt(servings) : undefined,
      extendedIngredients: ingredients,
      instructions: instructions.split('\n').filter(Boolean).join('\n'), // Rimuovo righe vuote
      vegetarian: true,                // Le ricette create su Leafy sono sempre vegetariane
      isUserCreated: true,             // Flag per identificare le ricette utente
    };

    // Salvo la ricetta nel contesto (e quindi nel localStorage)
    addUserRecipe(newRecipe);

    // Navigo alla pagina "Le mie ricette" per mostrare la ricetta appena creata
    navigate('/my-recipes');
  };

  return (
    <div className="create-recipe">
      <h1>Crea la Tua Ricetta</h1>
      <form onSubmit={handleSubmit} className="create-recipe-form">
        {/* Campo titolo (obbligatorio) */}
        <div className="form-group">
          <label>Titolo *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Campo URL immagine (opzionale) */}
        <div className="form-group">
          <label>URL Immagine</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg (opzionale)"
          />
        </div>

        {/* Campo descrizione (obbligatorio) */}
        <div className="form-group">
          <label>Descrizione *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
        </div>

        {/* Campi tempo e porzioni affiancati */}
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

        {/* Pannello ingredienti: organizzato per categorie con bottoni toggle */}
        <div className="form-group">
          <label>Ingredienti</label>
          <div className="ingredient-categories">
            {Object.entries(INGREDIENT_CATEGORIES).map(([category, items]) => (
              <div key={category} className="ingredient-category">
                <h4>{category}</h4>
                <div className="ingredient-buttons">
                  {items.map((item) => {
                    // Pulisco il nome per il confronto (rimuovo emoji)
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

          {/* Riepilogo ingredienti selezionati con possibilita' di rimozione */}
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

        {/* Campo istruzioni: textarea multiriga per i passaggi della ricetta */}
        <div className="form-group">
          <label>Istruzioni</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={8}
            placeholder="Scrivi i passaggi della ricetta..."
          />
        </div>

        {/* Bottone di invio */}
        <button type="submit" className="submit-button">
          Salva Ricetta
        </button>
      </form>
    </div>
  );
}
