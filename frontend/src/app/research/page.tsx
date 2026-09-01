import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ResearchPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Research
        </h1>

        <p className="mt-2 text-gray-500">
          Intelligent research workflows will be built here.
        </p>
      </div>
    </DashboardLayout>
  );
}