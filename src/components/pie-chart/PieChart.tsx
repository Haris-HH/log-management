import { Pie, PieChart, Label } from "recharts";

// Material UI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Types
import type { OverallPieChart } from "../../types/chart";

// i18n
import { useTranslation } from "react-i18next";

type Props = {
  data: OverallPieChart[];
};

const PieChartComponent = ({ data }: Props) => {
  const { t } = useTranslation();

  const total = data.reduce((sum, item) => sum + Number(item.value ?? 0), 0);
  const hasData = data.length > 0 && total > 0;

  const formatPercent = (value: unknown) => {
    const percent = Number(value);
    return Number.isFinite(percent) ? percent.toFixed(1) : "0.0";
  };

  return (
    <Box className="flex flex-col gap-4 items-center justify-center">
      {
        hasData ? (
          <PieChart
            style={{
              width: "100%",
              maxWidth: "500px",
              maxHeight: "43vh",
              aspectRatio: 1,
              pointerEvents: "none",
            }}
          >
            <Pie
              data={data}
              innerRadius="60%"
              outerRadius="100%"
              cornerRadius={10}
              paddingAngle={1}
              dataKey="value"
              isAnimationActive
              startAngle={-270}
              endAngle={-630}
            >
              <Label
                position="center"
                content={({ viewBox }: any) => {
                  const cx = viewBox?.cx ?? 200;
                  const cy = viewBox?.cy ?? 200;

                  return (
                    <g>
                      <text
                        x={cx + 50}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: 52,
                          fontWeight: 600,
                          fill: "var(--theme-accent)",
                        }}
                      >
                        {total.toLocaleString()}
                      </text>

                      <line
                        x1={cx - 20}
                        x2={cx + 120}
                        y1={cy + 30}
                        y2={cy + 30}
                        stroke="rgba(var(--theme-accent-soft-rgb),0.5)"
                        strokeWidth={1}
                      />

                      <circle
                        cx={cx - 10}
                        cy={cy + 50}
                        r={5}
                        fill="var(--status-all)"
                      />

                      <text
                        x={cx + 55}
                        y={cy + 50}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: 18,
                          fill: "rgba(var(--theme-accent-rgb),0.8)",
                        }}
                      >
                        {t("text.all-checkpoint")}
                      </text>
                    </g>
                  );
                }}
              />
            </Pie>
          </PieChart>
        ) : (
          <Box
            className="flex flex-col gap-4 items-center justify-center"
            sx={{
              width: "100%",
              minHeight: "43vh",
              border: "1px dashed var(--theme-accent)",
              borderRadius: "8px",
              backgroundColor: "rgba(var(--theme-accent-soft-rgb),0.03)",
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 500,
                color: "var(--theme-accent)",
              }}
            >
              {t("text.data-not-found")}
            </Typography>
          </Box>
        )
      }

      <Box
        className="border border-(--theme-accent) w-full overflow-hidden rounded-sm"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {data.map((item, index) => (
          <Box
            key={`${item.name}-${index}`}
            className="flex flex-col items-center justify-center gap-2"
            sx={{
              py: 1.5,
              borderLeft: {
                xs: "none",
                xl: index === 0 ? "none" : "1px solid var(--theme-accent)",
              },
              borderTop: {
                xs: index === 0 ? "none" : "1px solid var(--theme-accent)",
                xl: "none",
              },
            }}
          >
            <Box className="flex flex-col items-center justify-center">
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 34, xl: 38 },
                  fontWeight: 500,
                  color: "var(--theme-accent)",
                }}
                variant="subtitle1"
              >
                {Number(item.value ?? 0).toLocaleString()}
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  mt: { xs: -1.8, xl: -2.6 },
                  color: "var(--theme-accent-soft)",
                }}
                variant="subtitle1"
              >
                ({formatPercent(item.percent_value)}%)
              </Typography>
            </Box>

            <Box className="flex items-center justify-center gap-1 -mt-2">
              <Box
                className="w-3 h-3"
                sx={{
                  borderRadius: "50%",
                  backgroundColor: item.fill,
                }}
              />

              <Typography
                sx={{
                  fontSize: { xs: 14, xl: 16 },
                  fontWeight: 400,
                  color: "var(--theme-accent)",
                }}
                variant="subtitle1"
              >
                {item.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PieChartComponent;