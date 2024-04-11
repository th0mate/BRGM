/**
 * Permet de charger un fichier texte et de le lire
 * @param fichier le fichier à charger
 * @param callback la fonction à appeler une fois le fichier chargé
 */
function chargerTexteFichier(fichier, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        callback(e.target.result);
    };
    reader.readAsText(fichier);
}



/**
 * Convertit un fichier texte en fichier .mv
 * @param texte le contenu du fichier texte
 * @returns {string} le contenu du fichier .mv
 */
function convertirTexteenMV(texte) {
    const lignes = texte.split('\n');
    lignes.splice(0, 1);

    let stringFinal = "";

    if (nbLignes === 0) {
        stringFinal =  `                   FluoriGraphix - Export du ${getDateAujourdhui()} - Signaux en mV\n`;
        stringFinal += "                           -------------------------------------------\n";
        stringFinal += "    #  Time             R  Tracer 1  Tracer 2  Tracer 3 Turbidity  Baseline Battery V     T    Conductiv\n";
    }

    for (let i = 1; i < lignes.length; i++) {

        if (lignes[i].length < 3 || /^\s+$/.test(lignes[i]) || /^\t+$/.test(lignes[i])) {
            continue;
        }

        const colonnes = lignes[i].split('\t');
        const timeValue = lignes[i].substring(3, 32);
        const a145Value = colonnes[3];
        const a146Value = colonnes[4];
        const a147Value = colonnes[5];
        const a148Value = colonnes[6];
        const a144Value = colonnes[7];
        const a149Value = colonnes[8];
        const a150Value = colonnes[9];
        const a151Value = colonnes[10];

        if (getTime(timeValue) === "NaN/NaN/N-NaN:NaN:NaN") {
            problemes = true;
            continue;
        }

        if (i === 0) {
            premiereDate = getTime(timeValue);
        }

        stringFinal += ` ${setEspaces(i, 4)} ${getTime(timeValue)} 0   ${setEspaces(around(a145Value), 5)}     ${setEspaces(around(a146Value), 5)}     ${setEspaces(around(a147Value), 5)}    ${setEspaces(around(a148Value), 5)}     ${setEspaces(around(a144Value), 5)}     ${setEspaces(around(a149Value), 5)}     ${setEspaces(around(a150Value), 5)}    ${setEspaces(around(a151Value), 5)}\n`;
    }

    if (problemes) {
        afficherMessageFlash('Certaines données sont corrompues : erreur de dates', 'warning');
    }

    return stringFinal;
}