import { DataStreamProvider } from '@/components/data-stream-provider';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DataStreamProvider>{children}</DataStreamProvider>;
}
