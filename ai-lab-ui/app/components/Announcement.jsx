import Image from "next/image";

export default function Announcement() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      {/* Title */}
      <h3 className="font-[Poppins] font-semibold text-[20px] leading-[100%] tracking-[0px] text-[#09407F] mb-4">
        Announcement
      </h3>

      {/* Announcement Image */}
      <div className="relative w-full h-[180px] rounded-lg overflow-hidden">
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
