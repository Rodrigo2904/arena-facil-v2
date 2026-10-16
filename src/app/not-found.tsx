import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="text-6xl" aria-hidden>
        🥅
      </div>
      <h1 className="mt-4 text-2xl font-bold">Bola fora!</h1>
      <p className="mt-2 text-slate-600">A página que você procurou não existe ou foi removida.</p>
      <Link href="/quadras" className="btn btn-primary mt-6">
        Ver quadras
      </Link>
    </div>
  );
}
