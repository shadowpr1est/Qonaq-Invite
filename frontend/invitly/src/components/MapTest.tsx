import React from 'react';
import TwoGISMapPreview from './TwoGISMapPreview';

const MapTest: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Тест карты 2ГИС</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Москва, Кремль</h2>
          <TwoGISMapPreview
            location="Москва, Кремль"
            title="Государственный Кремлёвский Дворец"
            height="300px"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Санкт-Петербург, Эрмитаж</h2>
          <TwoGISMapPreview
            location="Санкт-Петербург, Государственный Эрмитаж"
            title="Эрмитаж"
            height="300px"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Некорректный адрес</h2>
          <TwoGISMapPreview
            location=""
            title="Тест ошибки"
            height="300px"
          />
        </div>
      </div>
    </div>
  );
};

export default MapTest; 