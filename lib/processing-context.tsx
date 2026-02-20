"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { ProcessResult } from "@/lib/ffmpeg";
import ProcessingScreen from "@/components/ProcessingScreen";

// ─── Types ───────────────────────────────────────────────

interface ProcessingJob {
  toolPath: string;
  label: string;
  progress: number;
  status: "processing" | "done" | "error";
  startTime: number;
  originalFile: File;
  result?: ProcessResult;
  error?: string;
}

interface ProcessingContextValue {
  job: ProcessingJob | null;
  runJob: (config: {
    toolPath: string;
    label: string;
    originalFile: File;
    processFn: (onProgress: (p: number) => void) => Promise<ProcessResult>;
  }) => void;
  clearJob: () => void;
}

// ─── Context ─────────────────────────────────────────────

const ProcessingContext = createContext<ProcessingContextValue>({
  job: null,
  runJob: () => {},
  clearJob: () => {},
});

// ─── Provider ────────────────────────────────────────────

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const pathname = usePathname();

  const runJob = useCallback(
    (config: {
      toolPath: string;
      label: string;
      originalFile: File;
      processFn: (onProgress: (p: number) => void) => Promise<ProcessResult>;
    }) => {
      const newJob: ProcessingJob = {
        toolPath: config.toolPath,
        label: config.label,
        progress: 0,
        status: "processing",
        startTime: Date.now(),
        originalFile: config.originalFile,
      };

      setJob(newJob);

      const onProgress = (p: number) => {
        setJob((prev) =>
          prev && prev.status === "processing"
            ? { ...prev, progress: p }
            : prev
        );
      };

      config
        .processFn(onProgress)
        .then((result) => {
          setJob((prev) =>
            prev ? { ...prev, status: "done", result, progress: 100 } : null
          );
        })
        .catch((err) => {
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: "error",
                  error:
                    err instanceof Error
                      ? err.message
                      : "Processing failed. Try a different file.",
                }
              : null
          );
        });
    },
    []
  );

  const clearJob = useCallback(() => {
    setJob(null);
  }, []);

  // Determine if we should show the processing screen
  const isProcessing = job?.status === "processing";
  const onJobPage = pathname === job?.toolPath;

  return (
    <ProcessingContext.Provider value={{ job, runJob, clearJob }}>
      {children}
      {/* Show full ProcessingScreen when on the job's page, pip when navigated away */}
      {isProcessing && (
        <ProcessingScreen
          progress={job.progress}
          label={job.label}
          forceMinimized={!onJobPage}
        />
      )}
    </ProcessingContext.Provider>
  );
}

// ─── Hook for tool pages ─────────────────────────────────

export function useToolProcessing(toolPath: string) {
  const { job, runJob, clearJob } = useContext(ProcessingContext);
  const isMyJob = job?.toolPath === toolPath;

  return {
    processing: isMyJob ? job?.status === "processing" : false,
    progress: isMyJob ? job?.progress ?? 0 : 0,
    result:
      isMyJob && job?.status === "done" ? job?.result ?? null : null,
    error:
      isMyJob && job?.status === "error" ? job?.error ?? "" : "",
    jobFile: isMyJob ? job?.originalFile ?? null : null,
    startProcessing: (
      file: File,
      label: string,
      processFn: (
        onProgress: (p: number) => void
      ) => Promise<ProcessResult>
    ) => {
      runJob({ toolPath, label, originalFile: file, processFn });
    },
    clearResult: clearJob,
    hasActiveJob: job !== null && job.status === "processing",
  };
}
