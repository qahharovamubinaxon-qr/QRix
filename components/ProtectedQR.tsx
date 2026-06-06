type Props = {
  pin: string;
};

export default function ProtectedQR({
  pin,
}: Props) {
  if (!pin) return null;

  return (
    <div className="mt-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">

      <h3 className="font-bold text-cyan-400">
        Protected QR
      </h3>

      <p className="text-gray-300 mt-2">
        PIN protection enabled:
        {" "}
        {pin}
      </p>

    </div>
  );
}