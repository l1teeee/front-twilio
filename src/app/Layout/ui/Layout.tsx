import { FC } from "react";
import { Outlet } from "react-router-dom";

const Layout: FC = () => {
  return (
    <div >
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
