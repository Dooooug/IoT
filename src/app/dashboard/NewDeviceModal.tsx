// src/app/dashboard/NewDeviceModal.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// --- ENSINANDO O TYPESCRIPT SOBRE O BLUETOOTH NATIVO ---
interface BluetoothDevice {
  id: string;
  name?: string;
}

interface NavigatorWithBluetooth extends Navigator {
  bluetooth: {
    requestDevice(options?: { acceptAllDevices?: boolean; optionalServices?: string[] }): Promise<BluetoothDevice>;
  };
}
// -------------------------------------------------------

export default function NewDeviceModal({ onClose }: { onClose: () => void }) {
  const [protocol, setProtocol] = useState("WIFI");
  const [name, setName] = useState("");
  
  const [scanStatus, setScanStatus] = useState<"IDLE" | "SCANNING" | "DETECTED">("IDLE");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScan = async () => {
    setScanStatus("SCANNING");

    if (protocol === "BLUETOOTH") {
      try {
        // Conversão blindada usando 'unknown' e a nossa Interface para não usar 'any'
        const nav = navigator as unknown as NavigatorWithBluetooth;
        
        const device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true, 
        });

        setName(device.name || "Dispositivo Bluetooth Desconhecido");
        setScanStatus("DETECTED");

      } catch (error) {
        console.error("Erro no Scanner Bluetooth:", error);
        alert("Varredura Bluetooth cancelada ou nenhum dispositivo encontrado.");
        setScanStatus("IDLE");
      }
    } else {
      alert("Scanner Wi-Fi real será implementado no backend na próxima etapa!");
      setScanStatus("IDLE");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/devices", {
      method: "POST",
      body: JSON.stringify({ name, protocol })
    });

    setLoading(false);
    if (res.ok) {
      alert("Dispositivo integrado à Estação!");
      router.refresh(); 
      onClose(); 
    } else {
      alert("Erro ao cadastrar dispositivo.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>📡</span> Adicionar Hardware
        </h2>

        {scanStatus === "IDLE" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Protocolo de Comunicação</label>
              <select 
                value={protocol} 
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full p-3 border rounded-lg text-slate-800 bg-slate-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="WIFI">Wi-Fi (Rede Local)</option>
                <option value="ZIGBEE">Zigbee (Rede Mesh)</option>
                <option value="BLUETOOTH">Bluetooth (Pareamento)</option>
              </select>
            </div>
            
            <button 
              onClick={handleScan}
              className="w-full bg-slate-800 text-white p-3 rounded-lg font-bold hover:bg-slate-900 transition flex justify-center items-center gap-2"
            >
              Iniciar Varredura
            </button>
          </div>
        )}

        {scanStatus === "SCANNING" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-slate-600">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="animate-pulse font-medium text-center">
              Procurando sinal {protocol} nas proximidades...
            </p>
          </div>
        )}

        {scanStatus === "DETECTED" && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border border-green-200">
              <span>✅</span> Hardware detectado com sucesso!
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apelido do Dispositivo</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Sensor de Chuva Jardim"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              {loading ? "Salvando..." : "Integrar ao Sistema"}
            </button>
          </form>
        )}

        <button 
          onClick={onClose}
          className="mt-4 w-full text-slate-500 hover:text-slate-700 text-sm font-medium p-2"
        >
          Cancelar Operação
        </button>
      </div>
    </div>
  );
}