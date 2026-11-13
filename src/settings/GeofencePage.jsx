import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import useGeofenceAttributes from '../common/attributes/useGeofenceAttributes';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { geofencesActions } from '../store';
import useSettingsStyles from './common/useSettingsStyles';

const geofenceTypes = [
  { id: 'MAINTENANCE', label: 'geofenceTypeMaintenance' },
  { id: 'HOME', label: 'geofenceTypeHome' },
  { id: 'CHARGING_STATION', label: 'geofenceTypeChargingStation' },
];

const GeofencePage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const geofenceAttributes = useGeofenceAttributes(t);

  const [item, setItem] = useState();

  const onItemSaved = (result) => {
    dispatch(geofencesActions.update([result]));
  };

  const validate = () => item && item.name;

  return (
    <EditItemView
      endpoint="geofences"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedGeofence']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedExtra')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.description || ''}
                onChange={(event) => setItem({ ...item, description: event.target.value })}
                label={t('sharedDescription')}
              />
              <TextField
                select
                value={item.type || ''}
                onChange={(event) => setItem({ ...item, type: event.target.value || null })}
                label={t('sharedType')}
              >
                <MenuItem value="">&nbsp;</MenuItem>
                {geofenceTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {t(type.label)}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!item.blocks}
                    onChange={(event) => setItem({ ...item, blocks: event.target.checked })}
                  />
                }
                label={t('geofenceBlocks')}
              />
              <SelectField
                value={item.calendarId}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.attributes.hide}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        attributes: { ...item.attributes, hide: e.target.checked },
                      })
                    }
                  />
                }
                label={t('sharedFilterMap')}
              />
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={geofenceAttributes}
          />
        </>
      )}
    </EditItemView>
  );
};

export default GeofencePage;
