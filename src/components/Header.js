import React from "react";
import logo from '../images/logo.svg'
import {Link, Route} from 'react-router-dom';

function Header({userEmail, onSignOut}) {
    return (
        <header className="header">
        <img className="header__logo" src={logo} alt="Логотип Место" />
        <Route path="/sign-in">
        <Link to="sign-up" className="header__link">
          Регистрация
        </Link>
      </Route>
      <Route path="/sign-up">
        <Link to="sign-in" className="header__link">
          Войти
        </Link>
      </Route>
      <Route exact path="/">
        <div className="header__container">
          <p className="header__email">{userEmail}</p>
          <Link to="sign-in" className="header__exit" onClick={onSignOut}>
            Выйти
          </Link>
        </div>
      </Route>
    </header>
    )
}

export default Header