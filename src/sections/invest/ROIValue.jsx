import { ArrowUpRight, ArrowDownLeft, Minus, ArrowRight } from 'lucide-react';

export default function ROIValue({ value }) {
  const numeric = parseFloat(value);

  let icon = <Minus className="text-gray-400 w-4 h-4" />;
  let color = 'text-gray-600';

  if (numeric >= 5) {
    icon = <ArrowUpRight className="text-green-600 w-4 h-4" />;
    color = 'text-green-600';
  } else if (numeric < 5) {
    icon = <ArrowRight className="text-yellow-600 w-4 h-4" />;
    color = 'text-yellow-600';
  } else {
    icon = <ArrowDownLeft className='text-red-600 w-4 h-4' />
    color = 'text-red-600'
  }

  return (
    <span className={`flex items-center gap-1 font-semibold ${color}`}>
      {icon}
      {numeric.toFixed(2)}%
    </span>
  );
}
