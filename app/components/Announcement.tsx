import Image from "next/image";

export default function Announcement() {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-bold mb-3">Announcement</h3>
      <div className="relative w-full h-40 rounded-lg overflow-hidden">
        <Image
          src="/announcement.png"
          alt="Announcement"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
