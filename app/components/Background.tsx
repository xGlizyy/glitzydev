export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black_40%,transparent_100%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="animate-blob absolute -top-32 left-1/4 h-[34rem] w-[34rem] rounded-full bg-emerald-500/25 blur-[120px]" />
      <div className="animate-blob animation-delay-2000 absolute top-1/3 -right-24 h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-[130px]" />
      <div className="animate-blob animation-delay-4000 absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-violet-500/15 blur-[130px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
    </div>
  );
}
