import { Hash, Palette, Navigation } from "lucide-react";

interface LuckyElementsProps {
  number?: string;
  color?: string;
  direction?: string;
}

export function LuckyElements({
  number = "7",
  color = "紫色",
  direction = "东南",
}: LuckyElementsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
        <Hash className="w-6 h-6 text-violet-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500 mb-1">幸运数字</p>
        <p className="text-xl font-bold text-white">{number}</p>
      </div>
      <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
        <Palette className="w-6 h-6 text-violet-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500 mb-1">幸运颜色</p>
        <p className="text-xl font-bold text-white">{color}</p>
      </div>
      <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
        <Navigation className="w-6 h-6 text-violet-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500 mb-1">幸运方位</p>
        <p className="text-xl font-bold text-white">{direction}</p>
      </div>
    </div>
  );
}
