/**
 * Ce fichier JavaScript permet de gérer toutes les interactions possibles avec la page "documentation" du site.
 */


/**
 * Ferme le bandeau de sommaire
 */
function fermerSommaire() {
    if (document.querySelector('.bandeauDocumentation') && document.querySelector('.bandeauDocumentation').style.display === "flex") {
        document.querySelector('.bandeauDocumentation').style.display = "none";
    }
}


/**
 * Ouvre le bandeau de sommaire
 */
function ouvrirSommaire() {
    document.querySelector('.bandeauDocumentation').style.display = "flex";
}


/**
 * Recherche parmi tous les .titreBarre ou h3 de la page celui qui correspond le plus aux caractères entrés, et place ces résultats dans le datalist
 * @param caracteres - Les caractères à rechercher
 */
function rechercher(caracteres) {
    let listeResultats = document.getElementById('listeResultats');
    listeResultats.innerHTML = "";

    let elements = document.querySelectorAll('.findable');
    let resultats = [];

    elements.forEach(element => {
        if (element.innerText.toLowerCase().includes(caracteres.toLowerCase())) {
            resultats.push(element);
        }
    });

    resultats.forEach(resultat => {
        let div = document.createElement('div');
        const texte = resultat.innerText.replace(/[0-9]/g, '');

        div.innerHTML = texte.substring(0, 100);
        div.onclick = () => {
            redirectTo(resultat, true);
        };
        listeResultats.appendChild(div);
    });
}


/**
 * Ferme la liste des résultats de recherche
 */
function quitterFocus() {
    setTimeout(() => {
        document.getElementById('listeResultats').innerHTML = "";
    }, 200);
}


/**
 * Permet de mettre en surbrillance le titre de la section correspondant à l'élément affiché sur la page
 */
function scrollDocumentation() {
    let observer;
    let sommaireElements = document.querySelectorAll('.sommaire');
    let sections = document.querySelectorAll('.section');
    observer = new IntersectionObserver((entries) => {
        let visibleSection = null;
        let h3Content = null;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let titreBarre = entry.target.querySelector('.titreBarre');
                h3Content = titreBarre ? titreBarre.innerText.trim() : null;
                visibleSection = entry.target;
            }
        });

        if (h3Content) {
            sommaireElements.forEach(element => {
                element.classList.remove('activeDoc');
            });

            let matchingSommaireElement = document.querySelector(`.sommaire[data-content="${h3Content}"]`);

            if (matchingSommaireElement) {
                matchingSommaireElement.classList.add('activeDoc');
            }
        }

    }, {root: null, threshold: 0});

    sections.forEach(section => {
        observer.observe(section);
    });
}

window.addEventListener('DOMContentLoaded', (event) => {
    scrollDocumentation();
});


