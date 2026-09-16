const SIZE = 160;
const STROKE_WIDTH = 24;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

// Paleta de status das cobranças, validada pela skill dataviz (good/warning/critical)
// — CVD-safe. Extraída de DashboardFinanceiro.js (T10, dashboard-geral) pra ser
// reaproveitada por qualquer card que precise do mesmo significado semântico.
export const DONUT_COLORS = {
  PAGO: "#0ca30c",
  PENDENTE: "#fab219",
  ATRASADO: "#d03b3b",
};

function DonutChart({ segments, ariaLabel = "Resumo de status das cobranças" }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let acumulado = 0;
  const arcos = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const fracao = total > 0 ? s.value / total : 0;
      const dash = fracao * CIRCUMFERENCE;
      const offset = -acumulado;
      acumulado += dash;
      return { ...s, dash, offset };
    });

  return (
    <div className="flex items-center gap-6">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={ariaLabel}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE_WIDTH}
        />
        {arcos.map((arco) => (
          <circle
            key={arco.label}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={arco.color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${arco.dash} ${CIRCUMFERENCE - arco.dash}`}
            strokeDashoffset={arco.offset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        ))}
      </svg>

      <ul className="space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-600">{s.label}</span>
            <span className="font-medium text-gray-800">
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DonutChart;
