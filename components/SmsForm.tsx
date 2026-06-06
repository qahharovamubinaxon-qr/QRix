type Props = {
  phone: string;
  setPhone: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
};

export default function SmsForm({
  phone,
  setPhone,
  message,
  setMessage,
}: Props) {
  return (
    <div className="space-y-5">

      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+998901234567"
        className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="SMS Message"
        className="w-full h-32 p-5 rounded-xl bg-black border border-cyan-500/20"
      />

    </div>
  );
}