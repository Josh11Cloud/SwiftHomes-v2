import { Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ROIInfo from './ROIInfo';

export default function ROIHeader() {
  const [showInfo, setShowInfo] = useState(false);
  const roiInfoRef = useRef(null);

  const handleClick = (event) => {
    event.stopPropagation(); 
    setShowInfo(true);
  };

  useEffect(() => {
    if (showInfo && roiInfoRef.current) {
      roiInfoRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showInfo]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowInfo(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="relative group cursor-pointer" onClick={handleClick}>
        <Info className="w-4 h-4 text-blue-500" />
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-sm text-gray-700 px-3 py-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 w-64">
          El ROI indica la rentabilidad estimada anual.  
          <span className="text-blue-500 underline ml-1">Ver más</span>
        </div>
      </div>
      {showInfo && createPortal(
        <div ref={roiInfoRef}>
          <ROIInfo />
        </div>,
        document.body
      )}
    </div>
  );
}