import { useCallback, useReducer, useState } from 'react';
import { Table, TableRow, TableCell, TableHead, TableBody } from '@mui/material';
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const formatCnpj = (value) => {
  const d = (value || '').replace(/\D/g, '');
  return d.length === 14 ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : d;
};

const TenantsPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async (signal) => {
    const response = await fetchOrThrow('/api/tenants', { signal });
    setItems(await response.json());
    setLoading(false);
  }, []);

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setLoading(true);
      await loadItems(signal);
    },
    [reloadKey, loadItems],
  );

  const keyword = searchKeyword.toLowerCase();
  const filteredItems = items.filter((item) => (item.name || '').toLowerCase().includes(keyword));

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsTenants']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('tenantDocument')}</TableCell>
            <TableCell>{t('tenantCity')}</TableCell>
            <TableCell>{t('sharedDisabled')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{formatCnpj(item.document)}</TableCell>
              <TableCell>{[item.city, item.state].filter(Boolean).join('/')}</TableCell>
              <TableCell>{item.disabled ? t('sharedYes') : t('sharedNo')}</TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/tenant"
                  endpoint="tenants"
                  onReload={reload}
                />
              </TableCell>
            </TableRow>
          ))}
          {loading && <TableShimmer columns={5} endAction />}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/tenant" />
    </PageLayout>
  );
};

export default TenantsPage;
