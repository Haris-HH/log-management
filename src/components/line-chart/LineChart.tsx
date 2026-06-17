import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import dayjs from 'dayjs';

// Material UI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Types
import type { Series } from "../../types/common";

// Hooks
import { useStatusOptions } from '../../hooks/useStatusOptions';

// i18n
import { useTranslation } from 'react-i18next';

type Props = {
  data: Series[];
  isMonth?: boolean;
}

const LineChartComponent = ({ data, isMonth = false }: Props) => {
  // i18n
  const { t, i18n } = useTranslation();

  const statusOptions = useStatusOptions();
  const filterStatusOptions = statusOptions.filter((so) => so.key !== "suspended");

  const STATUS_MAP = Object.fromEntries(
    statusOptions.filter((so) => so.key !== "suspended").map(item => [item.key, item])
  );

  const hasData = data.length > 0;

  const CustomLegend = () => {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        paddingTop: "12px",
        fontSize: "16px",
      }}>
        {filterStatusOptions.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
            <span style={{ color: "var(--primary-color)" }}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        style={{
          background: "rgba(var(--tertiary-color-rgb), 0.8)",
          border: "1px solid var(--primary-color)",
          borderRadius: "8px",
          padding: "10px 12px",
          minWidth: "180px",
        }}
      >
        {/* Date */}
        <div
          style={{
            fontSize: "13px",
            marginBottom: "8px",
            fontWeight: 600,
            color: "var(--primary-color)",
          }}
        >
          {dayjs(label).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "dddd D MMMM BBBB" : "ddd D MMMM YYYY")}
        </div>

        {/* Data */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {payload.map((item: any) => {
            const config = STATUS_MAP[item.dataKey];

            return (
              <div
                key={item.dataKey}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: config?.color,
                    }}
                  />
                  <span style={{ color: "var(--primary-color)" }}>{config?.name}</span>
                </div>

                <span style={{ fontWeight: 700, color: "var(--primary-color)" }}>
                  {item.value?.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Box className="flex justify-center items-center">
      {
        hasData ? (
          <LineChart
            style={{ width: '100%', maxWidth: '850px', height: '100%', maxHeight: '80vh', aspectRatio: 1.618 }}
            responsive
            data={data}
            margin={{
              top: 5,
              right: 50,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid stroke="rgba(var(--primary-color-rgb), 0.5)" horizontal vertical/>
            <XAxis 
              dataKey="date" 
              stroke="var(--primary-color)" 
              strokeWidth={0}
              tick={{
                fontSize: 14,
              }}
              interval={0}
              tickFormatter={(value) => isMonth ? dayjs(value).locale(i18n.language === "th" ? "th" : "en").format("D") : dayjs(value).locale(i18n.language === "th" ? "th" : "en").format(i18n.language === "th" ? "ddDD/MM/BB" : "ddDD/MM/YY")}
            />
            <YAxis 
              width="auto" 
              stroke="var(--primary-color)" 
              strokeWidth={0} 
              tick={{
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-border-2)" }}
              content={<CustomTooltip />}
            />
            <Legend content={<CustomLegend />} />
            {filterStatusOptions.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                dot={{ fill: item.color }}
                activeDot={{ r: 8, stroke: item.color }}
              />
            ))}
          </LineChart>
        ) : (
          <Box
            className="flex flex-col gap-4 items-center justify-center"
            sx={{
              width: "100%",
              minHeight: "43vh",
              border: "1px dashed var(--primary-color)",
              borderRadius: "8px",
              backgroundColor: "rgba(var(--secondary-color-rgb), 0.03)",
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 500,
                color: "var(--primary-color)",
              }}
            >
              {t("text.data-not-found")}
            </Typography>
          </Box>
        )
      }
    </Box>
  )
}

export default LineChartComponent;