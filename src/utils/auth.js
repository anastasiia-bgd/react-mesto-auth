export const BASE_URL = "https://auth.nomoreparties.co";


const handleCheckResponse = response => response.ok ? response.json() : Promise.reject(`Ошибка ${response.status}`)

export const registerUser = (password, email) => {
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({password, email})
  })
  .then(handleCheckResponse)
}; 


export const loginUser = (password, email) => {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({password, email})
  })
  .then(handleCheckResponse)
  .then((data) => {
    if (data.token) {
      localStorage.setItem('jwt', data.token)
      return data.token
    }
  })
}; 

export const checkToken = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Authorization" : `Bearer ${token}`
    }
  })
  .then(handleCheckResponse)
}; 
