

import Link from 'next/link';
import styles from './page.module.scss';

export default async function Home() {

  return (
    <div className = {`${styles['namespace-container']} clearfix `}>

        <Link href={`/game`} id="start-game" className="btn btn-primary margin-0-auto">Start</Link>

      </div>
  );
}