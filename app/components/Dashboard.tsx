const users = [
  { name: "John Doe", score: 95, avatar: "/avatars/john.png" },
  { name: "Sarah Lee", score: 89, avatar: "/avatars/sarah.png" },
  { name: "Mike Johnson", score: 82, avatar: "/avatars/mike.png" },
  { name: "Emily Davis", score: 76, avatar: "/avatars/emily.png" },
  { name: "Daniel Smith", score: 72, avatar: "/avatars/daniel.png" },
  { name: "Olivia Brown", score: 68, avatar: "/avatars/olivia.png" },
  { name: "James Wilson", score: 65, avatar: "/avatars/james.png" },
  { name: "Sophia Clark", score: 61, avatar: "/avatars/sophia.png" },
  { name: "William Taylor", score: 58, avatar: "/avatars/william.png" },
  { name: "Ava Martinez", score: 55, avatar: "/avatars/ava.png" },
];

export default function Dashboard() {
  return (
    <div className="bg-gradient-to-b from-[#C8F4F9] via-[#B0E7ED] to-[#F1FDFF] rounded-2xl shadow p-4">
      {/* Title */}
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        <span className="bg-gradient-to-r from-[#191717] to-[#2B96D3] bg-clip-text text-transparent">
          Dashboard
        </span>
      </h3>

      {/* Header Row */}
      <div className="flex justify-between items-center mb-3 font-semibold text-sm">
        <span className="px-3 py-1 bg-[#2B96D3] text-white rounded-lg">
          Profile
        </span>
        <span className="px-3 py-1 bg-[#2B96D3] text-white rounded-lg">
          Rank
        </span>
        <span className="px-3 py-1 bg-[#2B96D3] text-white rounded-lg">
          Score
        </span>
      </div>

      {/* Users */}
      <ul className="space-y-3">
        {users.map((user, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center bg-white rounded-lg shadow-sm px-3 py-2"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium text-gray-800">{user.name}</span>
            </div>

            {/* Rank */}
            <span className="text-gray-700 font-semibold">#{idx + 1}</span>

            {/* Score */}
            <span className="font-bold text-gray-900">{user.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
