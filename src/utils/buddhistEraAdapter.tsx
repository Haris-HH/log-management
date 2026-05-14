import "dayjs/locale/th";
import Dayjs, { Dayjs as DayjsType } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

Dayjs.locale("th");

export default class buddhistEraAdapter extends AdapterDayjs {
  constructor({ locale, formats }: any) {
    super({ locale, formats });
  }

  formatByString = (date: DayjsType, format: string): string => {
    const d = Dayjs(date);
    const buddhistYear = d.year() + 543;
    return d.format(format.replace("YYYY", String(buddhistYear)));
  };
}