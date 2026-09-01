import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Analytics
        </h1>

        <p className="mt-2 text-gray-500">
          AI usage and analytics will be built here.
        </p>
      </div>
    </DashboardLayout>
  );
}