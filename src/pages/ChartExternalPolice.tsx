import { useEffect, useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { useSelector } from 'react-redux';

// Store
import type { RootState } from "../store/store";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Components
import MainTitle from '../components/main-title/MainTitle';
import AgencyBarChart from '../components/charts/AgencyBarChart';
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import LoadingScreen from '../components/loading-screen/LoadingScreen';

// Hooks
import usePageTitle from '../hooks/usePageTitle';

// Types
import type { UsageChartResponse } from "../types/response";

// API
import { getUsagePoliceChart } from "../features/usage-chart/api/UsageChartApi";

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  month_year: Date | null;
}

const ChartExternalPolice = () => {

  // State
  const [monthRange, setMonthRange] = useState<1 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // i18n
  const { t, i18n } = useTranslation();

  // Data
  const [data, setData] = useState<UsageChartResponse | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState<FormData>({
    month_year: dayjs().toDate(),
  });

  // Slice
  const { org } = useSelector((state: RootState) => state.dropdown);
  
  usePageTitle(t("pages.chart-external-police"));

  useEffect(() => {
    if (!formData.month_year) return;

    fetchData();
  }, [formData.month_year, monthRange]);

  const chartColumns = useMemo(() => {
    return org
      .filter((item) => item.ou_code !== "00" && item.ou_code !== "05")
      .map((item) => ({
        key: item.org_code,
        label:
          i18n.language === "th"
            ? item.org_abbr_th || item.org_name_th || item.org_code
            : item.org_abbr_en || item.org_name_en || item.org_code,
      }));
  }, [org, i18n.language]);

  const getFilters = useCallback((): Record<string, string> => {
    const filters: Record<string, string> = {
      event_type: "login", 
      exclude_ou_code: "00,05",
    };

    if (formData.month_year) {
      filters.start_month = dayjs(formData.month_year).format("YYYY-MM");
    }

    if (monthRange) {
      filters.count_month = monthRange.toString();
    }

    return filters;
  }, [formData.month_year, monthRange]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await getUsagePoliceChart(getFilters());

      setData(res);
    } 
    catch (error) {
      setData({
        columns: [],
        data: [],
      });
    } 
    finally {
      setIsLoading(false);
    }
  }, [getFilters]);

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
      { isLoading && <LoadingScreen /> }
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
                columns={chartColumns}
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