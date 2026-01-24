import { useNavigate } from 'react-router-dom';

export default function Navigation({ onNavigate }) {
  const navigate = useNavigate();

  const links = [
    { path: '/', label: 'Главная' },
    { path: '/map', label: 'Карта' },
    { path: '/objects', label: 'Объекты' },
    { path: '/architects', label: 'Архитекторы' },
    { path: '/mosaics', label: 'Мозаики' },
    { path: '/about', label: 'О проекте' },
    { path: '/admin', label: 'Админка' },
  ];

  return (
    <ul className="nav-links">
      {links.map((link) => (
        <li key={link.path}>
          <a
            onClick={() => {
              navigate(link.path);
              if (onNavigate) onNavigate();
            }}
            href="#!"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
