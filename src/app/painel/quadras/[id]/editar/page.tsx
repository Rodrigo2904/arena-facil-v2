import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { centsToInput } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { CourtForm } from "../../CourtForm";

export const metadata: Metadata = { title: "Editar quadra" };

export default async function EditCourtPage({ params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const { id } = await params;
  const court = await db.court.findFirst({ where: { id, ownerId: owner.id } });
  if (!court) notFound();

  return (
    <>
      <PageHeader title="Editar quadra" subtitle={court.name} />
      <CourtForm
        initial={{
          id: court.id,
          name: court.name,
          sport: court.sport,
          description: court.description,
          address: court.address,
          neighborhood: court.neighborhood,
          city: court.city,
          imageUrl: court.imageUrl ?? "",
          price: centsToInput(court.priceCents),
          openHour: String(court.openHour),
          closeHour: String(court.closeHour),
        }}
      />
    </>
  );
}
