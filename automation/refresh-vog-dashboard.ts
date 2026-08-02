type DashboardRow = (string | number | boolean)[];

function main(
  workbook: ExcelScript.Workbook,
  casesJson: string,
  activitiesJson: string,
  correctiveActionsJson: string,
  storesJson: string
): { cases: number; activities: number; correctiveActions: number; stores: number; refreshedAt: string } {
  const datasets: Array<{ table: string; json: string }> = [
    { table: "CasesData", json: casesJson },
    { table: "ActivitiesData", json: activitiesJson },
    { table: "CorrectiveActionsData", json: correctiveActionsJson },
    { table: "StoresData", json: storesJson },
  ];

  const counts: Record<string, number> = {};

  for (const dataset of datasets) {
    const table = workbook.getTable(dataset.table);
    if (!table) throw new Error("Missing workbook table: " + dataset.table);

    const parsed = JSON.parse(dataset.json) as DashboardRow[];
    const columnCount = table.getHeaderRowRange().getColumnCount();
    for (const [index, row] of parsed.entries()) {
      if (!Array.isArray(row) || row.length !== columnCount) {
        throw new Error(dataset.table + " row " + (index + 1) + " has " + row.length + " values; expected " + columnCount);
      }
    }

    const currentRows = table.getRowCount();
    if (currentRows > 0) table.deleteRowsAt(0, currentRows);
    if (parsed.length > 0) table.addRows(-1, parsed);
    counts[dataset.table] = parsed.length;
  }

  workbook.getApplication().calculate(ExcelScript.CalculationType.full);

  return {
    cases: counts.CasesData,
    activities: counts.ActivitiesData,
    correctiveActions: counts.CorrectiveActionsData,
    stores: counts.StoresData,
    refreshedAt: new Date().toISOString(),
  };
}
