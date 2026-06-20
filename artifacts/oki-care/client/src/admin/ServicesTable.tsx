import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/* ================= ROW COMPONENT ================= */
function ServiceRow({ item, updateService, deleteService }: any) {
  const [editData, setEditData] = useState(item);

  const handleUpdate = () => {
    updateService.mutate(editData);
  };

  const handleDelete = () => {
    if (confirm("Yakin ingin menghapus service ini?")) {
      deleteService.mutate(item.id);
    }
  };

  return (
    <tr className="border-t">
      {["title", "description", "price", "category", "notes"].map((field) => (
        <td key={field}>
          <input
            className="border p-1 w-full"
            value={editData[field]}
            onChange={(e) =>
              setEditData({ ...editData, [field]: e.target.value })
            }
          />
        </td>
      ))}

      <td className="space-x-2">
        <button
          className="bg-green-600 text-white px-2 py-1 rounded"
          onClick={handleUpdate}
        >
          Update
        </button>

        <button
          className="bg-red-600 text-white px-2 py-1 rounded"
          onClick={handleDelete}
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}

/* ================= MAIN ================= */
export default function ServicesTable() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    notes: "",
  });

  /* ========== GET DATA ========== */
  const { data } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await fetch("/api/services");
      return res.json();
    },
  });

  /* ========== CREATE ========== */
  const createService = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menambah data");
    },
    onSuccess: () => {
      alert("✅ Service berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setForm({
        title: "",
        description: "",
        price: "",
        category: "",
        notes: "",
      });
    },
    onError: () => {
      alert("❌ Gagal menambah service");
    },
  });

  /* ========== UPDATE ========== */
  const updateService = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/services/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update gagal");
    },
    onSuccess: () => {
      alert("✅ Data berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => {
      alert("❌ Gagal update data");
    },
  });
  
  /* ========== DELETE ========== */
  const deleteService = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete gagal");
    },
    onSuccess: () => {
      alert("🗑 Data berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => {
      alert("❌ Gagal hapus data");
    },
  });

  /* ========== VALIDASI FORM ========== */
  const handleCreate = () => {
    const values = Object.values(form);

    if (values.some((v) => v.trim() === "")) {
      alert("⚠️ Semua kolom wajib diisi");
      return;
    }

    createService.mutate(form);
  };

  return (
    <div className="bg-white shadow rounded p-4 space-y-6">
      <h2 className="font-semibold text-lg">Kelola Services</h2>

      {/* ===== FORM TAMBAH ===== */}
      <div className="grid grid-cols-5 gap-2">
        {["title", "description", "price", "category", "notes"].map((key) =>
          key === "category" ? (
            // ✅ KHUSUS CATEGORY → SELECT
            <select
              key={key}
              className="border p-2 rounded"
              value={(form as any)[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="special_offer">Boster & vitamin</option>
              <option value="special_care">Perawatan Khusus</option>
            </select>
          ) : (
            // ✅ FIELD LAIN → INPUT
            <input
              key={key}
              placeholder={key}
              className="border p-2 rounded"
              value={(form as any)[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
        ))}

        <button
          className="bg-blue-600 text-white rounded px-3"
          onClick={handleCreate}
        >
          Tambah
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Nama Produk</th>
            <th>Penjelasan</th>
            <th>Harga</th>
            <th>Kategori</th>
            <th>Catatan</th>
            <th>UPDATE & HAPUS</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((item: any) => (
            <ServiceRow
              key={item.id}
              item={item}
              updateService={updateService}
              deleteService={deleteService}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}