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
  const agencyMap: Record<string, Record<string, string | number>> = {};

  const normalizedData: AgencyChartDataGroup[] = data.map((group) => {
    const accessMap = new Map(
      group.access.map((item) => [item.org_code, item.count])
    );

    return {
      ...group,
      access: columns
        .filter((column) =>
          group.access.some((item) => item.org_code === column.key)
        )
        .map((column) => ({
          org_code: column.key,
          count: accessMap.get(column.key) ?? 0,
        })),
    };
  });

  normalizedData.forEach((group) => {
    const monthKey = `month_${group.month}`;

    group.access.forEach((item) => {
      if (!agencyMap[item.org_code]) {
        agencyMap[item.org_code] = {
          key: item.org_code,
        };
      }

      agencyMap[item.org_code][monthKey] = item.count;
    });
  });

  const chartData = Object.values(agencyMap);

  // Limit to max 3 months
  const months = normalizedData
    .map((d) => d.month)
    .slice(0, MAX_BAR)
    .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());

  // Color by month
  const getColor = (index: number) => {
    const total = months.length;

    if (total === 1) {
      return "var(--theme-accent)";
    }

    if (total === 2) {
      const isNewest = index === total - 1;
      return isNewest ? "var(--theme-accent)" : "rgba(var(--theme-accent-rgb),0.6)";
    }

    const COLORS = [
      "rgba(var(--theme-accent-rgb),0.2)", // oldest
      "rgba(var(--theme-accent-rgb),0.65)",
      "var(--theme-accent)", // newest
    ];

    return COLORS[index] ?? "var(--theme-accent)";
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
  }, {} as Record<string, number>);

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
            style={{ pointerEvents: "none" }}
          >
            <CartesianGrid stroke="var(--theme-accent)" horizontal vertical={false} />
            <CartesianGrid stroke="var(--theme-accent)" vertical horizontal={false} />

            {/* X = Agency */}
            <XAxis dataKey="key" hide />

            <YAxis
              domain={[0, "auto"]}
              tickCount={10}
              tick={{ fill: "var(--theme-accent)" }}
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
          <div className="w-full border border-[rgba(var(--theme-accent-soft-rgb),0.5)] overflow-hidden">

            {/* Header */}
            <div
              className="grid text-sm border-b border-[rgba(var(--theme-accent-soft-rgb),0.5)] bg-(--theme-accent) text-(--theme-border-input)"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="p-2 text-center border-r border-[rgba(var(--theme-accent-soft-rgb),0.5)]">
                {t("text.month")}
              </div>

              {columns.map((item, idx) => (
                <div
                  key={item.key}
                  className={`p-2 min-w-[0.5vw] text-center whitespace-normal wrap-break-word ${
                    idx !== columns.length - 1 ? "border-r border-[rgba(var(--theme-accent-soft-rgb),0.5)]" : ""
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {[...normalizedData]
              .sort((a, b) => dayjs(b.month).valueOf() - dayjs(a.month).valueOf())
              .map((group) => {
                const isSameMonthYear = checkSameMonthYear(group.month, selectedMonthYear);

                return (
                  <div
                    key={group.month}
                    className="grid text-sm border-b border-[rgba(var(--theme-accent-soft-rgb),0.5)]"
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    <div
                      className="flex items-center min-w-36 gap-2 px-2 border-r border-[rgba(var(--theme-accent-soft-rgb),0.5)]"
                      style={{
                        backgroundColor: isSameMonthYear
                          ? "white"
                          : "",
                        color: "var(--theme-accent)",
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
                        {dayjs(group.month).format(
                          i18n.language === "th" ? "MMMM BBBB" : "MMMM YYYY"
                        )}
                      </div>
                    </div>

                    {columns.map((column, idx) => {
                      const accessItem = group.access.find(
                        (item) => item.org_code === column.key
                      );

                      return (
                        <div
                          key={column.key}
                          className={`p-2 min-w-[0.5vw] text-center whitespace-normal wrap-break-word ${
                            idx !== columns.length - 1
                              ? "border-r border-[rgba(var(--theme-accent-soft-rgb),0.5)]"
                              : ""
                          }`}
                          style={{
                            backgroundColor: isSameMonthYear
                              ? "white"
                              : "",
                            color: "var(--theme-accent)",
                            fontWeight: isSameMonthYear ? "700" : "500",
                          }}
                        >
                          {(accessItem?.count ?? 0).toLocaleString()}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            {
              [...normalizedData].length === 0 && (
                <div className="flex justify-center items-center w-full text-(--theme-accent-soft) text-sm py-2">
                  {t('text.no-data')}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyBarChart;