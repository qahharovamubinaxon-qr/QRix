type Props = {
  phone: string;
  setPhone: (v: string) => void;
};

export default function WhatsappForm({
  phone,
  setPhone,
}: Props) {
  return (
    <input
      type="text"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      placeholder="+998901234567"
      className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
    />
  );
}