type Props = {
  email: string;
  setEmail: (v: string) => void;
};

export default function EmailForm({
  email,
  setEmail,
}: Props) {
  return (
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="example@gmail.com"
      className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
    />
  );
}