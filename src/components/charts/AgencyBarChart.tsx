import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Types
import type { AgencyChartDataGroup, AgencyColumn } from "../../types/common";

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra);

interface Props {
  data: AgencyChartDataGroup[];
  columns: AgencyColumn[];
  selectedMonthYear: string;
}

const MAX_BAR = 3;

const AgencyBarChart = ({ data, columns, selectedMonthYear }: Props) => {
  // i18n
  const { t, i18n } = useTranslation();

  // Group by agency name
  const agencyMap: Record<string, any> = {};

  data.forEach((group) => {
    const monthKey = `month_${group.month}`;

    group.data.forEach((item) => {
      if (!agencyMap[item.key]) {
        agencyMap[item.key] = {
          key: item.key,
        };
      }

      agencyMap[item.key][monthKey] = item.value;
    });
  });

  const chartData = Object.values(agencyMap);

  // Limit to max 3 months
  const months = data
    .map((d) => d.month)
    .slice(0, MAX_BAR)
    .sort((a, b) => Number(a) - Number(b));

  // Color by month
  const getColor = (index: number) => {
    const total = months.length;

    if (total === 1) {
      return "var(--primary-color)";
    }

    if (total === 2) {
      const isNewest = index === total - 1;
      return isNewest ? "var(--primary-color)" : "rgba(var(--primary-color-rgb), 0.6)";
    }

    const COLORS = [
      "rgba(var(--primary-color-rgb), 0.2)", // oldest
      "rgba(var(--primary-color-rgb), 0.65)",
      "var(--primary-color)", // newest
    ];

    return COLORS[index] ?? "var(--primary-color)";
  };

  const checkSameMonthYear = (a: string, b: string) => {
    const dateA = dayjs(a);
    const dateB = dayjs(b);
    return (
      dateA.year() === dateB.year() && dateA.month() === dateB.month()
    );
  };

  const monthIndexMap = months.reduce((acc, m, i) => {
    acc[m] = i;
    return acc;
  }, {} as Record<number, number>);

  const gridCols = `145px repeat(${columns.length}, 1fr)`;

  return (
    <div className="w-full">
      <div className="min-w-200">
        {/* Chart */}
        <ResponsiveContainer width="100%" maxHeight={1520} height={350}>
          <BarChart 
            data={chartData} 
            margin={{ left: 85 }} 
            barCategoryGap="10%"
            barGap={4}
          >
            <CartesianGrid stroke="var(--primary-color)" horizontal vertical={false} />
            <CartesianGrid stroke="var(--primary-color)" vertical horizontal={false} />

            {/* X = Agency */}
            <XAxis dataKey="key" hide />

            <YAxis
              domain={[0, "auto"]}
              tickCount={10}
              tick={{ fill: "var(--primary-color)" }}
              strokeWidth={0}
            />

            {/* Bars = months */}
            {months
              .map((month, index) => (
                <Bar
                  key={month}
                  dataKey={`month_${month}`}
                  fill={getColor(index)}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="w-full border border-[rgba(var(--tertiary-color-rgb),0.2)] overflow-hidden">

            {/* Header */}
            <div
              className="grid text-sm border-b border-[rgba(var(--tertiary-color-rgb),0.2)] bg-(--primary-color) text-(--tertiary-color)"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="p-2 text-center border-r border-[rgba(var(--tertiary-color-rgb),0.2)]">
                {t("text.month")}
              </div>

              {columns.map((item, idx) => (
                <div
                  key={item.key}
                  className={`p-2 min-w-[0.5vw] text-center whitespace-normal wrap-break-word ${
                    idx !== columns.length - 1 ? "border-r border-[rgba(var(--tertiary-color-rgb),0.2)]" : ""
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {data.sort((a, b) => Number(b.month) - Number(a.month)).map((group) => {
              const isSameMonthYear = checkSameMonthYear(group.month_year, selectedMonthYear)

              return (
                <div
                  key={group.month}
                  className="grid text-sm border-b border-[rgba(var(--tertiary-color-rgb),0.2)]"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {/* Month */}
                  <div 
                    className="flex items-center min-w-36 gap-2 px-2 border-r border-[rgba(var(--tertiary-color-rgb),0.2)]"
                    style={{
                      backgroundColor: isSameMonthYear ? "var(--current-date-highlight-bg-color)" : "",
                      color: "var(--primary-color)",
                      fontWeight: isSameMonthYear ? "700" : "400",
                    }}
                  >
                    <div
                      className="w-4 h-4 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: getColor(monthIndexMap[group.month] ?? 0),
                      }}
                    />
                    <div>
                      {dayjs(group.month_year)
                        .format(i18n.language === "th" ? "MMMM BBBB" : "MMMM YYYY")}
                    </div>
                  </div>

                  {/* Values */}
                  {group.data.map((item, idx) => (
                    <div
                      key={item.key}
                      className={`p-2 min-w-[0.5vw] text-center whitespace-normal wrap-break-word ${
                        idx !== group.data.length - 1
                          ? "border-r border-[rgba(var(--tertiary-color-rgb),0.2)]"
                          : ""
                      }`}
                      style={{
                        backgroundColor: isSameMonthYear
                          ? "var(--current-date-highlight-bg-color)"
                          : "",
                        color: "var(--primary-color)",
                        fontWeight: isSameMonthYear ? "700" : "500",
                      }}
                    >
                      {item.value.toLocaleString()}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyBarChart;