import { useFavorites } from '../context/FavoritesContext';
import { properties } from '../data/properties';
import PropertyCard from '../components/Propertycard';

const FavoritesPage = () => {
  const { favorites } = useFavorites();

  const favoriteProperties = properties.filter(property =>
    favorites.includes(String(property.id))
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tus Favoritos</h2>
      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favoriteProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No has agregado propiedades a favoritos.</p>
      )}
    </div>
  );
};

export default FavoritesPage;