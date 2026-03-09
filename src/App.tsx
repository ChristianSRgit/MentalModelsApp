import { useState } from 'react';
import rawData from './data.json';
import './App.css';

interface MentalModel {
  title: string;
  title_es?: string;
  category: string;
  category_es?: string;
  description?: string;
  description_es?: string;
  smash_case_study?: string;
  smash_case_study_es?: string;
  'when_to_avoid_(or_use_with_caution)'?: string;
  'when_to_avoid_(or_use_with_caution)_es'?: string;
  keywords_for_situations?: string;
  keywords_for_situations_es?: string;
  thinking_steps?: string;
  thinking_steps_es?: string;
  categoryDir: string;
}

const data = rawData as MentalModel[];

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<MentalModel | null>(null);
  const [showSpanish, setShowSpanish] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const categories = Array.from(new Set(data.map(model => model.category))).sort();

  const modelsForDropdown = selectedCategory
    ? data.filter(model => model.category === selectedCategory)
    : data;

  const handleRandomModel = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setSelectedModel(data[randomIndex]);
    setSelectedCategory(null);
    setShowSpanish(false);
    setIsDropdownOpen(false);
  };

  const handleSelectModelFromDropdown = (model: MentalModel | null) => {
    setSelectedModel(model);
    if (model) {
        setSelectedCategory(model.category);
    }
    setShowSpanish(false);
    setIsDropdownOpen(false);
  };

  const getLocalizedText = (englishText?: string, spanishText?: string) => {
    return showSpanish && spanishText ? spanishText : (englishText || '');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Mental Models</h1>
      </header>

      <nav className="category-nav">
        <button 
          onClick={() => { setSelectedCategory(null); setSelectedModel(null); }} 
          className={!selectedCategory ? 'active' : ''}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => { setSelectedCategory(category); setSelectedModel(null); }}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </nav>

      <div className="main-content">
        <aside className="model-list-section">
          <button onClick={handleRandomModel} className="random-button">
            Shuffle
          </button>

          <div className="all-models-dropdown">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="dropdown-toggle-button">
              <span>{getLocalizedText(selectedModel?.title, selectedModel?.title_es) || "Select Model"}</span>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                {modelsForDropdown.map(model => (
                  <li key={model.title} onClick={() => handleSelectModelFromDropdown(model)}>
                    {getLocalizedText(model.title, model.title_es)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="model-detail-section">
          {selectedModel ? (
            <article className="model-card">
              <h3>{getLocalizedText(selectedModel.title, selectedModel.title_es)}</h3>
              <p><strong>Category:</strong> {getLocalizedText(selectedModel.category, selectedModel.category_es)}</p>
              
              {selectedModel.description && (
                <>
                  <h4>Description</h4>
                  <p>{getLocalizedText(selectedModel.description, selectedModel.description_es)}</p>
                </>
              )}
              
              {selectedModel.smash_case_study && (
                <>
                  <h4>SMASH Case Study</h4>
                  <p>{getLocalizedText(selectedModel.smash_case_study, selectedModel.smash_case_study_es)}</p>
                </>
              )}
              
              {selectedModel['when_to_avoid_(or_use_with_caution)'] && (
                <>
                  <h4>When to Avoid</h4>
                  <p>{getLocalizedText(selectedModel['when_to_avoid_(or_use_with_caution)'], selectedModel['when_to_avoid_(or_use_with_caution)_es'])}</p>
                </>
              )}
              
              {selectedModel.keywords_for_situations && (
                <>
                  <h4>Keywords</h4>
                  <p>{getLocalizedText(selectedModel.keywords_for_situations, selectedModel.keywords_for_situations_es)}</p>
                </>
              )}
              
              {selectedModel.thinking_steps && (
                <>
                  <h4>Thinking Steps</h4>
                  <p>{getLocalizedText(selectedModel.thinking_steps, selectedModel.thinking_steps_es)}</p>
                </>
              )}
              
              <button onClick={() => setShowSpanish(!showSpanish)} className="translate-button">
                {showSpanish ? 'View English' : 'Ver en Español'}
              </button>
            </article>
          ) : (
            <div className="empty-state">
              <p>Pick a category or shuffle to explore mental models.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
