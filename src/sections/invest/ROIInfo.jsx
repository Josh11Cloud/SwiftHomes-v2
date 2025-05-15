export default function ROIInfo() {
  return (
    <section id="seccion-roi" className="mt-10 px-4 py-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">¿Qué es el ROI?</h2>
      <p className="text-gray-700 mb-3">
        El ROI (Retorno sobre la Inversión) es una métrica clave que te indica qué tan rentable es una propiedad.
        Se calcula tomando el ingreso neto anual y dividiéndolo entre el precio de la propiedad.
      </p>
      <p className="text-gray-700 mb-3">
        Un ROI alto significa mejor rentabilidad. Sin embargo, también debes tener en cuenta otros factores como la ubicación, riesgo, valorización y liquidez.
      </p>
      <p className="text-gray-700">
        Fórmula: <code className="bg-gray-100 px-1 rounded">ROI = (Ingreso Neto Anual / Precio) × 100</code>
      </p>
    </section>
  );
}