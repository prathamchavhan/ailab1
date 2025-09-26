import { Bell } from "lucide-react";

export default function Header() {
  return (
    <div className="px-4 pt-3"> {/* reduced outer spacing */}
      <div className="flex justify-between items-center bg-[#103E50] text-white px-4 py-2 rounded-lg shadow">
        
        {/* Left - Avatar + Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#2DC7DB]">
            {/* Replace with actual user avatar later */}
            <img
              src="/avatar.png"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-base font-medium">Hi Devashish Dhumal! 👋</p>
        </div>

        {/* Right - Bell + Scores */}
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 cursor-pointer" />

          {/* Interview Score */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#2DC7DB] text-xs font-bold">
              76
            </div>
            <span className="text-[10px] mt-1">Interview Score</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#2B7ECF] text-xs font-bold">
              56
            </div>
            <span className="text-[10px] mt-1">Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
