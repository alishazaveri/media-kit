"use client";

import { useState } from "react";
import useSWR from "swr";
import { ChartUI, type ChartGranularity } from "@/components/admin/ChartUI";

const METRICS = [
  { key: "active",    label: "Active",    chartType: "line" as const },
  { key: "new",       label: "New",       chartType: "bar"  as const },
  { key: "cancelled", label: "Cancelled", chartType: "bar"  as const },
];

const SERIES = [
  { key: "INR", label: "INR", color: "#ff7350" },
  { key: "USD", label: "USD", color: "#3b82f6" },
];

export function SubscriptionChart() {
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [metric, setMetric] = useState("active");

  const url =
    granularity === "monthly"
      ? "/api/admin/metrics/subscriptions?granularity=monthly&months=12"
      : "/api/admin/metrics/subscriptions?granularity=daily&days=30";

  const { data, isLoading } = useSWR<{ data: Record<string, unknown>[] }>(url);

  return (
    <ChartUI
      title="Subscriptions"
      data={data?.data ?? null}
      loading={isLoading}
      metrics={METRICS}
      series={SERIES}
      accessor={(point, metricKey, seriesKey) => {
        const subs = point.subscriptions as Record<string, number> | undefined;
        return subs?.[`${metricKey}${seriesKey}`] ?? 0;
      }}
      dateAccessor={(point) => point.date as string}
      metric={metric}
      onMetricChange={setMetric}
      granularity={granularity}
      onGranularityChange={setGranularity}
      emptyText="No data yet — runs daily at 3 am IST"
    />
  );
}
