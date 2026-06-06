type Props = {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
};

export default function VCardForm({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
}: Props) {
  return (
    <div className="space-y-5">

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
      />

      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+998901234567"
        className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@gmail.com"
        className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
      />

    </div>
  );
}