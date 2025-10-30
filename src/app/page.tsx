
import { ReceiptGenerator } from '@/components/receipt-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-gray-50">
      <ReceiptGenerator />
    </main>
  );
}
