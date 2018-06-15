const $list = document.getElementById('list');
const $modal = document.getElementById('modal');
const $loader = document.getElementById('loader');
const $body = document.body;
const $listPerson = document.getElementById('list-person');
const apiUrl = 'https://swapi.co/api/';

class Swapi {
  constructor() {
    this.allHeroes = [];
    this.films = [];
  }

  sendRequest(url) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.open('GET', url);
      req.onload = () => {
        if (req.status === 200) {
          resolve(JSON.parse(req.responseText));
        } else {
          reject(Error(`Didn't load successfully, Error: ${req.statusText}`));
        }
      };
      req.onerror = () => {
        reject(Error(`Didn't load successfully`));
      };
      req.send();
    });
  }

  initData() {
    return  this.sendRequest(`${apiUrl}films/`)
                .then(res => {
                  this.films = res.results.sort((a,b) => a.episode_id - b.episode_id);
                  return res.results;
                });
  }

  getHero(episodeId, cb) {
    const alreadyHero = [];
    const arrPromise = [];
    const herousLink = this.films.find(film => film.episode_id === episodeId).characters;

    herousLink.forEach(link => {
      if (!this.allHeroes.find(hero => hero.url === link)) {
        arrPromise.push(this.sendRequest(link));
      } else {
        const hero = this.allHeroes.find(hero => hero.url === link);
        alreadyHero.push(hero);
      }
    });

    Promise.all(arrPromise).then(val => {
      const doneArr = alreadyHero.concat(val);
      const sortedArr = [];

      if (arrPromise.length) {
        this.allHeroes = this.allHeroes.concat(val);
      }

      doneArr.forEach(el => {
        sortedArr.push({name: el.name, gender: el.gender });
      });

      cb(sortedArr);
    });
  }
}

const MyModule = new Swapi();

// Создание списка в DOM
MyModule.initData().then(res => {
  res.forEach(el => {
    $list.innerHTML += `
      <li>
        <img class="image" src="./assets/star-wars.jpeg" >
        <div class="info">
          <div class="first-line">
            <p class="episode">Эпизод: <span>${el.episode_id}</span></p>
            <p class="name">${el.title} </p>
          </div>
          <div class="second-line">
            <p class="prod">Режиссер:</p>
            <p class="prod prod-name">${el.producer}</p>
            <p class="date">
              <img class="calendar" src="./assets/calendar.svg" alt="">
              <span>${el.release_date}</span>
            </p>
          </div>
        </div>
        <div class="description">
          <div class="text">${el.opening_crawl}</div>
          <button type="button" episode='${el.episode_id}'>Показать персонажей</button>
        </div>
      </li>`;
  });
});

// показать модальное окно
$list.addEventListener('click', e => {
  const episodeId = e.target.getAttribute('episode');
  if (episodeId) {
    showModal(episodeId);
  }
});

// закрыть модальное окно
$modal.addEventListener('click', e => {
  if(e.target.id === 'modal-close' || e.target.id === 'modal') {
    hideModal();
  }
});

function showModal(episodeId) {
  const scrollWidth = window.innerWidth - $body.clientWidth;
  $listPerson.innerHTML = null;

  showLoader();
  $modal.classList.add('active');
  $body.classList.add('overflow');
  $body.style.paddingRight = `${scrollWidth}px`;
  MyModule.getHero(+episodeId, createContentModal);
}

function createContentModal(heroes) {
  heroes.forEach(hero => {
    $listPerson.innerHTML += `<li>
                                <p class="hero-name"> ${hero.name} </p>
                                <p class="hero-gender"> ${hero.gender} </p>
                             </li>`;
  });
  hideLoader();
}

function hideModal() {
  $modal.classList.remove('active');
  $body.classList.remove('overflow');
  $body.style.paddingRight = `0px`;
}

function showLoader() {
  $loader.classList.add('active');
}

function hideLoader() {
  $loader.classList.remove('active');
}
