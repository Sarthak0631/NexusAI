interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xl">
          {icon}
        </div>

      </div>

    </div>
  );
}