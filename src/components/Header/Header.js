import React from "react";
import styles from "./Header.module.css";

const Header = () => (
    <div className={styles.container}>
        <p className={styles.caps}>платформа візуалізації алгоритмів пошуку шляху на площині</p>
        <p>Курсова робота Коржової Єлизавети Валеріївни</p>
    </div>
);

export default Header;
