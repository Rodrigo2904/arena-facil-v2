import { canOwnerCancel, canOwnerDecide } from "@/lib/bookings";
import { ownerUpdateBooking } from "@/app/actions/bookings";
import { SubmitButton } from "@/components/buttons";

type B = { id: string; status: string; date: string; startHour: number };

export function BookingActions({ booking, returnTo }: { booking: B; returnTo: string }) {
  const decide = canOwnerDecide(booking);
  const cancel = canOwnerCancel(booking);
  if (!decide && !cancel) return <span className="block text-right text-xs text-slate-400">—</span>;

  return (
    <form action={ownerUpdateBooking} className="flex justify-end gap-2">
      <input type="hidden" name="bookingId" value={booking.id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {decide && (
        <>
          <SubmitButton name="action" value="confirm" className="btn btn-primary btn-sm" pendingText="…">
            Aprovar
          </SubmitButton>
          <SubmitButton name="action" value="reject" className="btn btn-danger btn-sm" pendingText="…" confirm="Recusar esta reserva?">
            Recusar
          </SubmitButton>
        </>
      )}
      {cancel && (
        <SubmitButton
          name="action"
          value="cancel"
          className="btn btn-danger btn-sm"
          pendingText="…"
          confirm="Cancelar esta reserva confirmada? Avise o cliente."
        >
          Cancelar
        </SubmitButton>
      )}
    </form>
  );
}
