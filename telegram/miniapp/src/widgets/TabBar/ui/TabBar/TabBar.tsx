import { ReactNode } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { tabs } from 'shared/const/tabs';
import classNames from 'shared/library/ClassNames/classNames';
import s from './TabBar.module.scss';

export interface TabProps {
  title: string;
  path: string;
  icon: ReactNode;
}

const Tab = (props: TabProps) => {
  const { title, path, icon } = props;
  const match = useMatch(path);

  return (
    <NavLink to={path} className={classNames(s.tab, { [s.active]: !!match })}>
      <div className={s.tabContent}>
        {icon}
        <span className={s.tabLabel}>{title}</span>
      </div>
    </NavLink>
  );
};

export const TabBar = () => {

  return (
    <div className={s.container}>
      <nav className={s.tabbar}>
        {tabs.map((tab) => (
          <Tab key={tab.path} {...tab} />
        ))}
      </nav>
    </div>
  );
};
