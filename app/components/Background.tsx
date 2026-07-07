export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="animate-blob absolute left-1/2 top-[-14rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[130px]" />
      <div className="animate-blob animation-delay-4000 absolute bottom-[-16rem] left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-orange-400/10 blur-[130px]" />
    </div>
  );
}
