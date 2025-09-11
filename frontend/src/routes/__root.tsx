import { createRootRoute, Outlet } from '@tanstack/react-router';

const RootLayout = () => (
  <div
    style={{
      minHeight: '100vh',
      width: '100%',
      backgroundImage: 'url(/images/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
    <Outlet />
  </div>
);

export const Route = createRootRoute({ component: RootLayout });
