export interface OverallPieChart {
  name: string;
  label: string;
  value: number;
  percent_value: number;
  fill: string;
}

export interface OverallLineChart {
  date: string;
  maintenance: number;
  offline: number;
  online: number;
  others: number;
  suspended: number;
  total: number;
}