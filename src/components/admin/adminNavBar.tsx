
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { User, Users, Briefcase, BookUser, UserCog, Activity, Upload, LogOut } from 'lucide-react';
import styles from '../../css/admin/adminNavBar.module.css';
import { getAuthState } from '../../hooks/useAuths';

// Interface for navigation items
interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const AdminNavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {logout} = getAuthState();
  const navItems: NavItem[] = [
    { label: 'My account', icon: User, route: 'account' },
    { label: 'Manage Student', icon: Users, route: 'students' },
    { label: 'Manage Staff', icon: Briefcase, route: 'staff' },
    { label: 'Manage Advisor', icon: BookUser, route: 'advisors' },
    { label: 'Manage Manager', icon: UserCog, route: 'managers' },
    { label: 'View system log and monitoring', icon: Activity, route: 'logs' },
    { label: 'Import Data', icon: Upload, route: 'import' },
  ];

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>Logo</div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {index === 1 || index === 5 ? <hr className={styles.divider} /> : null}
              <Link to={item.route} className={styles.navItem}>
                <item.icon className={styles.icon} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </React.Fragment>
          ))}
          <hr className={styles.divider} />
          <Link to="/" className={styles.logout}
            onClick={()=>logout}
          >
            <span>Log out</span>
            <LogOut className={styles.logoutIcon} aria-hidden="true" />
          </Link>
          <div className={styles.footer}>@Powered by AISEA</div>
        </nav>
      </aside>
      <Outlet/>
    </>
  );
};

export default AdminNavBar;
