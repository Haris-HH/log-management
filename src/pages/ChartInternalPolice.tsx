import { useEffect, useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
// import { useSelector } from 'react-redux';

// Store
// import type { RootState } from "../store/store";

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
import type { NsbOrg } from "../types/common";

// API
import { getUsagePoliceChart } from "../features/usage-chart/api/UsageChartApi";
import { getOrg } from "../features/dropdown/api/DropdownApi";

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  month_year: Date | null;
}

const ChartInternalPolice = () => {

  // State
  const [monthRange, setMonthRange] = useState<1 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // i18n
  const { t, i18n } = useTranslation();

  // Data
  const [data, setData] = useState<UsageChartResponse | null>(null);
  const [org, setOrg] = useState<NsbOrg[]>([]);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    month_year: dayjs().toDate(),
  });

  // Slice
  // const { bh } = useSelector((state: RootState) => state.dropdown);
  
  usePageTitle(t("pages.chart-internal-police"));

  useEffect(() => {
    if (!formData.month_year) return;

    fetchData();
  }, [formData.month_year, monthRange]);

  const fetchOrgList = useCallback(async (bkCodeList: string[]) => {
    try {
      const params: Record<string, string> = {
        limit: "100",
        filter: `org_code=${bkCodeList.join("|")}`
      };

      const res = await getOrg(params);
      setOrg(res.data ?? []);
    } catch (error) {
      setOrg([]);
    }
  }, []);

  const chartColumns = useMemo(() => {
    return org
      .filter((item) => item.ou_code === "00")
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
      ou_code: "00",
      event_type: "login",
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
      const orgList = [
        ...new Set(
          res.data.flatMap(item =>
            item.access.map(org => org.org_code)
          )
        ),
      ];
      await fetchOrgList(orgList);

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
    <section id='chart-internal-police' className="flex flex-col h-full w-full p-2">
      { isLoading && <LoadingScreen /> }
      {/* Main Title */}
      <MainTitle title={t("pages.chart-internal-police")} />
      <div className='p-2 bg-(--theme-bg-body) flex-1 min-h-0 w-full rounded-lg border border-(--theme-accent) overflow-hidden'>
        {/* Chart */}
        <Box 
          className="w-full h-full p-4 flex flex-col gap-4"
          sx={{
            boxShadow: "-2px 3px 2px rgba(var(--theme-accent-soft-rgb),0.1)"
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
                  backgroundColor: monthRange === 1 ? "var(--theme-accent)" : "var(--theme-border-input)",
                  color: monthRange === 1 ? "var(--theme-border-input)" : "var(--theme-accent)",
                  border: monthRange === 1 ? "none" : "1px solid var(--theme-accent)",
                  "&:hover": {
                    backgroundColor: monthRange === 1 ? "rgba(var(--theme-accent-rgb),0.5)" : "rgba(var(--theme-accent-rgb),0.2)",
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
                  backgroundColor: monthRange === 3 ? "var(--theme-accent)" : "var(--theme-border-input)",
                  color: monthRange === 3 ? "var(--theme-border-input)" : "var(--theme-accent)",
                  border: monthRange === 3 ? "none" : "1px solid var(--theme-accent)",
                  "&:hover": {
                    backgroundColor: monthRange === 3 ? "rgba(var(--theme-accent-rgb),0.5)" : "rgba(var(--theme-accent-rgb),0.2)",
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
          {data && (
            <AgencyBarChart
              data={data.data ?? []}
              columns={chartColumns}
              selectedMonthYear={dayjs(formData.month_year).format("YYYY-MM-DD")}
            />
          )}
        </Box>
      </div>
    </section>
  )
}

export default ChartInternalPolice;