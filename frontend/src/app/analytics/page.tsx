import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Analytics
        </h1>

        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          AI usage and analytics will be built here.
        </p>
      </div>
    </DashboardLayout>
  );
}