// src/app/dashboard/AddDeviceButton.tsx
"use client";
import { useState } from "react";
import NewDeviceModal from "./NewDeviceModal";

export default function AddDeviceButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-md shadow-sm transition flex items-center gap-2 text-sm"
      >
        <span>➕</span> Novo Hardware
      </button>

      {isModalOpen && <NewDeviceModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}