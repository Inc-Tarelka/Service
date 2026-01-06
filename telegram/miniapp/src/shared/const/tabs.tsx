import { TabProps } from 'widgets/TabBar';
import SearchIcon from 'shared/assets/tabbar-icons/search';
import PlusIcon from 'shared/assets/tabbar-icons/plus';
import NotificationIcon from 'shared/assets/tabbar-icons/notification';
import PersonIcon from 'shared/assets/tabbar-icons/person';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
export const tabs: TabProps[] = [
  {
    path: RoutePath.main,
    icon: <SearchIcon />,
  },
  {
    path: RoutePath.main,
    icon: <PlusIcon />,
  },
  {
    path: RoutePath.main,
    icon: <NotificationIcon />,
  },
  {
    path: RoutePath.profile,
    icon: <PersonIcon />,
  },
];
