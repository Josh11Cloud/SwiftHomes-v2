import MyAccount from '../components/MyAccount';
import PrivateRoute from '../components/PrivateRoute';

const MyAccountPage = () => {
  return (
    <PrivateRoute>
      <MyAccount />
    </PrivateRoute>
  );
};

export default MyAccountPage;