import { MyKpis } from '../components/dashboard/MyKpis';
import { DelegatedKpis } from '../components/dashboard/DelegatedKpis';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">Your task overview and progress</p>
      </div>
      <MyKpis />
      <div>
        <h2 className="text-xl font-bold mt-8 mb-4">Delegated Tasks</h2>
        <p className="text-muted-foreground mb-4">Tasks you assigned to others</p>
        <DelegatedKpis />
      </div>
    </div>
  );
}
