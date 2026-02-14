import { useState, useEffect } from 'react';
import { Card, Button, Input, Alert } from '../../components/ui';
import { settingsService } from '../../services';
import type { AppSettings } from '../../interfaces';

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    min_stock_alert: 10,
    admin_whatsapp: '',
    invoice_prefix: 'FAC-',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getAppSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la configuración');
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
      await settingsService.updateMultiple(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)}>
          Configuración guardada correctamente
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Inventario */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Inventario</h2>
            <div className="space-y-4">
              <Input
                label="Alerta de stock mínimo"
                type="number"
                min="1"
                value={settings.min_stock_alert}
                onChange={(e) =>
                  setSettings({ ...settings, min_stock_alert: parseInt(e.target.value) || 10 })
                }
                helperText="Los productos con stock menor a este valor aparecerán como 'stock bajo'"
              />
            </div>
          </Card>

          {/* Facturación */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Facturación</h2>
            <div className="space-y-4">
              <Input
                label="Prefijo de facturas"
                value={settings.invoice_prefix}
                onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                placeholder="FAC-"
                helperText="Prefijo que se usará para generar números de factura (ej: FAC-0001)"
              />
            </div>
          </Card>

          {/* Contacto */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Contacto</h2>
            <div className="space-y-4">
              <Input
                label="WhatsApp del administrador"
                value={settings.admin_whatsapp}
                onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
                placeholder="+1234567890"
                helperText="Número de WhatsApp para recibir notificaciones (incluir código de país)"
              />
            </div>
          </Card>

          {/* Botón guardar */}
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving} size="lg">
              Guardar Configuración
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
