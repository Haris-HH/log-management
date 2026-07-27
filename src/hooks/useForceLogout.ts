import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { clearAuthUser } from "../features/auth-user/api/AuthUserSlice";
import { logoutApi } from "../features/login/api/LoginApi";
import { clearLocationCache } from "../api/fetchClient";

export const useForceLogout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const forceLogout = useCallback(
    async (callApi = false) => {
      try {
        if (callApi) {
          await logoutApi();
        }
      } 
      catch {
      } 
      finally {
        dispatch(clearAuthUser());

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userUid");
        localStorage.removeItem("persist:root");
        clearLocationCache();

        navigate("/login", { replace: true });
      }
    },
    [dispatch, navigate]
  );

  return { forceLogout };
};