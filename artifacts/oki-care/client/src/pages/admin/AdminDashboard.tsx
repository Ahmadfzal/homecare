import { useState, useEffect, useRef } from "react";
import {
  useServices,
  useCarouselImages,
  useInquiries,
  useCreateService,
  useDeleteService,
  useUpdateService,
  useCreateCarouselImage,
  useDeleteCarouselImage,
  useDeleteInquiry,
  useSettings,
  useUpdateSettings,
} from "@/hooks/use-homecare";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Edit2, LayoutDashboard, LogOut, Upload, ImageIcon, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { type Service, type SiteSettings, DEFAULT_SETTINGS } from "@shared/schema";

interface AdminDashboardProps {
  adminToken: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminToken, onLogout }: AdminDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("services");
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: carousel, isLoading: carouselLoading } = useCarouselImages();
  const { data: inquiries, isLoading: inquiriesLoading } = useInquiries();

  const createService = useCreateService();
  const deleteService = useDeleteService();
  const updateService = useUpdateService();
  const createCarousel = useCreateCarouselImage();
  const deleteCarousel = useDeleteCarouselImage();
  const deleteInquiry = useDeleteInquiry();

  // --- Foto Galeri state ---
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("Belum ada file dipilih");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // --- Carousel upload state ---
  const [carouselFile, setCarouselFile] = useState<File | null>(null);
  const [carouselFileName, setCarouselFileName] = useState("Belum ada file dipilih");
  const [carouselUploading, setCarouselUploading] = useState(false);
  const carouselFileRef = useRef<HTMLInputElement>(null);

  // --- Settings state ---
  const { data: siteSettings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (siteSettings) setSettingsForm(siteSettings);
  }, [siteSettings]);

  const sf = (key: keyof SiteSettings, val: string) =>
    setSettingsForm((prev) => ({ ...prev, [key]: val }));

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      let patch = { ...settingsForm };
      if (logoFile) {
        setLogoUploading(true);
        const fd = new FormData();
        fd.append("image", logoFile);
        const r = await fetch("/api/upload", { method: "POST", headers: authHeaders, body: fd });
        if (r.ok) {
          const { imageUrl } = await r.json();
          patch.store_logo = imageUrl;
          setSettingsForm((p) => ({ ...p, store_logo: imageUrl }));
        }
        setLogoUploading(false);
      }
      await updateSettingsMutation.mutateAsync(patch);
      toast({ title: "Sukses", description: "Pengaturan berhasil disimpan!" });
      setLogoFile(null);
      if (logoFileRef.current) logoFileRef.current.value = "";
    } catch {
      toast({ title: "Gagal", description: "Gagal menyimpan pengaturan", variant: "destructive" });
    } finally {
      setSettingsSaving(false);
    }
  };

  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  const fetchImages = async () => {
    const res = await fetch("/api/testimg");
    const data = await res.json();
    setImages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  const resetForm = () => {
    setFile(null);
    setFileName("Belum ada file dipilih");
    setTitle("");
    setDescription("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const [newService, setNewService] = useState({
    title: "",
    description: "",
    price: "",
    category: "special_offer",
    notes: "",
    imageUrl: "",
  });
  const [newCarousel, setNewCarousel] = useState({ imageUrl: "", caption: "" });

  const handleAddService = async () => {
    if (!newService.price.trim() || !newService.title.trim() || !newService.description.trim()) {
      toast({ title: "Error", description: "Lengkapi semua data yang wajib", variant: "destructive" });
      return;
    }
    try {
      if (editingService) {
        await updateService.mutateAsync({ id: editingService.id, data: newService });
        setEditingService(null);
        toast({ title: "Sukses", description: "Layanan berhasil diperbarui" });
      } else {
        await createService.mutateAsync(newService);
        toast({ title: "Sukses", description: "Layanan berhasil ditambahkan" });
      }
      setNewService({ title: "", description: "", price: "", category: "special_offer", notes: "", imageUrl: "" });
    } catch {
      toast({ title: "Gagal", description: "Cek kembali input Anda", variant: "destructive" });
    }
  };

  const startEdit = (s: Service) => {
    setEditingService(s);
    setNewService({
      title: s.title,
      description: s.description,
      price: s.price,
      category: s.category,
      notes: s.notes || "",
      imageUrl: s.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description) {
      toast({ title: "Error", description: "Lengkapi semua data foto", variant: "destructive" });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const res = await fetch("/upload-image", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload gagal");
      }
      resetForm();
      toast({ title: "Sukses", description: "Gambar berhasil diupload!" });
      setRefreshTrigger((p) => p + 1);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Upload gambar gagal", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitCarousel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carouselFile || !newCarousel.caption) {
      toast({ title: "Error", description: "Pilih gambar dan isi caption", variant: "destructive" });
      return;
    }
    setCarouselUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", carouselFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload gagal");
      const { imageUrl } = await uploadRes.json();

      await new Promise<void>((resolve, reject) =>
        createCarousel.mutate({ imageUrl, caption: newCarousel.caption }, {
          onSuccess: () => resolve(),
          onError: () => reject(new Error("Gagal simpan carousel")),
        })
      );

      toast({ title: "Sukses", description: "Gambar carousel berhasil ditambahkan!" });
      setCarouselFile(null);
      setCarouselFileName("Belum ada file dipilih");
      setNewCarousel({ imageUrl: "", caption: "" });
      if (carouselFileRef.current) carouselFileRef.current.value = "";
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setCarouselUploading(false);
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm("Yakin ingin menghapus gambar?")) return;
    const res = await fetch(`/api/testimg/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) {
      toast({ title: "Berhasil", description: "Gambar berhasil dihapus" });
      fetchImages();
    } else {
      toast({ title: "Gagal", description: "Gagal menghapus gambar", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <LayoutDashboard className="text-primary w-5 h-5" />
          <span className="font-bold text-xl">OkiHomeCare</span>
        </div>
        <nav className="space-y-1 flex-1">
          <Link href="/" className="block py-2 px-4 hover:bg-slate-800 rounded text-sm text-slate-300 hover:text-white transition-colors">
            ← Lihat Situs
          </Link>
          <div className="py-2 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider mt-4 mb-1">
            Manajemen
          </div>
          {[
            { key: "services", label: "Layanan" },
            { key: "foto", label: "Foto Galeri" },
            { key: "carousel", label: "Carousel Hero" },
            { key: "inquiries", label: "Pesan Masuk" },
            { key: "settings", label: "Pengaturan Toko" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`w-full text-left py-2 px-4 rounded text-sm transition-colors ${
                activeTab === key
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 py-2 px-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-sm transition-colors mt-4"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
            <p className="text-slate-500 text-sm mt-0.5">Kelola konten Oki HomeCare</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="md:hidden">
            <LogOut className="w-4 h-4 mr-1" /> Keluar
          </Button>
        </header>

        {/* Mobile tabs */}
        <div className="md:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5 text-xs">
              <TabsTrigger value="services">Layanan</TabsTrigger>
              <TabsTrigger value="foto">Foto</TabsTrigger>
              <TabsTrigger value="carousel">Carousel</TabsTrigger>
              <TabsTrigger value="inquiries">Pesan</TabsTrigger>
              <TabsTrigger value="settings">Toko</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* === LAYANAN === */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5" />
                  {editingService ? "Ubah Layanan" : "Tambah Layanan Baru"}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Nama Layanan *"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                />
                <Input
                  placeholder="Harga (mis: Rp 200.000) *"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                />
                <Select
                  value={newService.category}
                  onValueChange={(v) => setNewService({ ...newService, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="special_offer">Penawaran Spesial (Booster)</SelectItem>
                    <SelectItem value="special_care">Perawatan Khusus</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Catatan tambahan"
                  value={newService.notes}
                  onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                />
                <Textarea
                  placeholder="Deskripsi *"
                  className="md:col-span-2"
                  rows={3}
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
                <div className="md:col-span-2 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAddService}
                    disabled={createService.isPending || updateService.isPending}
                  >
                    {createService.isPending || updateService.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                    ) : editingService ? "Simpan Perubahan" : "Tambah Layanan"}
                  </Button>
                  {editingService && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingService(null);
                        setNewService({ title: "", description: "", price: "", category: "special_offer", notes: "", imageUrl: "" });
                      }}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {servicesLoading && <div className="text-center py-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}
              {services?.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                        {s.imageUrl ? (
                          <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{s.title}</h4>
                        <p className="text-sm text-slate-500">
                          {s.category === "special_offer" ? "Booster" : "Perawatan"} · {s.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => startEdit(s)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteService.mutate(s.id)}
                        disabled={deleteService.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!servicesLoading && services?.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed">
                  Belum ada layanan. Tambahkan layanan di atas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* === FOTO GALERI (upload ke server lokal) === */}
        {activeTab === "foto" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-5 h-5" />
                  Upload Foto Galeri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPhoto} className="space-y-4">
                  {/* File picker */}
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      type="file"
                      hidden
                      ref={fileRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                          setFileName(e.target.files[0].name);
                        }
                      }}
                    />
                    {file ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(file)}
                          className="max-h-40 mx-auto rounded-lg object-cover"
                          alt="preview"
                        />
                        <p className="text-sm text-slate-600 font-medium">{fileName}</p>
                        <p className="text-xs text-blue-500">Klik untuk ganti gambar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-slate-500 text-sm font-medium">Klik untuk pilih gambar</p>
                        <p className="text-slate-400 text-xs">PNG, JPG, WebP · Maks 10MB</p>
                      </div>
                    )}
                  </div>

                  <Input
                    placeholder="Judul foto *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Deskripsi foto *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={uploading || !file || !title || !description}
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengupload...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Upload Foto</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-slate-100">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 truncate">{item.description}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="shrink-0 ml-2"
                      onClick={() => handleDeletePhoto(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {images.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed">
                  Belum ada foto. Upload foto pertama Anda.
                </div>
              )}
            </div>
          </div>
        )}

        {/* === CAROUSEL HERO === */}
        {activeTab === "carousel" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-5 h-5" />
                  Tambah Gambar Carousel Hero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitCarousel} className="space-y-4">
                  {/* File picker */}
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    onClick={() => carouselFileRef.current?.click()}
                  >
                    <input
                      type="file"
                      hidden
                      ref={carouselFileRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCarouselFile(e.target.files[0]);
                          setCarouselFileName(e.target.files[0].name);
                        }
                      }}
                    />
                    {carouselFile ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(carouselFile)}
                          className="max-h-40 mx-auto rounded-lg object-cover"
                          alt="preview"
                        />
                        <p className="text-sm text-slate-600 font-medium">{carouselFileName}</p>
                        <p className="text-xs text-blue-500">Klik untuk ganti gambar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-slate-500 text-sm font-medium">Klik untuk pilih gambar</p>
                        <p className="text-slate-400 text-xs">PNG, JPG, WebP · Maks 10MB</p>
                      </div>
                    )}
                  </div>

                  <Input
                    placeholder="Caption / Judul foto *"
                    value={newCarousel.caption}
                    onChange={(e) => setNewCarousel({ ...newCarousel, caption: e.target.value })}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={carouselUploading || !carouselFile || !newCarousel.caption}
                  >
                    {carouselUploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengupload...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Upload ke Carousel</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carousel?.map((img) => (
                <Card key={img.id} className="overflow-hidden">
                  <div className="aspect-video bg-slate-100">
                    <img src={img.imageUrl} alt={img.caption || ""} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4 flex justify-between items-center">
                    <p className="text-sm truncate font-medium">{img.caption || "(Tanpa caption)"}</p>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteCarousel.mutate(img.id)}
                      disabled={deleteCarousel.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {!carouselLoading && (!carousel || carousel.length === 0) && (
                <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed">
                  Belum ada gambar carousel.
                </div>
              )}
            </div>
          </div>
        )}

        {/* === PESAN MASUK === */}
        {activeTab === "inquiries" && (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pesan Masuk</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiriesLoading && <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>}
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 text-left font-medium text-slate-600">Nama</th>
                      <th className="p-4 text-left font-medium text-slate-600">Kontak</th>
                      <th className="p-4 text-left font-medium text-slate-600">Layanan</th>
                      <th className="p-4 text-left font-medium text-slate-600">Pesan</th>
                      <th className="p-4 text-right font-medium text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries?.map((i) => (
                      <tr key={i.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium">{i.name}</td>
                        <td className="p-4 text-slate-600">{i.contact}</td>
                        <td className="p-4 text-slate-500 text-xs">{(i as any).service || "-"}</td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">{i.message}</td>
                        <td className="p-4 text-right">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteInquiry.mutate(i.id)}
                            disabled={deleteInquiry.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!inquiriesLoading && (!inquiries || inquiries.length === 0) && (
                  <div className="text-center py-12 text-slate-400">Belum ada pesan masuk.</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* === PENGATURAN TOKO === */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">

            {/* Identitas Toko */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5" /> Identitas Toko
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Toko</label>
                  <Input value={settingsForm.store_name} onChange={(e) => sf("store_name", e.target.value)} placeholder="Oki HomeCare" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo Toko</label>
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    onClick={() => logoFileRef.current?.click()}
                  >
                    <input type="file" hidden ref={logoFileRef} accept="image/*"
                      onChange={(e) => { if (e.target.files?.[0]) setLogoFile(e.target.files[0]); }} />
                    {logoFile ? (
                      <div className="space-y-1">
                        <img src={URL.createObjectURL(logoFile)} className="max-h-16 mx-auto rounded object-contain" alt="logo preview" />
                        <p className="text-xs text-blue-500">Klik untuk ganti</p>
                      </div>
                    ) : settingsForm.store_logo ? (
                      <div className="space-y-1">
                        <img src={settingsForm.store_logo} className="max-h-16 mx-auto rounded object-contain" alt="logo" />
                        <p className="text-xs text-blue-500">Klik untuk ganti logo</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Klik untuk upload logo (PNG/JPG)</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hero Section */}
            <Card>
              <CardHeader><CardTitle className="text-base">Hero / Banner Utama</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Badge / Label Layanan</label>
                  <Input value={settingsForm.hero_badge} onChange={(e) => sf("hero_badge", e.target.value)} placeholder="Layanan Aktif 24 Jam" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Judul Utama (Headline)</label>
                  <Input value={settingsForm.hero_headline} onChange={(e) => sf("hero_headline", e.target.value)} placeholder="Perawatan Medis Profesional di Rumah Anda" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Sub-Judul / Deskripsi</label>
                  <Textarea rows={2} value={settingsForm.hero_subtext} onChange={(e) => sf("hero_subtext", e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {([["stat1", "Statistik 1"], ["stat2", "Statistik 2"], ["stat3", "Statistik 3"]] as const).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                      <Input className="mb-1" placeholder="500+" value={(settingsForm as any)[`${key}_value`]} onChange={(e) => sf(`${key}_value` as any, e.target.value)} />
                      <Input placeholder="Pasien Terlayani" value={(settingsForm as any)[`${key}_label`]} onChange={(e) => sf(`${key}_label` as any, e.target.value)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardHeader><CardTitle className="text-base">Keunggulan Kami (3 Poin)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {([["trust1", "Keunggulan 1"], ["trust2", "Keunggulan 2"], ["trust3", "Keunggulan 3"]] as const).map(([key, label]) => (
                  <div key={key} className="grid grid-cols-3 gap-3 items-start">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label} - Judul</label>
                      <Input value={(settingsForm as any)[`${key}_title`]} onChange={(e) => sf(`${key}_title` as any, e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label} - Deskripsi</label>
                      <Textarea rows={1} value={(settingsForm as any)[`${key}_desc`]} onChange={(e) => sf(`${key}_desc` as any, e.target.value)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Kategori */}
            <Card>
              <CardHeader><CardTitle className="text-base">Kategori Layanan</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-3">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Kategori 1 — Penawaran Spesial</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Label Kecil</label>
                      <Input value={settingsForm.category_offer_name} onChange={(e) => sf("category_offer_name", e.target.value)} placeholder="Penawaran Spesial" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Judul Besar</label>
                      <Input value={settingsForm.category_offer_headline} onChange={(e) => sf("category_offer_headline", e.target.value)} placeholder="Booster & Vitamin" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi</label>
                    <Textarea rows={2} value={settingsForm.category_offer_desc} onChange={(e) => sf("category_offer_desc", e.target.value)} />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Kategori 2 — Perawatan Khusus</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Label Kecil</label>
                      <Input value={settingsForm.category_care_name} onChange={(e) => sf("category_care_name", e.target.value)} placeholder="Perawatan Khusus" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Judul Besar</label>
                      <Input value={settingsForm.category_care_headline} onChange={(e) => sf("category_care_headline", e.target.value)} placeholder="Perawatan Khusus" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi</label>
                    <Textarea rows={2} value={settingsForm.category_care_desc} onChange={(e) => sf("category_care_desc", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kontak & Footer */}
            <Card>
              <CardHeader><CardTitle className="text-base">Kontak & Footer</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nomor Telepon</label>
                    <Input value={settingsForm.contact_phone} onChange={(e) => sf("contact_phone", e.target.value)} placeholder="+6285240354224" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nomor WhatsApp (tanpa +)</label>
                    <Input value={settingsForm.contact_whatsapp} onChange={(e) => sf("contact_whatsapp", e.target.value)} placeholder="6285240354224" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                    <Input type="email" value={settingsForm.contact_email} onChange={(e) => sf("contact_email", e.target.value)} placeholder="okiwahyudi098@gmail.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Alamat</label>
                    <Input value={settingsForm.contact_address} onChange={(e) => sf("contact_address", e.target.value)} placeholder="Kalideres Jakarta Barat" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi Footer</label>
                  <Textarea rows={2} value={settingsForm.footer_desc} onChange={(e) => sf("footer_desc", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Teks Copyright</label>
                  <Input value={settingsForm.copyright} onChange={(e) => sf("copyright", e.target.value)} placeholder="Oki HomeCare. All rights reserved." />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12 text-base font-bold" disabled={settingsSaving || logoUploading}>
              {settingsSaving || logoUploading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                : <><Settings className="w-4 h-4 mr-2" /> Simpan Semua Pengaturan</>}
            </Button>
          </form>
        )}

      </main>
    </div>
  );
}
