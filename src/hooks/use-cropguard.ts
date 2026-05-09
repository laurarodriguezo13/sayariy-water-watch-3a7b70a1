import { useQuery } from "@tanstack/react-query";
import {
  fetchAlerts,
  fetchCommunities,
  fetchCrops,
  fetchEnso,
  fetchForecast,
  fetchIrrigation,
  fetchStatus,
  fetchTimeseries,
  fetchWell,
} from "@/lib/cropguard-api";

const STALE_10MIN = 10 * 60 * 1000;
const STALE_30MIN = 30 * 60 * 1000;

export const useCommunities = () =>
  useQuery({ queryKey: ["communities"], queryFn: fetchCommunities, staleTime: STALE_10MIN });

export const useTimeseries = (id: string) =>
  useQuery({ queryKey: ["timeseries", id], queryFn: () => fetchTimeseries(id), staleTime: STALE_30MIN });

export const useWell = () =>
  useQuery({ queryKey: ["well"], queryFn: fetchWell, staleTime: STALE_10MIN });

export const useForecast = () =>
  useQuery({ queryKey: ["forecast"], queryFn: fetchForecast, staleTime: STALE_10MIN });

export const useEnso = () =>
  useQuery({ queryKey: ["enso"], queryFn: fetchEnso, staleTime: STALE_30MIN });

export const useIrrigation = () =>
  useQuery({ queryKey: ["irrigation"], queryFn: fetchIrrigation, staleTime: STALE_10MIN });

export const useCrops = () =>
  useQuery({ queryKey: ["crops"], queryFn: fetchCrops, staleTime: STALE_30MIN });

export const useAlerts = () =>
  useQuery({ queryKey: ["alerts"], queryFn: fetchAlerts, staleTime: STALE_10MIN });

export const useStatus = () =>
  useQuery({ queryKey: ["status"], queryFn: fetchStatus, staleTime: STALE_10MIN });
