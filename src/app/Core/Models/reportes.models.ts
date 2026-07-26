export interface ReportesKpiResultado {
  activeUsers: number;
  depositTotal: number;
  withdrawalTotal: number;
  netProfit: number;
}

export interface RepKpi {
  label: string;
  value: string;
  sub:   string;
  icon:  string;
}
