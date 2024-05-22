/**
 * Affiche les paramètres supplémentaires pour la visualisation des parasites sous la forme d'un popup
 */
function afficherParametresParasites() {
    if (contenuFichier !== '') {
        fermerPopupParametres();

        let estFichierDat = true;
        if (contenuCalibrat.split('\n')[0].includes('FluoriGraphix')) {
            estFichierDat = false;
        }

        console.log(estFichierDat);

        if (traceurs.length === 0) {
            init(estFichierDat, false);
        }

        let overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '1000';
        document.body.appendChild(overlay);

        document.body.style.overflowY = 'hidden';

        let message = '';

        if (contenuCalibrat === '') {
            message = '<span class="calibratAbsent"><img src="Ressources/img/attentionOrange.png" alt="Perte de connexion">Aucun fichier de calibration n\'a été importé. <input type="file" id="inputCalibrat" accept=".dat,.csv" onchange="initParasites()"></span>';
        }

        let popupHTML = "";
        popupHTML += `
        <div class='grandPopup'>
            <div class="entete">
                <h2>Paramètres supplémentaires</h2>
                <img src="Ressources/img/close.png" class="close" onclick="fermerPopupParametres()" alt="fermer">
            </div>
            ${message}
            
        <div class="ongletsParam">
            <div class="bouton boutonFonce" onclick="afficherOngletParametre(1)">Renommer les courbes</div>
            <div class="bouton boutonFonce" onclick="afficherOngletParametre(2)">Corriger la turbidité</div>
            <div class="bouton boutonFonce" onclick="afficherOngletParametre(3)">Convertir en concentrations</div>
        </div>
        
        <div class="ongletParam onglet1" id="1">`;


        if (calibrationEstLieGraphiques()) {
            popupHTML += `<img src="Ressources/img/goodNew.png" alt="Succès"><h4>Les courbes ont été liées aux labels du fichier de calibration automatiquement. Aucune action n'est requise de votre part.</h4>`;
        } else {
            popupHTML += `
            <h4>Veuillez lier les labels du fichier de calibration à des courbes :</h4>
            <table class="">
                <tr>
                    <th>Label</th>
                    <th>Courbe</th>
                </tr>`;

            for (let i = 0; i < traceurs.length; i++) {
                const traceur = traceurs[i];
                if (isNaN(traceur.lampePrincipale)) {
                    continue;
                }
                console.log(traceur);

                popupHTML += `
                <tr>
                    <td>L${traceur.lampePrincipale}</td>
                    <td>
                        <select onchange="remplacerDonneesFichier(this.value, 'L${traceur.lampePrincipale}')">
                        <option value="" selected disabled>Sélectionner</option>
                            `;
                const lignes = contenuFichier.split('\n');
                const header = lignes[2].split(';').splice(2);

                for (let j = 0; j < header.length; j++) {
                    popupHTML += `<option value="${header[j]}">${header[j]}</option>`;
                }

                popupHTML += `
                        </select>
                    </td>
                </tr>`;
            }

            popupHTML += `</table>
            `;
        }

        popupHTML += `
        </div>
        
        <div class="ongletParam" id="2">
            2
        </div>
        
        <div class="ongletParam" id="3">
            3
        </div>
        
        <div class="conteneurBoutons"><div class="boutonFonce bouton">TERMINER</div></div>
    </div>`;
        overlay.innerHTML += popupHTML;
        afficherOngletParametre(1);
    }
}


/**
 * Ferme le popup des paramètres
 */
function fermerPopupParametres() {
    if (document.querySelector('.grandPopup') !== null) {
        document.querySelector('.grandPopup').remove();
        document.body.style.overflow = 'auto';
    }
    if (document.querySelector('div[style*="z-index: 1000"]') !== null) {
        document.querySelector('div[style*="z-index: 1000"]').remove();
    }
}


/**
 * Lit le fichier de calibration et initialise les données, sans afficher les tableaux et les courbes de la partie calibration
 */
function initParasites() {
    const inputFichier = document.getElementById('inputCalibrat');
    const reader = new FileReader();
    reader.readAsText(inputFichier.files[0]);

    let estFichierDat = false;

    if (inputFichier.files[0].name.split('.').pop() === "dat") {
        estFichierDat = true;
    }

    reader.onload = function () {
        contenuCalibrat = supprimerPointsVirgulesSiPlusieurs(reader.result);
        init(estFichierDat, false);
        afficherMessageFlash("Fichier Calibrat.dat importé avec succès.", 'success');
        document.querySelector('.calibratAbsent').remove();
    };

    fermerPopupParametres();
    setTimeout(() => {
        afficherParametresParasites();
    }, 500);

}


/**
 * Tente de lier automatiquement les labels des courbes aux labels des lampes du fichier de calibration.
 */
function calibrationEstLieGraphiques() {
    const lignes = contenuFichier.split('\n');
    const header = lignes[2].split(';').splice(2);

    let headerCalibrat = [];

    for (let i = 0; i < traceurs.length; i++) {
        const traceur = traceurs[i];

        if (traceur.lampePrincipale !== '') {
            headerCalibrat.push('L' + traceur.lampePrincipale);
        }
    }

    let estIdentique = true;
    for (let i = 0; i < headerCalibrat.length; i++) {

        if (headerCalibrat[i] === 'LNaN') {
            continue;
        }

        if (!header.includes(headerCalibrat[i])) {
            estIdentique = false;
        }
    }

    return estIdentique;
}


/**
 * Affiche l'onglet correspondant aux paramètres supplémentaires de visualisation
 * @param idOnglet ID de l'onglet à afficher
 */
function afficherOngletParametre(idOnglet) {
    const onglets1 = document.querySelectorAll('.ongletsParam .bouton');

    for (let i = 0; i < onglets1.length; i++) {
        onglets1[i].classList.remove('active');
    }
    onglets1[idOnglet - 1].classList.add('active');

    const onglets = document.querySelectorAll('.ongletParam');

    for (let i = 0; i < onglets.length; i++) {
        onglets[i].style.display = 'none';
    }
    onglets[idOnglet - 1].style.display = 'flex';
}


/**
 * Remplace une suite de caractère par une autre dans contenuFichier, et affiche à nouveau le graphique à partir de ces nouvelles données
 * @param ancien Ancien label à remplacer
 * @param nouveau Nouveau label à ajouter
 */
function remplacerDonneesFichier(ancien, nouveau) {
    let lignes = contenuFichier.split('\n');
    let header = lignes[2].split(';');

    for (let i = 0; i < header.length; i++) {
        if (header[i] === ancien) {
            header[i] = nouveau;
        }

        if (header[i] === 'L' + ancien) {
            header[i] = 'L' + nouveau;
        }
    }

    lignes[2] = header.join(';');

    contenuFichier = lignes.join('\n');
    afficherGraphique(contenuFichier);

    if (calibrationEstLieGraphiques()) {
        document.querySelector('.onglet1').innerHTML = `<img src="Ressources/img/goodNew.png" alt="Succès"> <h4>Les courbes ont été liées aux labels du fichier de calibration avec succès.</h4>`;
    }
}