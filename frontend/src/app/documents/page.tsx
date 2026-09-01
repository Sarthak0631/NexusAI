import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Documents
        </h1>

        <p className="mt-2 text-gray-500">
          Document management will be built here.
        </p>
      </div>
    </DashboardLayout>
  );
}