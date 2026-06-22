import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export function KpiCard({ title, value, icon: Icon, color }: KpiCardProps) {
  return (
    <div className="group p-5 border rounded-xl bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1.5 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
