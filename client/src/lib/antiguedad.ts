export function calcularAntiguedad(fechaIngreso: string): string {
  if (!fechaIngreso) return "-";

  const [year, month, day] = fechaIngreso.split("-").map(Number);
  const inicio =
    year && month && day
      ? new Date(year, month - 1, day)
      : new Date(fechaIngreso);
  const hoy = new Date();

  let años = hoy.getFullYear() - inicio.getFullYear();
  let meses = hoy.getMonth() - inicio.getMonth();

  if (meses < 0) {
    años--;
    meses += 12;
  }

  const partes: string[] = [];
  if (años > 0) partes.push(`${años} ${años === 1 ? "año" : "años"}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);
  if (partes.length === 0) partes.push("menos de un mes");

  return partes.join(" y ");
}
