import React, { useState } from 'react';

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [clicks, setClicks] = useState(0);

  const tabs = ['Dashboard', 'Formatos', 'Referências', 'Projetos'];

  const handleTestClick = () => {
    setClicks(prev => prev + 1);
    console.log('[APP] clique funcionando');
  };

  return (
    <div className="container">
      <header>
        <h1>Painel Pessoal</h1>
        <p>Organização de produção de conteúdo</p>
      </header>

      <nav className="tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="content">
        <div className="card">
          <h2>{activeTab}</h2>
          <p>{activeTab} funcionando</p>
        </div>

        <div className="card test-section">
          <button onClick={handleTestClick} className="btn-primary">
            Testar clique
          </button>
          <p className="status">Cliques: {clicks}</p>
        </div>
      </main>
    </div>
  );
};

export default App;