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

function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const query = useQuery();

  const { token, signedIn } = useAppSelector((state) => state.auth.session);

  const signIn = async (email, password) => {
    try {
      const resp = await authenticationUserLogin({
        username: email,
        password: password,
        companyPublicId: "264f432b-f7b3-4066-9e2a-66c641915320",
        companyTypeId: 1,
        employeePublicId: "c781986c-916f-4bd1-bfd6-68bfae783ed1",
        culture: 'pt-BR'
      });
      debugger;
      if (resp) {
        const { token } = resp;
        dispatch(signInSuccess(token));
        const decoded = JSON.parse(atob(resp.token.split('.')[1]));
        const decodedName = decoded?.["name"];
        const u = resp.user || {};

        // Parse permissions from JWT claim (JSON string → object)
        let permissions = {};
        try {
          if (decoded?.permissions)
            permissions = typeof decoded.permissions === 'string'
              ? JSON.parse(decoded.permissions)
              : decoded.permissions;
        } catch {}

        dispatch(setUser({
          avatar: u.avatar || '',
          userName: u.userName || decodedName || '',
          authenticationId: u.authenticationId || decoded?.["nameIdentifier"],
          authority: u.authority || ['USER'],
          email: u.email || '',
          employeePublicId: u.employeePublicId || decoded?.employeePublicId,
          companyTypeId: u.companyTypeId || decoded?.companyTypeId,
          companyPublicId: u.companyPublicId || decoded?.companyPublicId,
          permissions,
        }));
        dispatch(setLang(decoded.culture || 'pt-BR'))
        const redirectUrl = query.get(REDIRECT_URL_KEY);
        navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath);
        return { status: 'success', message: '' };
      } else {
        return { status: 'error', message: resp };
      }
    } catch (errors) {
      return {
        status: 'failed',
        message: errors?.response?.data?.message || errors.toString(),
      };
    }
  };

  const handleSignOut = () => {
    dispatch(signOutSuccess());
    dispatch(setUser({ avatar: '', userName: '', email: '', authority: [] }));
    navigate(appConfig.unAuthenticatedEntryPath);
  };

  const signOut = async () => { handleSignOut(); };

  return {
    authenticated: token && signedIn,
    signIn,
    signUp: async () => {},
    signOut
  };
}

export default useAuth;
