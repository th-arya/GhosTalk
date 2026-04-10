import React from 'react';

export interface MenuItemType {
  title: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  onClick?: () => void;
}

export default function GradientMenu({
  items
}: {
  items: MenuItemType[]
}) {
  return (
    <div className="flex justify-center items-center bg-dark">
      <ul className="flex gap-6">
        {items.map(({ title, icon, gradientFrom, gradientTo, onClick }, idx) => (
          <li
            key={idx}
            onClick={onClick}
            style={{
              '--gradient-from': gradientFrom,
              '--gradient-to': gradientTo
            } as React.CSSProperties}
            className="relative w-[60px] h-[60px] bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[180px] hover:shadow-none group cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
            <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>
            <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
              <span className="text-2xl text-gray-500">{icon}</span>
            </span>
            <span className="absolute text-white uppercase tracking-wide text-sm transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
