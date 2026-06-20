import ServicesTable from "./ServicesTable";
import InquiryNotification from "./InquiryNotification";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <InquiryNotification />
      <ServicesTable />
    </div>
  );
}