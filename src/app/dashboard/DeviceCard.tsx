// src/app/dashboard/DeviceCard.tsx
"use client";

import { Device } from "@prisma/client";

export default function DeviceCard({ device }: { device: Device }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-800">{device.name}</h3>
        <p className="text-xs text-gray-500 font-mono mt-1">Protocolo: {device.protocol}</p>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${device.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {device.status ? 'LIGADO' : 'DESLIGADO'}
        </span>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded shadow transition-colors">
          Power
        </button>
      </div>
    </div>
  );
}