import React from 'react';
import { useState, useEffect } from 'react'
import { useHistory, Route, Redirect } from 'react-router-dom';
import api from '../utils/Api.js';
import authApi from "../utils/authApi.js";

import Header from './Header.js'
import Footer from './Footer';
import Main from './Main.js'
import ImagePopup from './ImagePopup.js';
import CurrentUserContext from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import AddPlacePopup from './AddPlacePopup.js'
import Login from './Login.js';
import Register from './Register.js';
import ProtectedRoute from './ProtectedRoute.js'
import InfoTooltip from './InfoTooltip.js';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [isInfoTolltipSuccess, setIsInfoTolltipSuccess] = useState(false);

  const history = useHistory();

  useEffect(() => {
    api.getUserInfo()
      .then(profileInfo => setCurrentUser(profileInfo))
      .catch(err => console.log(err))

    api.getInitialCards().then(cardsData => {
      setCards(cardsData.map((card) => ({
        _id: card._id,
        name: card.name,
        link: card.link,
        likes: card.likes,
        owner: card.owner
      })))
    })
      .catch(err => console.log(err))
  }, []);

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false)
    setIsAddPlacePopupOpen(false)
    setIsEditAvatarPopupOpen(false)
    setSelectedCard({});
  }

  function handleRegisterUser(email, password) {
    authApi.registerUser(email, password)
      .then((data) => {
        if (data) {
          setIsInfoTolltipSuccess(true); // успешный вход
          history.push("/sign-in"); // перебрасываем на вход
        }
      })
      .catch((err) => {
        setIsInfoTolltipSuccess(false); // fail
        console.log(err);
      })
      .finally(() => setIsSuccessPopupOpen(true)); // в любом случае открываем попап
  }

  function handleAuthUser(email, password) {
    authApi.loginUser(email, password)
      .then((data) => {
        if (data.token) {
          setUserEmail(email);
          setLoggedIn(true);
          localStorage.setItem("jwt", data.token);
          history.push("/");
        }
      })
      .catch((err) => {
        setIsInfoTolltipSuccess(false);
        setIsSuccessPopupOpen(true);
        console.log(err);
      });
  }

  function handleSingOut() {
    localStorage.removeItem("jwt");
    setUserEmail(""); // очищаем почту
    setLoggedIn(false); // не войдено
    history.push("/sign-in"); // перебрасываем на вход
  }

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      authApi.checkToken(jwt)
        .then((data) => {
          if (data) {
            setLoggedIn(true); // войдено
            setUserEmail(data.data.email); // получаем почту
            history.push("/"); // перебрасываем в профиль
          }
        })
        .catch((err) => console.log(err));
    }
  }, [history]);

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    api.putLike(card._id, !isLiked)
      .then(newCard => setCards((
        state) => state.map(
          item => item._id === card._id ? newCard : item)))
      .catch(err => console.log(err));
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => setCards(
        state => state.filter(
          item => item._id !== card._id)))
      .catch(err => console.log(err));
  }

  function handleUpdateUser(inputData) {
    setIsLoading(true);
    api.setUserInfo(inputData)
      .then(data => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }

  function handleUpdateAvatar(avatar) {
    setIsLoading(true);
    api.changeAvatar(avatar)
      .then(data => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }

  function handleAddPlaceSubmit(inputData) {
    setIsLoading(true);
    api.addNewCard(inputData)
      .then((res) => {
        setCards([res, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__container">
          <Header userEmail={userEmail} onSignOut={handleSingOut} />
          <ProtectedRoute
            component={Main}
            onEditProfile={setIsEditProfilePopupOpen}
            onEditAvatar={setIsEditAvatarPopupOpen}
            onAddPlace={setIsAddPlacePopupOpen}
            onCardClick={setSelectedCard}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
            cards={cards}
            path="/"
          />
              {loggedIn && <Footer />}
          <Route path="/sign-up">
            <Register onRegister={handleRegisterUser}/>
          </Route>
          <Route path="/sign-in">
            <Login onLogin={handleAuthUser}/>
          </Route>
          <Route>
            {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
          </Route>
          <AddPlacePopup
            onAddPlace={handleAddPlaceSubmit}
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onLoading={isLoading}
          />

          <ImagePopup card={selectedCard} onClose={closeAllPopups} />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
            onLoading={isLoading}
          />

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onLoading={isLoading}
            onUpdateUser={handleUpdateUser}
          />
          <InfoTooltip
            name={"success"}
            onClose={closeAllPopups}
            isOpen={isSuccessPopupOpen}
            isSuccess={isInfoTolltipSuccess}
          />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );

}

export default App;
