import { Card } from '@/common/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ActivityChartProps {
  tripsToday: number;
}

export const ActivityChart = ({ tripsToday }: ActivityChartProps) => {
  const chartData = [
    { time: '06:00', trips: Math.round(tripsToday * 0.05) },
    { time: '08:00', trips: Math.round(tripsToday * 0.2) },
    { time: '10:00', trips: Math.round(tripsToday * 0.15) },
    { time: '12:00', trips: Math.round(tripsToday * 0.1) },
    { time: '14:00', trips: Math.round(tripsToday * 0.15) },
    { time: '16:00', trips: Math.round(tripsToday * 0.25) },
    { time: '18:00', trips: Math.round(tripsToday * 0.1) },
  ];

  return (
    <Card className="lg:col-span-2 p-6 border-none shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-lg">Flujo de Viajes</h3>
          <p className="text-sm text-muted-foreground">
            {tripsToday > 0
              ? `${tripsToday} viaje${tripsToday !== 1 ? 's' : ''} programado${tripsToday !== 1 ? 's' : ''} hoy`
              : 'Volumen de salidas por hora'}
          </p>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="trips"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTrips)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
