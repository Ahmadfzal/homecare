import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function OrderButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [paket, setPaket] = useState("");

  const handleSubmit = () => {
    if (!name || !paket) {
      alert("Nama dan Paket wajib diisi!");
      return;
    }

    const message = `Halo, perkenalkan nama saya ${name} ingin memesan paket ${paket}`;

    const url = `https://wa.me/6285240354224?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="bg-accent hover:bg-accent/90 text-white font-bold text-lg px-8 py-6 h-auto rounded-full shadow-lg shadow-orange-900/20 hover:scale-105 transition-transform"
      >
        Pesan Sekarang
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg">

            <h2 className="text-lg font-bold mb-4">
              Form Pemesanan
            </h2>

            <input
              type="text"
              placeholder="Nama Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            <select
              value={paket}
              onChange={(e) => setPaket(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="">-- Pilih Paket --</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Batal
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white flex items-center gap-2 rounded"
              >
                <FaWhatsapp /> Kirim
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}