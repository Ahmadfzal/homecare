import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function InquiryNotification() {

  const queryClient = useQueryClient();

  // ============================
  // GET DATA (Polling)
  // ============================
  const { data, isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const res = await fetch("/api/inquiries");
      return res.json();
    },
    refetchInterval: 10000,
  });

  // ============================
  // DELETE INQUIRY
  // ============================
  const deleteInquiry = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete gagal");
    },
    onSuccess: () => {
      alert("🗑 Notifikasi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
  });

  // ============================
  // HANDLER
  // ============================
  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus notifikasi ini?")) {
      deleteInquiry.mutate(id);
    }
  };

  if (isLoading) return <p>Loading inquiries...</p>;

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-3">Notifikasi User Masuk</h2>

      {data?.length === 0 && (
        <p className="text-gray-400">Belum ada notifikasi</p>
      )}

      {data?.map((item: any) => (
        <div
          key={item.id}
          className="border-b py-2 flex justify-between items-start"
        >
          <div>
            <p><b>{item.name}</b></p>
            <p>{item.contact}</p>
            <p className="text-sm text-gray-500">{item.message}</p>
            <p>{item.category}</p>
          </div>

          <button
            className="bg-red-600 text-white px-2 py-1 rounded"
            onClick={() => handleDelete(item.id)}
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}