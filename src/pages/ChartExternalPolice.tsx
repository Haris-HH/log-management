import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Components
import MainTitle from '../components/main-title/MainTitle';
import AgencyBarChart from '../components/charts/AgencyBarChart';
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";

// Hooks
import usePageTitle from '../hooks/usePageTitle';

// Types
import type { UsageChartResponse } from "../types/response";

// API
import { getUsageExternalPoliceChart } from "../features/usage-chart/api/UsageChartApi";

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  month_year: Date | null;
}

const ChartExternalPolice = () => {

  // State
  const [monthRange, setMonthRange] = useState<1 | 3>(1);
  
  // i18n
  const { t } = useTranslation();

  // Data
  const [data, setData] = useState<UsageChartResponse | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState<FormData>({
    month_year: dayjs().toDate(),
  });
  
  usePageTitle(t("pages.chart-external-police"));

  useEffect(() => {
    if (!formData.month_year) return;

    fetchData(dayjs(formData.month_year).format("YYYY-MM-DD"), monthRange);
  }, [formData.month_year, monthRange]);

  const fetchData = useCallback(
    async (monthYear: string, range: 1 | 3) => {
      const res = await getUsageExternalPoliceChart(monthYear, range);
      setData(res);
      setTimeout(() => {
      }, 500)
    },
    []
  );

  const handleStateChange = (value: 1 | 3) => {
    setMonthRange(value);
  };

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
  };

  return (
    <section id='chart-external-police' className="flex flex-col h-full w-full p-2">
      {/* Main Title */}
      <MainTitle title={t("pages.chart-external-police")} />
      <div className='p-2 bg-(--main-bg-color)/80 flex-1 min-h-0 w-full rounded-lg border border-(--primary-color) overflow-hidden'>
        {/* Chart */}
        <Box 
          className="w-full h-full p-4 flex flex-col gap-4"
          sx={{
            boxShadow: "-2px 3px 2px rgba(var(--secondary-color-rgb),0.1)"
          }}
        >
          <Box className='flex gap-2'>
            <Box className='flex flex-col gap-2 w-75'>
              <DatePickerBuddhist
                value={formData.month_year}
                sx={{
                  marginTop: "5px",
                  borderRadius: "5px",
                  backgroundColor: "white",
                  "& .MuiTextField-root": {
                    height: "fit-content",
                  },
                  "& .MuiOutlinedInput-input": {
                    fontSize: 14,
                  },
                }}
                className="w-full"
                id="month-year"
                onChange={(value) =>
                  handleDateTimeChange("month_year", value)
                }

                label={t('component.main-month')}
                labelFontSize="14px"
                views={["year", "month"]}
                openTo="month"
                format='MMMM YYYY'
                maxDate={dayjs()}
              />
            </Box>
            <Box className='flex gap-3 items-end'>
              <Button
                variant="contained"
                sx={{
                  width: t('button.1-month-width'),
                  height: 40,
                  backgroundColor: monthRange === 1 ? "var(--primary-color)" : "var(--secondary-color)",
                  color: monthRange === 1 ? "var(--secondary-color)" : "var(--primary-color)",
                  border: monthRange === 1 ? "none" : "1px solid var(--primary-color)",
                  "&:hover": {
                    backgroundColor: monthRange === 1 ? "var(--primary-color)" : "var(--range-button-color-hover)",
                  },
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
                onClick={() => handleStateChange(1)}
              >
                {t('button.1-month')}
              </Button>
              <Button
                variant="contained"
                sx={{
                  width: t('button.3-month-width'),
                  height: 40,
                  backgroundColor: monthRange === 3 ? "var(--primary-color)" : "var(--secondary-color)",
                  color: monthRange === 3 ? "var(--secondary-color)" : "var(--primary-color)",
                  border: monthRange === 3 ? "none" : "1px solid var(--primary-color)",
                  "&:hover": {
                    backgroundColor: monthRange === 3 ? "var(--primary-color)" : "var(--range-button-color-hover)",
                  },
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
                onClick={() => handleStateChange(3)}
              >
                {t('button.3-month')}
              </Button>
            </Box>
          </Box>
          {
            data && (
              <AgencyBarChart
                data={data?.data ?? []}
                columns={data?.columns ?? []}
                selectedMonthYear={dayjs(formData.month_year).format("YYYY-MM-DD")}
              />
            )
          }
        </Box>
      </div>
    </section>
  )
}

export default ChartExternalPolice;