import { styles } from "@components/Card";

interface Props {
  href: string;
  title: string;
}

export default function ExternalPost({ href, title }: Props) {
  return (
    <li className={styles.cardContainer}>
      <a
        href={href}
        className={styles.titleLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <h3 className={styles.titleHeading}>{title}</h3>
      </a>
    </li>
  );
}
