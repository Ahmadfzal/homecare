import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateInquiry } from "@/hooks/use-homecare";
import { insertInquirySchema, type Service } from "@shared/schema";
import { z } from "zod";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedService: Service | null;
}

// Enhance the schema for form validation
const formSchema = insertInquirySchema.extend({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  contact: z.string().min(8, "Kontak minimal 8 karakter"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactDialog({ open, onOpenChange, selectedService }: ContactDialogProps) {
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();
  const [isSuccess, setIsSuccess] = useState(false);
  

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      message: selectedService ? `Saya tertarik dengan layanan: ${selectedService.title}` : "",
    },
  });

  // Reset form when dialog opens/closes or service changes
  useState(() => {
    if (open) {
      form.reset({
        name: "",
        contact: "",
        message: selectedService ? `Saya tertarik dengan layanan: ${selectedService.title}` : "",
      });
      setIsSuccess(false);
    }
  }); // Note: useEffect would be better but useState initializer runs once per render/mount logic

  async function onSubmit(data: FormValues) {
    try {
      await createInquiry.mutateAsync(data);
      setIsSuccess(true);
      toast({
        title: "Pesan Terkirim!",
        description: "Tim kami akan segera menghubungi Anda.",
      });
      // Close after a delay to show success state
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Gagal Mengirim",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold font-display text-primary">Terima Kasih!</h3>
            <p className="text-muted-foreground">
              Permintaan Anda telah kami terima. Kami akan segera menghubungi nomor yang Anda cantumkan.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-primary">
                {selectedService ? "Pesan Layanan" : "Hubungi Kami"}
              </DialogTitle>
              <DialogDescription>
                Isi formulir di bawah ini dan perawat kami akan segera menghubungi Anda untuk konfirmasi.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Budi Santoso" className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp / Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="0812..." type="tel" className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Keluhan spesifik, waktu yang diinginkan, dll..." 
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
                    disabled={createInquiry.isPending}
                  >
                    {createInquiry.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
