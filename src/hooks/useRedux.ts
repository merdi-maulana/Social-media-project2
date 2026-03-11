import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { logout } from "@/store/authSlices";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useAuth() {
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return { user, token, isAuthenticated, logout: handleLogout };
}
