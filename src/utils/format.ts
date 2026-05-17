export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('pt-BR');

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('pt-BR').format(n);

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
