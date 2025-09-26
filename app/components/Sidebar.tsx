import Image from "next/image";

const menuItems = [
  "AI Interview",
  "Dashboard",
  "Jobs",
  "News",
  "Events",
  "Career Counselling",
  "Billing",
  "Profile",
  "App Settings",
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md flex flex-col p-4">
      <div className="flex justify-center mb-6">
        <Image src="/ai-lab-logo.png" alt="AI Lab Logo" width={140} height={50} />
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <a
            key={item}
            href="#"
            className={`block px-4 py-2 rounded-lg font-medium ${
              item === "AI Interview"
                ? "bg-gradient-to-r from-[#2DC7DB] to-[#2B7ECF] text-white"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {item}
          </a>
        ))}
      </nav>
    </div>
  );
}
