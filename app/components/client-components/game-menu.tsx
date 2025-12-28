'use client'
import { useRef, useEffect, useState, ReactNode, PropsWithChildren } from "react"
import styles from "./game-menu.module.scss";

export default function GameMenu ({ children }: PropsWithChildren){

  const [navOpen, setNavOpen] = useState(false)

  var cssClass_navIsActive = navOpen ? "open" : '';
  var cssClass_menuIsActive = navOpen ? "active-menu" : '';

  return (

      <>
        <div className={`game-menu ${styles["namespace-container"]}`} >
          <div className={`game-menu-button ${cssClass_menuIsActive} `} 
                onClick={e => { e.preventDefault(); setNavOpen(navOpen => !navOpen); } } >
                <i>Menu</i>
                </div>

                <div id="menu-content" className={`${cssClass_navIsActive} clearfix float-left`}>
                    {children}
                </div>
        </div> 
      </>
        
  );
};

