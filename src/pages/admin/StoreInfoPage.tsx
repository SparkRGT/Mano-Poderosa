import { useState, useEffect } from 'react';
import { Card, Button, Input, Alert } from '../../components/ui';
import { settingsService } from '../../services';

interface StoreInfo {
  store_name: string;
  store_description: string;
  store_address: string;
  store_phone: string;
  store_email: string;
  store_schedule: string;
  store_facebook: string;
  store_instagram: string;
  store_whatsapp: string;
}

const defaultStoreInfo: StoreInfo = {
  store_name: '',
  store_description: '',
  store_address: '',
  store_phone: '',
  store_email: '',
  store_schedule: '',
  store_facebook: '',
  store_instagram: '',
  store_whatsapp: '',
};

export function StoreInfoPage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultStoreInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadStoreInfo();
  }, []);

  const loadStoreInfo = async () => {
    try {
      setIsLoading(true);
      const settings = await settingsService.getAll();
      const info: StoreInfo = { ...defaultStoreInfo };
      
      settings.forEach((setting) => {
        if (setting.key in info) {
          info[setting.key as keyof StoreInfo] = setting.value;
        }
      });
      
      setStoreInfo(info);
      setError(null);
    } catch (err) {
      setError('Error al cargar la información de la tienda');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      
      // Guardar cada campo como setting individual
      const settingsToSave = Object.entries(storeInfo).map(([key, value]) => ({
        key,
        value,
      }));
      
      for (const setting of settingsToSave) {
        await settingsService.upsert(setting.key, setting.value);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error al guardar la información');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof StoreInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStoreInfo((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Información de la Tienda</h1>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)}>
          Información guardada correctamente
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Información General */}
          <Card>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Información General
              </h2>
              <div className="grid gap-4">
                <Input
                  label="Nombre de la Tienda"
                  value={storeInfo.store_name}
                  onChange={handleChange('store_name')}
                  placeholder="Ej: Mi Tienda Online"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={storeInfo.store_description}
                    onChange={handleChange('store_description')}
                    placeholder="Breve descripción de tu tienda..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Contacto */}
          <Card>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Información de Contacto
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Dirección"
                  value={storeInfo.store_address}
                  onChange={handleChange('store_address')}
                  placeholder="Ej: Calle Principal #123"
                />
                <Input
                  label="Teléfono"
                  value={storeInfo.store_phone}
                  onChange={handleChange('store_phone')}
                  placeholder="Ej: +1 234 567 8900"
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={storeInfo.store_email}
                  onChange={handleChange('store_email')}
                  placeholder="Ej: contacto@mitienda.com"
                />
                <Input
                  label="Horario de Atención"
                  value={storeInfo.store_schedule}
                  onChange={handleChange('store_schedule')}
                  placeholder="Ej: Lun-Vie 9:00-18:00"
                />
              </div>
            </div>
          </Card>

          {/* Redes Sociales */}
          <Card>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Redes Sociales
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Facebook"
                  value={storeInfo.store_facebook}
                  onChange={handleChange('store_facebook')}
                  placeholder="Ej: https://facebook.com/mitienda"
                />
                <Input
                  label="Instagram"
                  value={storeInfo.store_instagram}
                  onChange={handleChange('store_instagram')}
                  placeholder="Ej: @mitienda"
                />
                <Input
                  label="WhatsApp"
                  value={storeInfo.store_whatsapp}
                  onChange={handleChange('store_whatsapp')}
                  placeholder="Ej: +1 234 567 8900"
                />
              </div>
            </div>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Guardar Información
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
