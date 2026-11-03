import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RouterIcon from '@mui/icons-material/Router';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import PasswordField from '../common/components/PasswordField';
import EditItemView from './components/EditItemView';
import FieldTip from './components/FieldTip';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator, useManager } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const vehicleTypes = [
  'SUV',
  'HATCH',
  'SEDAN',
  'PICAPE',
  'UTILITÁRIO',
  'MOTO',
  'CAMINHÃO',
  'ÔNIBUS',
  'OUTRO',
];

const deviceImageSlots = [
  {
    slot: 'tracker',
    attribute: 'trackerImage',
    label: 'Rastreador',
    hint: 'Mostrando IMEI e senha',
    tip: 'Foto do rastreador mostrando o IMEI e a senha. Máx. 500 KB (jpg, png, gif ou webp). Salvo em attributes.trackerImage.',
  },
  {
    slot: 'plate',
    attribute: 'plateImage',
    label: 'Rastreador + placa',
    hint: 'Rastreador junto da placa',
    tip: 'Foto do rastreador junto da placa do veículo. Máx. 500 KB (jpg, png, gif ou webp). Salvo em attributes.plateImage.',
  },
  {
    slot: 'odometer',
    attribute: 'odometerImage',
    label: 'Painel (odômetro)',
    hint: 'Painel exibindo o odômetro',
    tip: 'Foto do painel do veículo exibindo o odômetro. Máx. 500 KB (jpg, png, gif ou webp). Salvo em attributes.odometerImage.',
  },
];

const fullRow = { gridColumn: '1 / -1' };

const CopyButton = ({ value }) => {
  const t = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value ?? ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Tooltip title={copied ? 'Copiado!' : t('sharedCopy')}>
      <span>
        <IconButton size="small" onClick={handleCopy} disabled={value == null || value === ''}>
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

const Section = ({ icon, title, subtitle, columns = 2, children }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', color: 'primary.main' }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, minmax(0, 1fr))` },
      }}
    >
      {children}
    </Box>
  </Paper>
);

