import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Graphic({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="visitas" stroke="#0077b6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}