'use client';

import ConnectionStatus from '@/components/ConnectionStatus';
import { useTabManagement } from '@/hooks/useTabManagement';

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  useTabManagement();

  return (
    <>
      <ConnectionStatus />
      {children}
    </>
  );
};

export default ClientLayout;
