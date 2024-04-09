/**
 * Gère le lien entre le HTML et le back
 * @type {boolean} si l'optimisation est activée ou non
 */

let isOptimise = false;
let contenuFichier = "";
let nbLignes = 0;

/**
 * Traite le fichier sélectionné par l'utilisateur et redirige le contenu du fichier vers la fonction de traitement appropriée
 */
async function traiterFichier() {
    const inputFichier = document.getElementById('fileInput');
    const fichiers = inputFichier.files;
    contenuFichier = "";
    nbLignes = 0;

    for (let i = 0; i < fichiers.length; i++) {
        const fichier = fichiers[i];

        if (nbLignes !==0) {
            contenuFichier+= "\n";
        }

        if (fichier) {
            if (fichier.name.split('.').pop() === "xml") {
                const reader = new FileReader();
                reader.readAsText(fichier);
                await new Promise((resolve) => {
                    reader.onload = function () {
                        const xmlString = reader.result;
                        const mvContent = convertirXMLenMV(xmlString);
                        contenuFichier += mvContent;
                        resolve();
                    };
                });
            } else if (fichier.name.split('.').pop() === "txt") {
                await new Promise((resolve) => {
                    chargerTexteFichier(fichier, function (txtContent) {
                        if (txtContent !== '') {
                            const mvContent = convertirTexteenMV(txtContent);
                            contenuFichier += mvContent;
                            resolve();
                        } else {
                            afficherMessageFlash("Erreur de lecture fichier TXT : fichier invalide.", 'danger');
                        }
                    });
                });

            } else if (fichier.name.split('.').pop() === "mv") {
                await new Promise((resolve) => {
                    getStringDepuisFichierMV(fichier, function (mvContent) {
                        if (mvContent !== '') {
                            contenuFichier += mvContent;
                            resolve();
                        } else {
                            afficherMessageFlash("Erreur de lecture fichier MV : fichier invalide.", 'danger');
                        }
                    });
                });
            } else {
                afficherMessageFlash("Erreur : fichier non pris en charge.", 'danger')
            }
        } else {
            afficherMessageFlash("Aucun fichier n'a été join.", 'warning');
        }
    }

    console.log(contenuFichier);
    document.querySelector('.downloadFile').style.display = 'block';
    if (contenuFichier !== "") {
        afficherGraphique(contenuFichier);
        afficherMessageFlash("Fichier traité avec succès.", 'success');
    } else {
        afficherMessageFlash("Erreur : aucune donnée exploitable.", 'danger');
    }
}


/**
 * Réinitialise le zoom du graphique comme il était d'origine
 */
function resetZoom() {
    const canvas = document.getElementById('graphique');
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.resetZoom();
        afficherMessageFlash("Zoom réinitialisé.", 'info');
    } else {
        afficherMessageFlash("Erreur générale : aucun graphique à réinitialiser.", 'danger');
    }
}


/**
 * Affiche tous les points sur le graphique si le nombre de points est inférieur à 100, sinon les masque si ce n'est pas déjà fait
 */
function displayPoints() {
    const canvas = document.getElementById('graphique');
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        const nbPoints = getNbPoints();
        if (getNbPoints() < 100) {
            existingChart.options.datasets.line.pointRadius = 3;
            existingChart.options.elements.point.display = true;
            existingChart.update();
        } else {
            if (existingChart.options.datasets.line.pointRadius !== 0) {
                existingChart.options.datasets.line.pointRadius = 0;
                existingChart.update();
            }
        }

    }
}


/**
 * Retourne le nombre de points sur le graphique affichés à l'écran, en se mettant à jour dès que le zoom sur le graphique change
 */
function getNbPoints() {
    const canvas = document.getElementById('graphique');
    const chart = Chart.getChart(canvas);

    const xAxis = chart.scales['x'];
    const yAxis = chart.scales['y'];

    const xTicks = xAxis.getTicks();
    const yTicks = yAxis.getTicks();

    const visiblePointsX = xTicks.length;

    const visiblePointsY = yTicks.length;
    return visiblePointsX * visiblePointsY;

}


/**
 * Optimise l'affichage des points sur le graphique en arrondissant les valeurs des graduations aux entiers les plus proches
 */
function optimise() {
    isOptimise = !isOptimise;
}


/**
 * Retourne si l'optimisation est activée ou non
 * @returns {boolean} si l'optimisation est activée ou non
 */
function getOptimise() {
    return isOptimise;
}


/**
 * Permet d'afficher les points ou non sur le graphique en fonction du niveau de zoom
 */
document.getElementById('graphique').onwheel = function () {
    //displayPoints();
};


/**
 * Télécharge un fichier .txt contenant le contenu de la variable globale contenuFichier
 */
function telechargerFichier() {
    if (contenuFichier !== "") {
        const element = document.createElement('a');
        const file = new Blob([contenuFichier], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = 'export-' + new Date().toLocaleString().replace(/\/|:|,|\s/g, '-') + '.mv';
        document.body.appendChild(element);
        element.click();
        afficherMessageFlash("Fichier téléchargé avec succès.", 'success');
    } else {
        afficherMessageFlash("Aucun fichier à télécharger : aucune donnée à exporter.", 'warning');
    }
}