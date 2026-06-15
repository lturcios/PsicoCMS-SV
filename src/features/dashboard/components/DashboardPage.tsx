export function DashboardPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Panel del consultorio</h1>
      <p className="text-muted-foreground">
        Acá vas a ver tu agenda, pacientes y configuración una vez que inicies sesión. Esta sección
        se habilita en la Fase 1 (autenticación y aislamiento por consultorio).
      </p>
    </div>
  );
}
