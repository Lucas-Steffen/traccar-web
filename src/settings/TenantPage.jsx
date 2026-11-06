import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import EditItemView from './components/EditItemView';
import FieldTip from './components/FieldTip';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';
import { useAsyncTask } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { formatStatus } from '../common/util/formatter';

const LINKS_LIMIT = 50;

const onlyDigits = (value) => (value || '').replace(/\D/g, '').slice(0, 14);

const formatCnpj = (value) => {
  const d = onlyDigits(value);
  let result = d.slice(0, 2);
  if (d.length > 2) result += `.${d.slice(2, 5)}`;
  if (d.length > 5) result += `.${d.slice(5, 8)}`;
  if (d.length > 8) result += `/${d.slice(8, 12)}`;
  if (d.length > 12) result += `-${d.slice(12, 14)}`;
  return result;
};

const parseNumber = (value) => (value === '' || Number.isNaN(Number(value)) ? null : Number(value));

const TenantLinks = ({ tenantId }) => {
  const t = useTranslation();
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);

  useAsyncTask(
    async ({ signal }) => {
      const [devicesResponse, usersResponse] = await Promise.all([
        fetchOrThrow('/api/devices', { signal }),
        fetchOrThrow('/api/users', { signal }),
      ]);
      const [allDevices, allUsers] = await Promise.all([
        devicesResponse.json(),
        usersResponse.json(),
      ]);
      setDevices(allDevices.filter((it) => it.tenantId === tenantId));
      setUsers(allUsers.filter((it) => it.tenantId === tenantId));
    },
    [tenantId],
  );

  const renderList = (title, items, path, primary, secondary) => (
    <>
      <Typography variant="subtitle2">{`${title} (${items.length})`}</Typography>
      {items.length === 0 && <Typography variant="body2">{t('tenantNoLinks')}</Typography>}
      <List dense disablePadding>
        {items.slice(0, LINKS_LIMIT).map((it) => (
          <ListItemButton key={it.id} onClick={() => navigate(`${path}/${it.id}`)}>
            <ListItemText primary={primary(it)} secondary={secondary(it)} />
          </ListItemButton>
        ))}
      </List>
      {items.length > LINKS_LIMIT && (
        <Typography variant="body2">{`+${items.length - LINKS_LIMIT}`}</Typography>
      )}
    </>
  );

  return (
    <>
      {renderList(
        t('tenantDevices'),
        devices,
        '/settings/device',
        (it) => it.name,
        (it) => `${it.uniqueId} - ${formatStatus(it.status, t)}`,
      )}
      {renderList(
        t('tenantUsers'),
        users,
        '/settings/user',
        (it) => it.name,
        (it) => it.email,
      )}
    </>
  );
};

const TenantPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const validate = () => item && item.name;

  const text = (field, label, tip, extra = {}) => (
    <FieldTip title={tip}>
      <TextField
        value={item[field] ?? ''}
        onChange={(event) => setItem({ ...item, [field]: event.target.value })}
        label={label}
        {...extra}
      />
    </FieldTip>
  );

  const numeric = (field, label, tip, step) => (
    <FieldTip title={tip}>
      <TextField
        type="number"
        value={item[field] ?? ''}
        onChange={(event) => setItem({ ...item, [field]: parseNumber(event.target.value) })}
        label={label}
        slotProps={{ htmlInput: { step } }}
      />
    </FieldTip>
  );

  return (
    <EditItemView
      endpoint="tenants"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsTenant']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('tenantCompanySection')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <FieldTip title="Nome do tenant (cliente/empresa). Usuários e devices vinculados a ele ficam isolados dos demais tenants. Campo name.">
                <TextField
                  value={item.name || ''}
                  onChange={(event) => setItem({ ...item, name: event.target.value })}
                  label={t('sharedName')}
                  required
                  sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
                />
              </FieldTip>
              {text('legalName', t('tenantLegalName'), 'Razão social da empresa. Campo legalName.')}
              <FieldTip title="CNPJ da empresa. É digitado com máscara e enviado somente com os 14 dígitos; o servidor valida os dígitos verificadores. Campo document.">
                <TextField
                  value={formatCnpj(item.document)}
                  onChange={(event) =>
                    setItem({ ...item, document: onlyDigits(event.target.value) })
                  }
                  label={t('tenantDocument')}
                  placeholder="00.000.000/0000-00"
                />
              </FieldTip>
              {text('email', t('tenantEmail'), 'E-mail de contato da empresa. Campo email.', {
                type: 'email',
              })}
              {text('phone', t('tenantPhone'), 'Telefone de contato. Campo phone.')}
              {text(
                'contactName',
                t('tenantContactName'),
                'Nome da pessoa de contato. Campo contactName.',
              )}
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('tenantAddressSection')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              {text('zipCode', t('tenantZipCode'), 'CEP. Campo zipCode.')}
              {text('street', t('tenantStreet'), 'Logradouro. Campo street.')}
              {text('streetNumber', t('tenantStreetNumber'), 'Número. Campo streetNumber.')}
              {text('complement', t('tenantComplement'), 'Complemento. Campo complement.')}
              {text('district', t('tenantDistrict'), 'Bairro. Campo district.')}
              {text('city', t('tenantCity'), 'Cidade. Campo city.')}
              {text('state', t('tenantState'), 'Estado (UF). Campo state.')}
              {numeric(
                'baseLatitude',
                t('tenantBaseLatitude'),
                'Latitude da base, de -90 a 90. Campo baseLatitude.',
                'any',
              )}
              {numeric(
                'baseLongitude',
                t('tenantBaseLongitude'),
                'Longitude da base, de -180 a 180. Campo baseLongitude.',
                'any',
              )}
              {numeric(
                'baseRadius',
                t('tenantBaseRadius'),
                'Raio da base em metros (opcional). Campo baseRadius.',
                1,
              )}
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedExtra')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <FieldTip title="Com o tenant desativado, seus usuários e devices ficam sem acesso. Campo disabled.">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(item.disabled)}
                      onChange={(event) => setItem({ ...item, disabled: event.target.checked })}
                    />
                  }
                  label={t('sharedDisabled')}
                />
              </FieldTip>
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{}}
          />
          {item.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('tenantLinksSection')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TenantLinks tenantId={item.id} />
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
    </EditItemView>
  );
};

export default TenantPage;
