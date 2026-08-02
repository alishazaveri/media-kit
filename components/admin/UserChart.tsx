"use client";

import { useState } from "react";
import useSWR from "swr";
import { ChartUI, type ChartGranularity } from "@/components/admin/ChartUI";

const METRICS = [
  { key: "total", label: "Total", chartType: "line" as const },
  { key: "new",   label: "New",   chartType: "bar"  as const },
];

const SERIES = [
  { key: "", label: "Users", color: "#ff7350" },
];

export function UserChart() {
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [metric, setMetric] = useState("total");

  const url =
    granularity === "monthly"
      ? "/api/admin/metrics/users?granularity=monthly&months=12"
      : "/api/admin/metrics/users?granularity=daily&days=30";

  const { data, isLoading } = useSWR<{ data: Record<string, unknown>[] }>(url);

  return (
    <ChartUI
      title="Users"
      data={data?.data ?? null}
      loading={isLoading}
      metrics={METRICS}
      series={SERIES}
      accessor={(point, metricKey) => (point[metricKey] as number) ?? 0}
      dateAccessor={(point) => point.date as string}
      metric={metric}
      onMetricChange={setMetric}
      granularity={granularity}
      onGranularityChange={setGranularity}
    />
  );
}
