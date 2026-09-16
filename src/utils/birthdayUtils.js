// Extraído de AniversariantesDoMes.js (dashboard-geral, T9) — mesmo comportamento,
// reaproveitado também pelo card de aniversariantes da Home.

// Extrai dia/mês/ano direto da string "yyyy-MM-dd" sem risco de fuso horário
export const parseDateParts = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
};

export const calcularIdadeQueFara = (dateBirth) => {
  const parts = parseDateParts(dateBirth);
  if (!parts) return "-";
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  let idade = anoAtual - parts.year;
  // se o aniversário deste ano já passou, a idade "a fazer" é a do próximo aniversário
  const aniversarioJaPassou =
    hoje.getMonth() + 1 > parts.month ||
    (hoje.getMonth() + 1 === parts.month && hoje.getDate() > parts.day);
  if (aniversarioJaPassou) idade += 1;
  return idade;
};

export const diasParaAniversario = (dateBirth) => {
  const parts = parseDateParts(dateBirth);
  if (!parts) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let proximo = new Date(hoje.getFullYear(), parts.month - 1, parts.day);
  if (proximo < hoje) proximo = new Date(hoje.getFullYear() + 1, parts.month - 1, parts.day);
  return Math.round((proximo - hoje) / (1000 * 60 * 60 * 24));
};
