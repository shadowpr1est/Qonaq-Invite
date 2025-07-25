import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Coordinates {
  lat: number;
  lon: number;
}

interface TwoGISMapPreviewProps {
  location: string;
  title?: string;
  height?: string;
  className?: string;
  showControls?: boolean;
}

const TwoGISMapPreview: React.FC<TwoGISMapPreviewProps> = ({
  location,
  title = "Место проведения",
  height = "300px",
  className = "",
  showControls = true
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!location?.trim()) {
        setError("Адрес не указан");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Парсим адрес на город и название места
        const parts = location.split(',').map(part => part.trim());
        const city = parts[0] || '';
        const venueName = parts.slice(1).join(', ') || '';

        const response = await apiClient.get('/api/v1/get_coordinates', {
          params: {
            city,
            venue_name: venueName
          }
        });

        if (response.data && response.data.lat && response.data.lon) {
          setCoordinates({
            lat: response.data.lat,
            lon: response.data.lon
          });
        } else {
          setError("Не удалось получить координаты");
        }
      } catch (err: any) {
        console.error('Error fetching coordinates:', err);
        setError(err.response?.data?.detail || "Ошибка при получении координат");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinates();
  }, [location]);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">{t('common.loading_map')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm text-gray-600">Нет данных для отображения карты</p>
        </div>
      </div>
    );
  }

  // Формируем URL для iframe 2ГИС
  const mapUrl = `https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A${coordinates.lat}%2C%22lon%22%3A${coordinates.lon}%2C%22zoom%22%3A16%7D%2C%22opt%22%3A%7B%22zoom%22%3A16%2C%22center%22%3A%7B%22lat%22%3A${coordinates.lat}%2C%22lon%22%3A${coordinates.lon}%7D%7D%2C%22org%22%3A%7B%22name%22%3A%22${encodeURIComponent(title)}%22%2C%22lat%22%3A${coordinates.lat}%2C%22lon%22%3A${coordinates.lon}%7D%7D`;

  return (
    <div className={`relative ${className}`}>
      {showControls && (
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>2ГИС</span>
          </div>
        </div>
      )}
      
      <div 
        className="relative rounded-lg overflow-hidden border border-gray-200"
        style={{ height }}
      >
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          title={`Карта: ${title}`}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        
        {/* Overlay с информацией о координатах (для отладки) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoGISMapPreview; 