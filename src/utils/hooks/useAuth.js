import {
  setUser,
  signInSuccess,
  signOutSuccess,
  useAppSelector,
  useAppDispatch,
} from '@/store';
import appConfig from '@/configs/app.config';
import { REDIRECT_URL_KEY } from '@/constants/app.constant';
import { useNavigate } from 'react-router-dom';
import useQuery from './useQuery';
import { authenticationUserLogin } from '../../api/authentication/AuthenticationService';
import { toast } from '../../components/ui';
// import { apiSignIn, apiSignUp, apiSignOut } from '@/services/AuthService' // reativar se desejar usar

function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const query = useQuery();

  const { token, signedIn } = useAppSelector((state) => state.auth.session);

  const signIn = async (email, password) => {
    try {
      const resp = await authenticationUserLogin(
        {
          username: email,
          password: password,
          companyPublicId: "264f432b-f7b3-4066-9e2a-66c641915320",
          companyTypeId: 1,
          employeePublicId: "c781986c-916f-4bd1-bfd6-68bfae783ed1",
          culture: 'pt-BR'
        }
      );
      debugger;
      if (resp?.data) {
        const { token } = resp.data;
        dispatch(signInSuccess(token));

        var decoded = JSON.parse(atob(resp.data.token.split('.')[1]))
        
        dispatch(setUser(resp.data.user || {
          avatar: '',
          userName: decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
          authenticationId: decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
          authority: ['USER'],
          email: '',
          employeePublicId: decoded?.employeePublicId,
          companyTypeId: decoded?.companyTypeId,
          companyPublicId: decoded?.companyPublicId
        }));

        const redirectUrl = query.get(REDIRECT_URL_KEY);
        navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath);
        return { status: 'success', message: '' };
      }
      else {
        return { status: 'error', message: resp };
      }
    } catch (errors) {
      return {
        status: 'failed',
        message: errors?.response?.data?.message || errors.toString(),
      };
    }
  };

  const signUp = async (values) => {
    // try {
    //   const resp = await apiSignUp(values);
    //   if (resp.data) {
    //     const { token } = resp.data;
    //     dispatch(signInSuccess(token));
    //     if (resp.data.user) {
    //       dispatch(setUser(resp.data.user || {
    //         avatar: '',
    //         userName: 'Anonymous',
    //         authority: ['USER'],
    //         email: '',
    //       }));
    //     }
    //     const redirectUrl = query.get(REDIRECT_URL_KEY);
    //     navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath);
    //     return { status: 'success', message: '' };
    //   }
    // } catch (errors) {
    //   return {
    //     status: 'failed',
    //     message: errors?.response?.data?.message || errors.toString(),
    //   };
    // }
  };

  const handleSignOut = () => {
    dispatch(signOutSuccess());
    dispatch(setUser({
      avatar: '',
      userName: '',
      email: '',
      authority: [],
    }));
    navigate(appConfig.unAuthenticatedEntryPath);
  };

  const signOut = async () => {
    // await apiSignOut();
    handleSignOut();
  };

  return {
    authenticated: token && signedIn,
    signIn,
    signUp,
    signOut,
  };
}

export default useAuth;
