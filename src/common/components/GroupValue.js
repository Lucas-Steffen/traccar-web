import { useSelector } from 'react-redux';

const GroupValue = ({ groupId }) => {
  const group = useSelector((state) => state.groups.items[groupId]);

  return group?.name || '';
};

export default GroupValue;
