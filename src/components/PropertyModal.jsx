import { X } from 'lucide-react';
import { MapPin, CircleParking, ShowerHead, BedSingle } from 'lucide-react';

export default function PropertyModal({ isOpen, onClose, property }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-50 rounded-2xl shadow-lg max-w-2xl w-full relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-50 hover:text-red-700">
          <X size={24} />
        </button>

        {/* Image */}
        <img src={property.image} alt={property.title} className="rounded-t-2xl w-full h-60 object-cover" />

        {/* Content */}
        <div className="p-4 space-y-1">
          <h3 className="text-xl font-semibold text-gray-800">{property.name}</h3>
          <div className="flex items-center space-x-1.5 text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p className="text-gray-700">{property.location}</p>
            <span className="text-sm text-gray-500">{property.area}m²</span>
            <CircleParking className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p>{property.parking}</p>
            <ShowerHead className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p>{property.bathrooms}</p>
            <BedSingle className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p>{property.bedrooms}</p>
          </div>
          <p className="font-bold text-[#0077B6] mt-2 text-lg">${property.price.toLocaleString('es-MX')}</p>
        </div>

        <p className="text-gray-700 text-sm">{property.description}</p>
      </div>
    </div>
  );
}