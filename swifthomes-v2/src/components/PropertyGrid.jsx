import PropertyModal from './PropertyModal';
import { useState } from 'react';
import PropertyCard from './Propertycard';

export default function PropertyGrid({ properties }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map((prop) => (
            <PropertyCard
            key={prop.id}
            property={prop}
            onClick={(property) => setSelectedProperty(property)} 
            />
        ))}
      </div>

      <PropertyModal
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        property={selectedProperty}
      />
    </>
  );
}
