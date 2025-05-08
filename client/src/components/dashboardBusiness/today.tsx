"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
  DollarSignIcon,
  RefreshCcwIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface DashboardMetrics {
  visitors: {
    total: number;
    change: number;
  };
  revenue: {
    total: number;
    change: number;
  };
  conversion: {
    rate: number;
    change: number;
  };
  activeSessions: number;
  userName: string;
}

export default function Today() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    visitors: { total: 0, change: 0 },
    revenue: { total: 0, change: 0 },
    conversion: { rate: 0, change: 0 },
    activeSessions: 0,
    userName: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = Cookies.get("userId");
      const token = Cookies.get("token");
      
      if (!userId || !token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(`/api/business/dashboard/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMetrics(response.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderMetricChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <p className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "+" : ""}{change}% so với hôm qua
      </p>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan hôm nay</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircleIcon className="h-5 w-5 mr-2" />
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="ml-auto bg-white p-1 rounded-full hover:bg-red-100"
            aria-label="Thử lại"
          >
            <RefreshCcwIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng lượt truy cập
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{metrics.visitors.total}</div>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              renderMetricChange(metrics.visitors.change)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(metrics.revenue.total)}</div>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              renderMetricChange(metrics.revenue.change)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ chuyển đổi
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{metrics.conversion.rate}%</div>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              renderMetricChange(metrics.conversion.change)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Phiên hoạt động
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{metrics.activeSessions}</div>
            )}
            <p className="text-xs text-muted-foreground">Đang trực tuyến</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-xl font-semibold">
          {isLoading ? (
            <Skeleton className="h-7 w-60" />
          ) : (
            `Xin chào, ${metrics.userName || "Người dùng"}`
          )}
        </h3>
        {isLoading ? (
          <Skeleton className="h-4 w-full mb-2" />
        ) : (
          <p className="text-muted-foreground">
            Đây là tổng quan kinh doanh của bạn hôm nay. Kiểm tra các chỉ số và lập kế hoạch 
            cho ngày của bạn.
          </p>
        )}
      </div>
    </div>
  );
}