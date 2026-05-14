export interface OverallPieChart {
  name: string;
  label: string;
  value: number;
  percent_value: number;
  fill: string;
}

export interface OverallLineChart {
  date: string;
  normal: number;
  device: number;
  network: number;
  disable: number;
}