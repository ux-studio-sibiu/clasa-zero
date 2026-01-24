

import Link from 'next/link';
import './page.scss';

export default async function Home() {

  return (
    <div className = {`nsc--page-index clearfix `}>

        <Link href={`/game`} id="start-game" className="btn btn-primary margin-0-auto">Start</Link>

      </div>
  );
}