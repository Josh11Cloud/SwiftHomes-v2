const SummaryCard = ({ title, value, icon, color }) => {
  return (
    <div className={`rounded-2xl shadow-md p-4 bg-slate-50 border-l-4 ${color} flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;