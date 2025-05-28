import MyAccount from '../components/MyAccount';
import PrivateRoute from '../components/PrivateRoute';

const MyAccountPage = () => {
  PrivateRoute();

  return <MyAccount />;
};

export default MyAccountPage;