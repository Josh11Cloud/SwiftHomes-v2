import MyAccount from '../components/MyAccount';

export default function MyAccountPage() {
  return (
    <PrivateRoute>
      <MyAccount />
    </PrivateRoute>
  );
}