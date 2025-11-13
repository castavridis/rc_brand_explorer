import { useState, useEffect } from 'react';
import type { Brand } from '@/types/brand';
import { loadBrands } from '@/services/brandLoader';
import { LogoGrid } from '@/components/LogoGrid/LogoGrid';
import { LogoModal } from '@/components/LogoModal/LogoModal';
import './App.css';

function App() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadBrands()
      .then((data) => {
        setBrands(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading brands:', err);
        setError('Failed to load brand logos. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <h1>Brand Logo Browser</h1>
          <p className="app__subtitle">
            Explore {brands.length} brand {brands.length === 1 ? 'logo' : 'logos'}
          </p>
        </div>
      </header>

      <main className="app__main">
        {error ? (
          <div className="app__error">{error}</div>
        ) : (
          <LogoGrid
            brands={brands}
            onBrandClick={setSelectedBrand}
            loading={loading}
            emptyMessage="No brand logos available"
          />
        )}
      </main>

      <LogoModal
        brand={selectedBrand}
        open={selectedBrand !== null}
        onClose={() => setSelectedBrand(null)}
      />
    </div>
  );
}

export default App;
