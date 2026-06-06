type Props = {
  username: string;
  setUsername: (v: string) => void;
};

export default function TelegramForm({
  username,
  setUsername,
}: Props) {
  return (
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="@username"
      className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
    />
  );
}