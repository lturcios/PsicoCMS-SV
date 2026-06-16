import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ProfileTab } from './tabs/ProfileTab';
import { ServicesTab } from './tabs/ServicesTab';

export function SettingsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestioná los datos de tu consultorio</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="schedule">Horario</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>

          <TabsContent value="schedule">
            <p className="text-sm text-muted-foreground">
              Próximamente: horario de disponibilidad.
            </p>
          </TabsContent>

          <TabsContent value="contact">
            <p className="text-sm text-muted-foreground">Próximamente: datos de contacto.</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
