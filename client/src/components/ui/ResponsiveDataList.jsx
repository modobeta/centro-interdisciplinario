import styles from './ui.module.css'

export default function ResponsiveDataList({ items, fields, getKey = (item) => item.id, actions }) {
  return <div className={styles.mobileList}>{items.map((item) => <article className={styles.dataCard} key={getKey(item)}>{fields.map((field) => <div className={styles.dataRow} key={field.label}><strong>{field.label}</strong><span>{field.render ? field.render(item) : item[field.key] ?? '—'}</span></div>)}{actions?.(item)}</article>)}</div>
}