const PhotoSlot = ({ label, hint, tip, fileName, onChange }) => {
  const inputRef = useRef(null);

  return (
    <FieldTip title={tip}>
      <Box
        sx={{
          border: 1,
          borderColor: fileName ? 'primary.main' : 'divider',
          borderStyle: fileName ? 'solid' : 'dashed',
          borderRadius: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 0.5,
          height: '100%',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(event) => {
            onChange(event.target.files?.[0] || null);

            event.target.value = '';
          }}
        />
        <PhotoCameraIcon color={fileName ? 'primary' : 'disabled'} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
        {fileName && (
          <Chip
            size="small"
            label={fileName}
            onDelete={() => onChange(null)}
            deleteIcon={<CloseIcon />}
            sx={{ maxWidth: '100%', mt: 0.5 }}
          />
        )}
        <Button
          size="small"
          variant={fileName ? 'text' : 'outlined'}
          startIcon={<FileUploadIcon />}
          onClick={() => inputRef.current?.click()}
          sx={{ mt: 'auto' }}
        >
          {fileName ? 'Trocar' : 'Enviar'}
        </Button>
      </Box>
    </FieldTip>
  );
};

const DevicePage = () => {
  const t = useTranslation();

  const manager = useManager();
  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [searchParams] = useSearchParams();
  const uniqueId = searchParams.get('uniqueId');

  const [item, setItem] = useState(uniqueId ? { uniqueId } : null);
  const [showQr, setShowQr] = useState(false);

  const handleFileInput = useCatch(async (slot, attribute, newFile) => {
    if (newFile && item?.id) {
      const response = await fetchOrThrow(`/api/devices/${item.id}/image?slot=${slot}`, {
        method: 'POST',
        body: newFile,
      });
      setItem({ ...item, attributes: { ...item.attributes, [attribute]: await response.text() } });
    } else if (!newFile) {
      // eslint-disable-next-line no-unused-vars
      const { [attribute]: removed, ...remainingAttributes } = item.attributes || {};
      setItem({ ...item, attributes: remainingAttributes });
    }
  });

  const setAttribute = (key, value) =>
    setItem({
      ...item,
      attributes: { ...item.attributes, [key]: value },
    });

  const requiredSx = { '& .MuiFormLabel-asterisk': { color: 'error.main' } };

  const validate = () =>
    item &&
    item.name &&
    item.uniqueId &&
    item.attributes?.devicePassword &&
    item.attributes?.imeiSecundario;

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
      maxWidth="md"
    >
      {item && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5" noWrap sx={{ minWidth: 0, fontWeight: 600 }}>
                    {item.name || t('sharedDevice')}
                  </Typography>
                  {item.name && <CopyButton value={item.name} />}
                </Box>
                {item.id && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {`ID do dispositivo: ${item.id}`}
                    </Typography>
                    <CopyButton value={item.id} />
                  </Box>
                )}
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                {item.disabled && <Chip size="small" color="warning" label={t('sharedDisabled')} />}
                <FieldTip title="Com o device desativado, o servidor ignora as mensagens dele. Campo disabled.">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(item.disabled)}
                        onChange={(event) => setItem({ ...item, disabled: event.target.checked })}
                      />
                    }
                    label={t('sharedDisabled')}
                    disabled={!manager}
                  />
                </FieldTip>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeIcon />}
                  onClick={() => setShowQr(true)}
                >
                  {t('sharedQrCode')}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Section
            icon={<RouterIcon />}
            title={t('sharedDeviceInfo')}
            subtitle="Identificação e credenciais do rastreador"
          >
            <Box sx={fullRow}>
              <FieldTip title="Nome de exibição do device no mapa, listas e relatórios. Campo name.">
                <TextField
                  value={item.name || ''}
                  onChange={(event) => setItem({ ...item, name: event.target.value })}
                  label={t('sharedName')}
                  required
                  sx={requiredSx}
                />
              </FieldTip>
            </Box>
            <FieldTip title="ID que o rastreador envia no cabeçalho das mensagens. É por ele que a Localize-C associa as posições a este device. MV730G: IMEI. MV710G/MV710N: ID do rastreador. Precisa ser único. Campo uniqueId.">
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
                required
                sx={requiredSx}
                disabled={Boolean(uniqueId)}
              />
            </FieldTip>
            <FieldTip title="IMEI de 15 dígitos do módulo celular do rastreador. No MV730G é o mesmo valor do Identificador. Salvo em attributes.imeiSecundario.">
              <TextField
                value={item.attributes?.imeiSecundario || ''}
                onChange={(event) => setAttribute('imeiSecundario', event.target.value)}
                label="IMEI"
                required
                sx={requiredSx}
              />
            </FieldTip>
            <FieldTip title="Senha do rastreador usada nos comandos por SMS (ex.: adminip123456,host:porta). Padrão de fábrica: 123456. Fica em texto puro em attributes.devicePassword.">
              <PasswordField
                value={item.attributes?.devicePassword || ''}
                onChange={(event) => setAttribute('devicePassword', event.target.value)}
                label="Senha"
                autoComplete="new-password"
                required
                sx={requiredSx}
              />
            </FieldTip>
            <FieldTip title="Número do chip (SIM) instalado no rastreador. Campo phone.">
              <TextField
                value={item.phone || ''}
                onChange={(event) => setItem({ ...item, phone: event.target.value })}
                label={t('sharedPhone')}
              />
            </FieldTip>
          </Section>

          <Section
            icon={<BusinessIcon />}
            title="Organização"
            subtitle="Grupo, cliente e instalação"
          >
            <FieldTip title="Grupo do device. O device herda permissões e atributos do grupo. Campo groupId.">
              <SelectField
                value={item.groupId}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
              />
            </FieldTip>
            {admin && (
              <FieldTip title="Tenant (cliente/empresa) ao qual o device pertence. Vazio = sem tenant. Somente administradores podem alterar. Campo tenantId.">
                <SelectField
                  value={item.tenantId || null}
                  onChange={(event) =>
                    setItem({ ...item, tenantId: Number(event.target.value) || 0 })
                  }
                  endpoint="/api/tenants"
                  label={t('sharedTenant')}
                />
              </FieldTip>
            )}
            <FieldTip title="Data de instalação do rastreador. Campo installationDate.">
              <TextField
                type="date"
                value={item.installationDate ? item.installationDate.split('T')[0] : ''}
                onChange={(e) =>
                  setItem({
                    ...item,
                    installationDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                label={t('deviceInstallationDate')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </FieldTip>
          </Section>

          <Section
            icon={<DirectionsCarIcon />}
            title={t('sharedVehicleInfo')}
            subtitle="Dados do veículo onde o rastreador está instalado"
          >
            <FieldTip title="Placa do veículo. Campo plate.">
              <TextField
                value={item.plate || ''}
                onChange={(event) => setItem({ ...item, plate: event.target.value })}
                label={t('devicePlate')}
              />
            </FieldTip>
            <FieldTip title="Chassi do veículo. Campo chassis.">
              <TextField
                value={item.chassis || ''}
                onChange={(event) => setItem({ ...item, chassis: event.target.value })}
                label={t('deviceChassis')}
              />
            </FieldTip>
            <FieldTip title="Fabricante do veículo. Campo manufacturer.">
              <TextField
                value={item.manufacturer || ''}
                onChange={(event) => setItem({ ...item, manufacturer: event.target.value })}
                label={t('deviceManufacturer')}
              />
            </FieldTip>
            <FieldTip title="Modelo do veículo. Campo model.">
              <TextField
                value={item.model || ''}
                onChange={(event) => setItem({ ...item, model: event.target.value })}
                label={t('deviceModel')}
              />
            </FieldTip>
            <FieldTip title="Tipo de carroceria do veículo. Campo vehicleType.">
              <SelectField
                value={item.vehicleType || null}
                onChange={(event) => setItem({ ...item, vehicleType: event.target.value })}
                data={vehicleTypes.map((type) => ({ id: type, name: type }))}
                label={t('deviceVehicleType')}
              />
            </FieldTip>
            <FieldTip title="Cor do veículo. Campo color.">
              <TextField
                value={item.color || ''}
                onChange={(event) => setItem({ ...item, color: event.target.value })}
                label={t('deviceColor')}
              />
            </FieldTip>
            <FieldTip title="Ano de fabricação do veículo. Campo manufactureYear.">
              <TextField
                type="number"
                value={item.manufactureYear ?? ''}
                onChange={(event) =>
                  setItem({
                    ...item,
                    manufactureYear: event.target.value ? Number(event.target.value) : null,
                  })
                }
                label={t('deviceManufactureYear')}
              />
            </FieldTip>
            <FieldTip title="Ano do modelo do veículo. Campo modelYear.">
              <TextField
                type="number"
                value={item.modelYear ?? ''}
                onChange={(event) =>
                  setItem({
                    ...item,
                    modelYear: event.target.value ? Number(event.target.value) : null,
                  })
                }
                label={t('deviceModelYear')}
              />
            </FieldTip>
          </Section>

          <Section
            icon={<PhotoCameraIcon />}
            title={t('sharedDevicePhotos')}
            subtitle="Máx. 500 KB por foto (jpg, png, gif ou webp)"
            columns={3}
          >
            {item.id ? (
              deviceImageSlots.map(({ slot, attribute, label, hint, tip }) => (
                <PhotoSlot
                  key={slot}
                  label={label}
                  hint={hint}
                  tip={tip}
                  fileName={item.attributes?.[attribute]}
                  onChange={(file) => handleFileInput(slot, attribute, file)}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={fullRow}>
                Salve o dispositivo para poder enviar as fotos.
              </Typography>
            )}
          </Section>

          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
          />
        </Stack>
      )}
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </EditItemView>
  );
};

export default DevicePage;
