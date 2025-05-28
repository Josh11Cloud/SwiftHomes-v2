import MyProperties from '../components/MyProperties';
import PrivateRoute from '../components/PrivateRoute';

export default function MyPropertiesPage() {
  return (
    <PrivateRoute>
      <MyProperties />
    </PrivateRoute>
  );
}
