import { ReceiptGenerator } from '@/components/receipt-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-100">
      <ReceiptGenerator />
    </main>
  );
}

    