import { useState, useCallback } from "react";

export interface ExportProgress {
  text: string;
  current: number;
  total: number;
  percent: number;
}

const initialExportProgress: ExportProgress = {
  text: "",
  current: 0,
  total: 0,
  percent: 0,
};

const useExportProgress = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] =
    useState<ExportProgress>(initialExportProgress);

  const startExportLoading = useCallback(() => {
    setExportLoading(true);
  }, []);

  const stopExportLoading = useCallback(() => {
    setExportLoading(false);
    setExportProgress(initialExportProgress);
  }, []);

  const updateExportProgress = useCallback(
    (text: string, current: number, total: number, percent: number) => {
      setExportProgress({
        text,
        current,
        total,
        percent,
      });
    },
    []
  );

  return {
    exportLoading,
    exportProgress,
    startExportLoading,
    stopExportLoading,
    updateExportProgress,
  };
};

export default useExportProgress;