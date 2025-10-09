import Image from "next/image";

export default function Announcement() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4"> {/* White card with padding and shadow */}
      <h3 className="text-xl font-semibold mb-3 text-[#0D62A8]">Announcement</h3> {/* Title with specific styling */}
      <div className="relative w-full h-[180px] rounded-lg overflow-hidden"> {/* Image container with fixed height */}
        <Image
          src="/announcement.jpg"
          alt="Something New is Coming Announcement"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}