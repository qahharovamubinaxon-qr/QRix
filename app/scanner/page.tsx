import QRScanner from "../../components/QRScanner";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        QR Scanner
      </h1>

      <QRScanner />

    </main>
  );
}