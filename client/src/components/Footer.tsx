// Se calcula una vez al cargar: el año no cambia mientras alguien lee la página (salvo en año nuevo 🎆)
const ANIO_ACTUAL = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-bl-600">
      <div className="envoltura flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-7 text-[0.92rem] text-bl-100">
        <p className="m-0">© {ANIO_ACTUAL} Juan Pablo Almeida · Eleira Aristizabal</p>
        <a href="#inicio" className="font-mono text-[0.84rem] text-bl-100 no-underline hover:text-white hover:underline">
          volver arriba ↑
        </a>
      </div>
    </footer>
  );
}
