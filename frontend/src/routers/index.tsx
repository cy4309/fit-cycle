type IRouter = {
  index: string;
  auth: string;
  home: string;
  error: string;
};

export const router_path: IRouter = {
  index: "/",
  auth: "/auth",
  home: "/home",
  error: "*",
};
