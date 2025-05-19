import * as Tooltip from "@radix-ui/react-tooltip";
import ROIValue from "./ROIValue";

export default function ROIWithTooltip({ value }) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="cursor-help font-semibold text-sm text-green-600">
            <ROIValue value={value.replace('%', '')} />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-[#0077b6] text-slate-50 px-3 py-1 rounded shadow-lg text-xs"
            sideOffset={5}
          >
            El Retorno de Inversión (ROI) es el porcentaje de ganancia anual comparado al precio de compra.
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
