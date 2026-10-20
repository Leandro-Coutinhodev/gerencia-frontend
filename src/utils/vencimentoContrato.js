// Vencimento sugerido da cobrança a partir do contrato do paciente (AD-022 no
// STATE.md da raiz). Regra no navegador por decisão do usuário — a alternativa
// registrada é mover pra um endpoint do backend se isso der problema.
//
// Todas as datas são strings "yyyy-MM-dd" em horário local (sem toISOString,
// que vira o dia seguinte depois das 21h em BRT).

const pad = (n) => String(n).padStart(2, "0");

export const hojeLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const STATUS_FORA = ["CANCELADO", "EXPIRADO"];

// Contrato mais recente vigente hoje (início <= hoje <= fim), fora CANCELADO/EXPIRADO.
// Contrato aguardando assinatura conta — valor e data já foram combinados.
export const contratoVigente = (contratos, hoje = hojeLocal()) =>
  (contratos || [])
    .filter(
      (c) =>
        c.paymentDate &&
        !STATUS_FORA.includes(c.status) &&
        c.startDate && c.startDate <= hoje &&
        c.endDate && c.endDate >= hoje
    )
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;

// Usa só o DIA de paymentDate. Mês atual, ou o próximo se o dia já passou;
// dia inexistente no mês (ex.: 31 em fevereiro) vira o último dia do mês.
export const vencimentoDoMes = (paymentDate, hoje = hojeLocal()) => {
  const dia = Number(paymentDate.split("-")[2]);
  let [ano, mes] = hoje.split("-").map(Number);
  const montar = () => {
    const ultimoDia = new Date(ano, mes, 0).getDate();
    return `${ano}-${pad(mes)}-${pad(Math.min(dia, ultimoDia))}`;
  };
  let data = montar();
  if (data < hoje) {
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
    data = montar();
  }
  return data;
};

// { data, dia } ou null se o paciente não tem contrato vigente com data de pagamento
export const sugerirVencimento = (contratos, hoje = hojeLocal()) => {
  const contrato = contratoVigente(contratos, hoje);
  if (!contrato) return null;
  return {
    data: vencimentoDoMes(contrato.paymentDate, hoje),
    dia: Number(contrato.paymentDate.split("-")[2]),
  };
};
