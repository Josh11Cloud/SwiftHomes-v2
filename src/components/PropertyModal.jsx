import { X } from 'lucide-react';
import { MapPin, CircleParking, ShowerHead, BedSingle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden : { opacity: 0, y:20},
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.3, ease: 'easeOut'},
  }),
};

export default function PropertyModal({ isOpen, onClose, property }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="modal-overlay"
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-slate-50 rounded-2xl shadow-lg max-w-2xl w-full relative overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-50 hover:text-red-700 transition duration-200"
            >
              <X size={24} />
            </button>

            {/* Image */}
            <motion.img
              src={property.image}
              alt={property.title}
              className="rounded-t-2xl w-full h-60 object-cover"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
            />

            {/* Info Section */}
            <motion.div 
            className="p-4 space-y-2"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}>
              <h3 className="text-2xl font-bold text-gray-800">{property.name}</h3>

              {/* Location and stats */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#0077b6]" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CircleParking className="w-4 h-4 text-[#0077b6]" />
                  <span>{property.parking}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShowerHead className="w-4 h-4 text-[#0077b6]" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BedSingle className="w-4 h-4 text-[#0077b6]" />
                  <span>{property.bedrooms}</span>
                </div>
                <span className="text-sm text-gray-500 ml-auto">{property.area}m²</span>
              </div>

              {/* Price */}
              <p className="text-xl font-bold text-[#0077B6]">
                ${property.price.toLocaleString('es-MX')}
              </p>
            </motion.div>

            {/* Description */}
            <motion.div className="px-4 pb-4 max-h-32 overflow-y-auto text-gray-700 text-sm scrollbar-thin scrollbar-thumb-gray-300"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}>
              {property.description}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}