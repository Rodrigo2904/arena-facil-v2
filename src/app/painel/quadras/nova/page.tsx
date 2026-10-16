import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { CourtForm } from "../CourtForm";

export const metadata: Metadata = { title: "Nova quadra" };

export default function NewCourtPage() {
  return (
    <>
      <PageHeader title="Nova quadra" subtitle="Quanto mais completa, mais reservas ela recebe." />
      <CourtForm
        initial={{
          name: "",
          sport: "society",
          description: "",
          address: "",
          neighborhood: "",
          city: "",
          imageUrl: "",
          price: "",
          openHour: "8",
          closeHour: "23",
        }}
      />
    </>
  );
}
